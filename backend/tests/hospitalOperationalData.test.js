jest.mock('../src/models/Hospital', () => ({ findById: jest.fn() }));
jest.mock('../src/models/Doctor', () => ({}));
jest.mock('../src/models/RegistryDoctor', () => ({}));

const Hospital = require('../src/models/Hospital');
const { getHospitalOperations } = require('../src/controllers/hospitalController');

describe('hospital operational data API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns the selected CSV data for an explicitly mapped hospital', async () => {
    Hospital.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ operationalHospitalId: 'H001' }),
    });
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await getHospitalOperations({
      params: { id: '507f1f77bcf86cd799439011' },
      query: { day_of_week: '0', hour: '0' },
    }, res, jest.fn());

    const { data } = res.json.mock.calls[0][0];
    expect(data.available).toBe(true);
    expect(data.hospitalId).toBe('H001');
    expect(data.occupiedBeds).toBe(data.totalBeds - data.bedsAvailable);
    expect(Number.isFinite(data.waitingTimeMinutes)).toBe(true);
  });

  test('returns an explicit unavailable state for an unmapped hospital', async () => {
    Hospital.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ operationalHospitalId: null }),
    });
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await getHospitalOperations({
      params: { id: '507f1f77bcf86cd799439011' },
      query: {},
    }, res, jest.fn());

    expect(res.json.mock.calls[0][0].data).toMatchObject({
      available: false,
      message: 'Operational data not available',
    });
  });
});
