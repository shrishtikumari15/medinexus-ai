const { combineWeightedScore, breakdownToComponents, DEFAULT_WEIGHTS } = require('../src/services/recommendationEngine');

describe('combineWeightedScore', () => {
  test('recomputes the same score as scoreHospital would for a full breakdown', () => {
    const components = { specialty: 100, facility: 100, emergency: 100, resource: 80, bedAvailability: 50, waitingTime: 60, location: 90, congestion: 100 };
    const { score, effectiveWeights } = combineWeightedScore(components, DEFAULT_WEIGHTS);
    const expected = Math.round(Object.entries(components).reduce((sum, [key, value]) => sum + value * effectiveWeights[key], 0));
    expect(score).toBe(expected);
  });

  test('redistributes weight when a component is null (matches scoreHospital behavior)', () => {
    const components = { specialty: 100, facility: 100, emergency: 100, resource: 100, waitingTime: null, location: 100 };
    const { score } = combineWeightedScore(components, DEFAULT_WEIGHTS);
    // Everything else is 100, waitingTime unavailable and redistributed -> should still be 100
    expect(score).toBe(100);
  });

  test('a scenario that heavily weights a low-scoring component pulls the total down', () => {
    const components = { specialty: 20, facility: 100, emergency: 100, resource: 100, waitingTime: 100, location: 100 };
    const balanced = combineWeightedScore(components, DEFAULT_WEIGHTS);
    const specialtyHeavy = combineWeightedScore(components, { ...DEFAULT_WEIGHTS, specialty: 0.8, facility: 0.04, emergency: 0.04, resource: 0.04, waitingTime: 0.04, location: 0.04 });
    expect(specialtyHeavy.score).toBeLessThan(balanced.score);
  });
});

describe('breakdownToComponents', () => {
  test('maps a stored Mongo-style breakdown to the componentsRaw shape correctly', () => {
    const breakdown = {
      specialtyMatch: 90, facilityMatch: 70, emergencyCapability: 100,
      resourceSuitability: 50, waitingTimeScore: null, locationScore: 80,
    };
    expect(breakdownToComponents(breakdown)).toEqual({
      specialty: 90, facility: 70, emergency: 100, resource: 50, bedAvailability: null, waitingTime: null, location: 80, congestion: null,
    });
  });
});

// Simulates the exact flow runSensitivityAnalysis performs: take a stored
// breakdown, apply an alternate weight scenario, confirm rankings can
// legitimately flip when weights change enough - this IS the sensitivity
// analysis capability the project spec requires.
describe('sensitivity analysis flow (stored breakdown -> alternate weights)', () => {
  test('hospital ranking order can flip under a different weight scenario', () => {
    const hospitalX = { specialtyMatch: 100, facilityMatch: 40, emergencyCapability: 0, resourceSuitability: 60, waitingTimeScore: 90, locationScore: 90 };
    const hospitalY = { specialtyMatch: 60, facilityMatch: 100, emergencyCapability: 100, resourceSuitability: 100, waitingTimeScore: 20, locationScore: 20 };

    // Baseline (default weights): Y wins - it has stronger facility/emergency/
    // resource scores, which the default weights favor over X's strong
    // specialty/waitingTime/location scores.
    const baselineX = combineWeightedScore(breakdownToComponents(hospitalX), DEFAULT_WEIGHTS);
    const baselineY = combineWeightedScore(breakdownToComponents(hospitalY), DEFAULT_WEIGHTS);
    expect(baselineY.score).toBeGreaterThan(baselineX.score);

    // A specialty/waiting-time/location-heavy scenario should flip the
    // ranking in X's favor, since that's exactly where X is strong.
    const specialtyHeavyWeights = { specialty: 0.5, facility: 0.1, emergency: 0.05, resource: 0.05, waitingTime: 0.15, location: 0.15 };
    const scenarioX = combineWeightedScore(breakdownToComponents(hospitalX), specialtyHeavyWeights);
    const scenarioY = combineWeightedScore(breakdownToComponents(hospitalY), specialtyHeavyWeights);
    expect(scenarioX.score).toBeGreaterThan(scenarioY.score);
  });
});
