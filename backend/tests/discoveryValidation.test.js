const { validateRegistryPayload } = require('../src/controllers/registryDoctorController');
const { validateHospital } = require('../src/controllers/adminHospitalController');
const { buildSearchFilter } = require('../src/controllers/hospitalController');

describe('doctor discovery source validation', () => {
  const baseRecord = {
    name: 'Sourced record',
    registrationNumber: 'SMC-123',
    stateMedicalCouncil: 'Example State Medical Council',
    sourceUrl: 'https://nmr.nmc.org.in/search-doctor',
  };

  test('accepts NMR registration fields without inventing optional profile data', () => {
    expect(validateRegistryPayload(baseRecord)).toBeNull();
  });

  test('requires separate secure sources for specialty and hospital association', () => {
    expect(validateRegistryPayload({ ...baseRecord, specialization: 'Cardiology' })).toMatch(/specialization requires/);
    expect(validateRegistryPayload({ ...baseRecord, hospitalId: '507f191e810c19729de860ea' })).toMatch(/hospital association requires/);
  });

  test('rejects a non-NMR registration reference', () => {
    expect(validateRegistryPayload({ ...baseRecord, sourceUrl: 'https://example.com/doctor' })).toMatch(/official NMC/);
  });
});

describe('hospital operational source validation', () => {
  test('allows unknown beds without inserting a fake count', () => {
    expect(validateHospital({ name: 'Example', state: 'Example State', totalBeds: null, availableBeds: null, occupiedBeds: null, bedDataSource: 'unknown' }, { creating: true })).toBeNull();
  });

  test('rejects sourced operational counts without valid provenance or consistent totals', () => {
    expect(validateHospital({ totalBeds: 100, availableBeds: 20, occupiedBeds: 80, bedDataSource: 'reported' })).toMatch(/source name/);
    expect(validateHospital({ totalBeds: 100, availableBeds: 70, occupiedBeds: 50, bedDataSource: 'simulated' })).toMatch(/cannot exceed/);
  });
});

describe('hospital search filters', () => {
  test('applies state and city as conjunctive filters', () => {
    const filter = buildSearchFilter({ state: 'State A', city: 'City B', specialty: 'Cardiology' });
    expect(filter.$and).toHaveLength(3);
    expect(filter.$and[0].$or[0].state).toEqual(/State A/i);
    expect(filter.$and[1].$or[0].district).toEqual(/City B/i);
  });

  test('matches official hospital departments as well as the base directory specialty field', () => {
    const filter = buildSearchFilter({ specialty: 'Neurology' });
    expect(filter.$and[0].$or[1]['officialEnrichment.departments'].$in).toEqual([
      /neurology/i,
      /neurologist/i,
    ]);
  });
});