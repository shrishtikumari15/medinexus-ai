const { getBedAvailability } = require('../src/services/bedAvailability');

describe('getBedAvailability', () => {
  test('calculates availability from known reported counts', () => {
    expect(getBedAvailability({
      totalBeds: 120,
      availableBeds: 30,
      occupiedBeds: 90,
      bedDataSource: 'reported',
      bedDataSourceName: 'Hospital report',
    })).toMatchObject({
      availabilityPercent: 25,
      source: 'reported',
      sourceName: 'Hospital report',
      isLive: false,
    });
  });

  test('does not invent availability when counts are missing or inconsistent', () => {
    expect(getBedAvailability({ totalBeds: 120 }).availabilityPercent).toBeNull();
    expect(getBedAvailability({ totalBeds: 120, availableBeds: 80, occupiedBeds: 50 }).availabilityPercent).toBeNull();
  });
});