process.env.JWT_SECRET = 'test_secret_key_for_ci';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.GEOAPIFY_API_KEY = '';

jest.mock('../src/models/Hospital', () => ({
  distinct: jest.fn(),
}));

const Hospital = require('../src/models/Hospital');
const { getHospitalSuggestions } = require('../src/controllers/hospitalController');

function mockRes() {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('getHospitalSuggestions', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns matching unique suggestions for the requested field', async () => {
    Hospital.distinct.mockResolvedValue([
      'Apollo Hospital',
      'Apollo Hospital',
      'Apollo Cradle',
      'General Hospital',
      String.raw`\n Apollo Clinic`,
    ]);
    const req = { query: { type: 'hospital', q: ' Apollo ' } };
    const res = mockRes();
    const next = jest.fn();

    await getHospitalSuggestions(req, res, next);

    expect(Hospital.distinct).toHaveBeenCalledWith('name', { name: /Apollo/i });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: ['Apollo Clinic', 'Apollo Cradle', 'Apollo Hospital'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('does not query the directory for unsupported or short requests', async () => {
    const res = mockRes();

    await getHospitalSuggestions({ query: { type: 'unknown', q: 'cardiology' } }, res, jest.fn());

    expect(Hospital.distinct).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
  });

  test('splits bundled specialty values into individual matching suggestions', async () => {
    Hospital.distinct.mockResolvedValue([
      String.raw`Cardiology\nCardiothoracic Surgery\nGeneral Medicine`,
    ]);
    const req = { query: { type: 'specialty', q: 'cardio' } };
    const res = mockRes();

    await getHospitalSuggestions(req, res, jest.fn());

    expect(Hospital.distinct).toHaveBeenCalledWith('specialties', { specialties: /cardio/i });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: ['Cardiology', 'Cardiothoracic Surgery'],
    });
  });
});