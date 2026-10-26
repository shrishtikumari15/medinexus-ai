jest.mock('../src/models/Hospital', () => ({ find: jest.fn(), countDocuments: jest.fn() }));
jest.mock('../src/models/Doctor', () => ({ find: jest.fn() }));
jest.mock('../src/models/RegistryDoctor', () => ({ find: jest.fn() }));

const Hospital = require('../src/models/Hospital');
const { searchHospitals } = require('../src/controllers/hospitalController');

function queryResult(value) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
  };
}

describe('hospital search filter composition', () => {
  beforeEach(() => jest.clearAllMocks());

  test('does not return name-only matches when state, city, and specialty filters fail', async () => {
    const hospital = {
      _id: 'hospital-id',
      name: 'All India Institute of Medical Sciences (AIIMS), Patna',
      state: 'Bihar',
      district: 'Patna',
      specialties: [],
      emergencyFlag: false,
    };
    Hospital.find.mockImplementation((filter) => (
      filter.name && !filter.$and ? queryResult([hospital]) : queryResult([])
    ));
    Hospital.countDocuments.mockResolvedValue(0);
    const res = { json: jest.fn() };

    await searchHospitals({
      query: {
        q: 'All India Institute of Medical Sciences (AIIMS), Patna',
        state: 'Karnataka',
        city: 'Bengaluru',
        specialty: 'Cardiology',
      },
    }, res, jest.fn());

    expect(res.json.mock.calls[0][0].data).toEqual([]);
  });

  test('retains direct hospital-name search when no conflicting filters are selected', async () => {
    const hospital = { _id: 'hospital-id', name: 'City Hospital', state: 'Karnataka' };
    Hospital.find.mockImplementation((filter) => queryResult(filter.name ? [hospital] : []));
    const res = { json: jest.fn() };

    await searchHospitals({ query: { q: 'City Hospital' } }, res, jest.fn());

    expect(res.json.mock.calls[0][0].data[0].name).toBe('City Hospital');
    expect(res.json.mock.calls[0][0].meta.fallback).toBe(false);
  });
});
