/**
 * Recommendation scoring engine (Phase 11).
 *
 * Deliberately pure/synchronous and DB-agnostic: it takes plain data in and
 * returns a plain score breakdown out, so it can be unit-tested without a
 * database or the ML service running, and so the Node recommendation
 * controller and any future admin "sensitivity analysis" tool can reuse it
 * identically.
 *
 * Score = 0.27*specialtyMatch + 0.18*facilityMatch + 0.135*emergencyCapability
 *       + 0.135*resourceSuitability + 0.09*waitingTimeScore + 0.09*locationScore
 *       + 0.05*bedAvailability + 0.10*congestionScore
 *
 * All components are normalized to 0-100. Weights are configurable (not
 * hard-coded) - see DEFAULT_WEIGHTS below. If waitingTimeScore is
 * unavailable (no operational data mapped to this hospital - true for
 * ~30,268 of 30,273 hospitals per the Phase 0 audit), its weight is
 * redistributed proportionally across the remaining components rather than
 * silently treated as zero, which would unfairly penalize hospitals with no
 * operational data.
 */

const DEFAULT_WEIGHTS = {
  specialty: 0.27,
  facility: 0.18,
  emergency: 0.135,
  resource: 0.085,
  bedAvailability: 0.05,
  waitingTime: 0.09,
  location: 0.09,
  congestion: 0.1,
};

const MAX_REASONABLE_WAIT_MINUTES = 120; // waits beyond this score ~0, per admin-configurable ceiling
const MAX_REASONABLE_DISTANCE_KM = 100; // distances beyond this score ~0

function percentOverlap(required, available) {
  if (!required || required.length === 0) return { score: 100, matched: [] }; // nothing required -> trivially satisfied
  const availableLower = (available || []).map((a) => String(a).toLowerCase());
  const matched = required.filter((req) =>
    availableLower.some((a) => a.includes(String(req).toLowerCase()) || String(req).toLowerCase().includes(a))
  );
  return { score: Math.round((matched.length / required.length) * 100), matched };
}

function resourceSuitabilityScore(hospital) {
  // Unknown capacity (null totalBeds/numberDoctors) gets a neutral mid-scale
  // default with a flag - never silently treated as zero capacity.
  const bedsKnown = hospital.totalBeds !== null && hospital.totalBeds !== undefined;
  const docsKnown = hospital.numberDoctors !== null && hospital.numberDoctors !== undefined;

  if (!bedsKnown && !docsKnown) {
    return { score: 50, capacityUnknown: true };
  }
  // Simple normalized scale: 100+ beds -> full score, scaled linearly below that.
  const bedScore = bedsKnown ? Math.min(100, (hospital.totalBeds / 100) * 100) : 50;
  const docScore = docsKnown ? Math.min(100, (hospital.numberDoctors / 20) * 100) : 50;
  return { score: Math.round((bedScore + docScore) / 2), capacityUnknown: !bedsKnown || !docsKnown };
}

function waitingTimeScoreFn(expectedWaitMinutes) {
  if (expectedWaitMinutes === null || expectedWaitMinutes === undefined) return null;
  const clamped = Math.min(expectedWaitMinutes, MAX_REASONABLE_WAIT_MINUTES);
  return Math.round(100 * (1 - clamped / MAX_REASONABLE_WAIT_MINUTES));
}

function locationScoreFn(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return null;
  const clamped = Math.min(distanceKm, MAX_REASONABLE_DISTANCE_KM);
  return Math.round(100 * (1 - clamped / MAX_REASONABLE_DISTANCE_KM));
}

function congestionScoreFn(recentRecommendationCount) {
  if (recentRecommendationCount === null || recentRecommendationCount === undefined) return null;
  return Math.max(0, 100 - (recentRecommendationCount * 5));
}

function bedAvailabilityScoreFn(availabilityPercent) {
  if (availabilityPercent === null || availabilityPercent === undefined) return null;
  return Math.max(0, Math.min(100, availabilityPercent));
}

