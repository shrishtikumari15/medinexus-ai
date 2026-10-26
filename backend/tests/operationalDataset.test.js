const { getDatasetSummary, getOperationalReference, selectOperationalRecord } = require('../src/services/operationalDataset');

describe('CSV-backed operational dataset', () => {
  test('loads valid H001-H005 records and reports data-cleaning counts', () => {
    const summary = getDatasetSummary();

    expect(summary.validRows).toBeGreaterThan(0);
    expect(summary.hospitalIds).toEqual(['H001', 'H002', 'H003', 'H004', 'H005']);
    expect(summary.invalidRows).toBe(0);
    expect(summary.duplicateRows).toBe(0);
  });

  test('selects a dataset record and derives bed metrics without inventing values', () => {
    const record = selectOperationalRecord('H001', { dayOfWeek: 0, hour: 0 });

    expect(record.hospitalId).toBe('H001');
    expect(record.totalBeds).toBeGreaterThan(0);
    expect(record.bedsAvailable).toBeGreaterThanOrEqual(0);
    expect(record.occupiedBeds).toBe(record.totalBeds - record.bedsAvailable);
    expect(record.bedAvailabilityPercentage).toBe(
      Math.round((record.bedsAvailable / record.totalBeds) * 100)
    );
    expect(Number.isFinite(record.waitingTimeMinutes)).toBe(true);
    expect(record.disclaimer).toContain('not be treated as real-time');
  });

  test('does not return operational values for an unknown dataset ID', () => {
    expect(selectOperationalRecord('H999')).toBeNull();
  });

  test('provides only integer bed-count reference estimates from the dataset', () => {
    const reference = getOperationalReference();

    expect(Number.isInteger(reference.totalBedsEstimate)).toBe(true);
    expect(Number.isInteger(reference.availableBedsEstimate)).toBe(true);
    expect(reference.totalBedsEstimate).toBeGreaterThan(0);
    expect(reference.availableBedsEstimate).toBeGreaterThanOrEqual(0);
    expect(reference.sourceDataset).toBeTruthy();
    expect(reference.disclaimer).toContain('not specific to this hospital');
  });
});
