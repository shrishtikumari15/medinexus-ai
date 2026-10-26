const { scoreHospital, rankHospitals } = require('../src/services/recommendationEngine');

const hospitalA = {
  name: 'Hospital A - full match',
  specialties: ['cardiology', 'general medicine'],
  facilities: ['ecg', 'cardiac monitor', 'cardiac care unit'],
  emergencyFlag: true,
  totalBeds: 150,
  numberDoctors: 25,
};

const hospitalB = {
  name: 'Hospital B - no specialty match, no emergency',
  specialties: ['orthopedics'],
  facilities: ['x-ray'],
  emergencyFlag: false,
  totalBeds: 20,
  numberDoctors: 3,
};

const hospitalC = {
  name: 'Hospital C - unknown capacity',
  specialties: ['cardiology'],
  facilities: [],
  emergencyFlag: true,
  totalBeds: null,
  numberDoctors: null,
};

const baseContext = {
  requiredSpecialties: ['Cardiology'],
  requiredResources: ['ECG', 'Cardiac Monitor'],
  expectedWaitMinutes: 10,
  distanceKm: 5,
};

describe('scoreHospital', () => {
  test('a strong match scores clearly higher than a weak match', () => {
    const resultA = scoreHospital({ hospital: hospitalA, ...baseContext });
    const resultB = scoreHospital({ hospital: hospitalB, ...baseContext });
    expect(resultA.score).toBeGreaterThan(resultB.score);
  });

  test('specialty match is 100 when the required specialty is present', () => {
    const result = scoreHospital({ hospital: hospitalA, ...baseContext });
    expect(result.breakdown.specialtyMatch).toBe(100);
  });

  test('specialty match is 0 when the required specialty is absent', () => {
    const result = scoreHospital({ hospital: hospitalB, ...baseContext });
    expect(result.breakdown.specialtyMatch).toBe(0);
  });

  test('emergencyCapability reflects the hospital emergencyFlag', () => {
    expect(scoreHospital({ hospital: hospitalA, ...baseContext }).breakdown.emergencyCapability).toBe(100);
    expect(scoreHospital({ hospital: hospitalB, ...baseContext }).breakdown.emergencyCapability).toBe(0);
  });

  test('unknown bed/doctor capacity gets a neutral score, not zero', () => {
    const result = scoreHospital({ hospital: hospitalC, ...baseContext });
    expect(result.breakdown.resourceSuitability).toBe(50);
    expect(result.reasons.some((r) => r.includes('capacity not available'))).toBe(true);
  });

  test('waitingTimeScore is null and its weight is redistributed when no operational data is mapped', () => {
    const withWait = scoreHospital({ hospital: hospitalA, ...baseContext, expectedWaitMinutes: 10 });
    const withoutWait = scoreHospital({ hospital: hospitalA, ...baseContext, expectedWaitMinutes: null });
    expect(withoutWait.breakdown.waitingTimeScore).toBeNull();
    expect(withoutWait.reasons.some((r) => r.includes('waiting time unavailable'))).toBe(true);
    // Score should still be computable (not NaN, not artificially zeroed)
    expect(Number.isFinite(withoutWait.score)).toBe(true);
    expect(withoutWait.score).toBeGreaterThan(0);
    // Sanity: both should be reasonably high since everything else matches well
    expect(withWait.score).toBeGreaterThan(50);
    expect(withoutWait.score).toBeGreaterThan(50);
  });

  test('a shorter expected wait scores higher than a longer one, all else equal', () => {
    const shortWait = scoreHospital({ hospital: hospitalA, ...baseContext, expectedWaitMinutes: 5 });
    const longWait = scoreHospital({ hospital: hospitalA, ...baseContext, expectedWaitMinutes: 100 });
    expect(shortWait.score).toBeGreaterThan(longWait.score);
  });

  test('a closer hospital scores higher than a farther one, all else equal', () => {
    const near = scoreHospital({ hospital: hospitalA, ...baseContext, distanceKm: 2 });
    const far = scoreHospital({ hospital: hospitalA, ...baseContext, distanceKm: 90 });
    expect(near.score).toBeGreaterThan(far.score);
  });

  test('uses sourced bed availability and explains its provenance without claiming live status', () => {
    const hospital = { ...hospitalA, totalBeds: 100, availableBeds: 30, occupiedBeds: 70, bedDataSource: 'simulated' };
    const result = scoreHospital({ ...baseContext, hospital, availabilityPercent: 30 });
    expect(result.breakdown.bedAvailability).toBe(30);
    expect(result.reasons.some((reason) => reason.includes('Simulated/demo bed availability'))).toBe(true);
    expect(result.explanation).toMatch(/simulated\/demo bed availability is 30%/);
    expect(result.explanation).not.toMatch(/real-time/);
  });

  test('recent recommendation volume lowers the score for otherwise equal hospitals', () => {
    const quiet = scoreHospital({ hospital: hospitalA, ...baseContext, recentRecommendationCount: 0 });
    const busy = scoreHospital({ hospital: hospitalA, ...baseContext, recentRecommendationCount: 8 });
    expect(quiet.breakdown.congestionScore).toBe(100);
    expect(busy.breakdown.congestionScore).toBe(60);
    expect(quiet.score).toBeGreaterThan(busy.score);
    expect(busy.reasons.some((reason) => reason.includes('8 recent recommendation'))).toBe(true);
  });

  test('the score weights used are normalized to one', () => {
    const result = scoreHospital({
      hospital: hospitalA,
      ...baseContext,
      weights: { specialty: 0.5, facility: 0.5 },
    });
    expect(Object.values(result.weightsUsed).reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1);
  });

  test('custom weights are respected (configurable weights requirement)', () => {
    const heavyOnLocation = scoreHospital({
      hospital: hospitalA,
      ...baseContext,
      distanceKm: 95,
      weights: { specialty: 0.1, facility: 0.1, emergency: 0.1, resource: 0.1, waitingTime: 0.1, location: 0.5 },
    });
    const defaultWeights = scoreHospital({ hospital: hospitalA, ...baseContext, distanceKm: 95 });
    // With location weighted much more heavily and distance being poor (95km),
    // the heavily-location-weighted score should be lower than the default.
    expect(heavyOnLocation.score).toBeLessThan(defaultWeights.score);
  });
});

describe('rankHospitals', () => {
  test('returns hospitals sorted by score descending', () => {
    const ranked = rankHospitals([hospitalB, hospitalA, hospitalC], baseContext);
    expect(ranked[0].hospital.name).toBe(hospitalA.name);
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
    expect(ranked[1].score).toBeGreaterThanOrEqual(ranked[2].score);
  });
});