/**
 * Combines a set of already-computed 0-100 component scores with a set of
 * weights, redistributing the weight of any null (unavailable) component
 * proportionally across the available ones. Exported separately from
 * scoreHospital so the Phase 12 sensitivity-analysis endpoint can recompute
 * a total score from a Recommendation document's STORED breakdown under a
 * different weight scenario, without needing to re-run the ML models or
 * re-query hospital data.
 *
 * @param {object} componentsRaw - { specialty, facility, emergency, resource, waitingTime, location } - each 0-100 or null
 * @param {object} weights - same keys, must sum to ~1 (not strictly enforced, but expected)
 * @returns {{ score: number, effectiveWeights: object }}
 */
function combineWeightedScore(componentsRaw, weights) {
  const weightTotal = Object.values(weights).reduce((sum, weight) => sum + (weight || 0), 0);
  const normalizedWeights = weightTotal > 0
    ? Object.fromEntries(Object.entries(weights).map(([key, weight]) => [key, (weight || 0) / weightTotal]))
    : weights;
  const availableKeys = Object.keys(componentsRaw).filter((k) => componentsRaw[k] !== null && componentsRaw[k] !== undefined);
  const unavailableWeightSum = Object.keys(normalizedWeights)
    .filter((k) => componentsRaw[k] === null || componentsRaw[k] === undefined)
    .reduce((sum, k) => sum + (normalizedWeights[k] || 0), 0);
  const availableWeightSum = availableKeys.reduce((sum, k) => sum + (normalizedWeights[k] || 0), 0);

  let totalScore = 0;
  const effectiveWeights = {};
  availableKeys.forEach((key) => {
    effectiveWeights[key] = availableWeightSum > 0
      ? normalizedWeights[key] + unavailableWeightSum * (normalizedWeights[key] / availableWeightSum)
      : 0;
    totalScore += componentsRaw[key] * effectiveWeights[key];
  });

  return { score: Math.round(totalScore), effectiveWeights };
}

/**
 * @param {object} params
 * @param {object} params.hospital - { specialties, facilities, emergencyFlag, totalBeds, numberDoctors }
 * @param {string[]} params.requiredSpecialties
 * @param {string[]} params.requiredResources
 * @param {number|null} params.expectedWaitMinutes - null if no operational data mapped
 * @param {number|null} params.distanceKm - null if location unavailable
 * @param {number|null} params.recentRecommendationCount - nearby recent recommendations
 * @param {object} [params.weights] - override DEFAULT_WEIGHTS
 */
function scoreHospital({ hospital, requiredSpecialties, requiredResources, expectedWaitMinutes, distanceKm, recentRecommendationCount, availabilityPercent, weights }) {
  const rawWeights = { ...DEFAULT_WEIGHTS, ...(weights || {}) };
  const weightTotal = Object.values(rawWeights).reduce((sum, weight) => sum + weight, 0);
  const w = Object.fromEntries(
    Object.entries(rawWeights).map(([key, weight]) => [key, weight / weightTotal])
  );

  const specialty = percentOverlap(requiredSpecialties, hospital.specialties);
  const facility = percentOverlap(requiredResources, hospital.facilities);
  const emergency = hospital.emergencyFlag ? 100 : 0;
  const resource = resourceSuitabilityScore(hospital);
  const bedAvailability = bedAvailabilityScoreFn(availabilityPercent);
  const waitingTime = waitingTimeScoreFn(expectedWaitMinutes);
  const location = locationScoreFn(distanceKm);
  const congestion = congestionScoreFn(recentRecommendationCount);

  const componentsRaw = {
    specialty: specialty.score,
    facility: facility.score,
    emergency,
    resource: resource.score,
    bedAvailability,
    waitingTime,
    location,
    congestion,
  };

  const { score: totalScore } = combineWeightedScore(componentsRaw, w);

  const reasons = [];
  if (specialty.matched.length > 0) reasons.push(`Required specialty available: ${specialty.matched.join(', ')}`);
  if (facility.matched.length > 0) reasons.push(`Required facility available: ${facility.matched.join(', ')}`);
  if (hospital.emergencyFlag) reasons.push('Emergency services supported');
  const bedAvailabilityLabel = hospital.bedDataSource === 'operational_dataset'
    ? 'Dataset-derived bed availability'
    : hospital.bedDataSource === 'simulated'
      ? 'Simulated/demo bed availability'
      : hospital.bedDataSource === 'reported'
        ? 'Reported bed availability'
        : 'Recorded bed availability';
  if (bedAvailability !== null) reasons.push(`${bedAvailabilityLabel} is ${bedAvailability}% (${hospital.availableBeds} of ${hospital.totalBeds} beds); availability is not real-time`);
  if (waitingTime !== null && waitingTime >= 60) reasons.push(`Favorable expected waiting time (${expectedWaitMinutes} min)`);
  if (distanceKm !== null && distanceKm !== undefined) reasons.push(`Distance from supplied patient location: ${distanceKm.toFixed(1)} km`);
  if (location !== null && location >= 60) reasons.push('Favorable location (within reasonable distance)');
  if (recentRecommendationCount !== null && recentRecommendationCount !== undefined) {
    reasons.push(
      recentRecommendationCount > 0
        ? `${recentRecommendationCount} recent recommendation(s) in the demand window; demand balancing favors less-recommended options`
        : 'No recent recommendations in the demand window; no demand-balancing penalty applied'
    );
  }
  if (resource.capacityUnknown) reasons.push('Note: bed/doctor capacity not available in source data for this hospital');
  if (waitingTime === null) reasons.push('Note: expected waiting time unavailable (no operational data mapped to this hospital)');
  if (location === null) reasons.push('Note: location score unavailable (coordinates could not be resolved)');

  const explanationParts = [];
  if (specialty.matched.length) explanationParts.push(`it matches the required specialty (${specialty.matched.join(', ')})`);
  if (facility.matched.length) explanationParts.push(`it lists the required facility (${facility.matched.join(', ')})`);
  if (bedAvailability !== null) explanationParts.push(`${bedAvailabilityLabel.toLowerCase()} is ${bedAvailability}%`);
  if (expectedWaitMinutes !== null && expectedWaitMinutes !== undefined) explanationParts.push(`the mapped operational dataset estimates a ${expectedWaitMinutes}-minute wait`);
  if (hospital.emergencyFlag) explanationParts.push('emergency capability is listed');
  if (!explanationParts.length) explanationParts.push('it is among the available hospitals assessed against this patient\'s care context');

  return {
    score: totalScore,
    breakdown: {
      specialtyMatch: specialty.score,
      facilityMatch: facility.score,
      emergencyCapability: emergency,
      resourceSuitability: resource.score,
      bedAvailability,
      waitingTimeScore: waitingTime,
      locationScore: location,
      congestionScore: congestion,
    },
    expectedWaitMinutes: expectedWaitMinutes ?? null,
    explanation: `Recommended because ${explanationParts.join(', and ')}. This is decision support, not a diagnosis or treatment guarantee.`,
    reasons,
    weightsUsed: w,
  };
}

function rankHospitals(hospitals, context) {
  return hospitals
    .map((hospital) => ({ hospital, ...scoreHospital({ hospital, ...context }) }))
    .sort((a, b) => b.score - a.score);
}

// Maps a stored Recommendation breakdown (Mongo field names) back to the
// componentsRaw shape combineWeightedScore expects.
function breakdownToComponents(breakdown) {
  return {
    specialty: breakdown.specialtyMatch,
    facility: breakdown.facilityMatch,
    emergency: breakdown.emergencyCapability,
    resource: breakdown.resourceSuitability,
    bedAvailability: breakdown.bedAvailability ?? null,
    waitingTime: breakdown.waitingTimeScore ?? null,
    location: breakdown.locationScore ?? null,
    congestion: breakdown.congestionScore ?? null,
  };
}

module.exports = { scoreHospital, rankHospitals, combineWeightedScore, breakdownToComponents, DEFAULT_WEIGHTS };
