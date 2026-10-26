jest.mock('../src/models/Hospital', () => ({ findById: jest.fn() }));
jest.mock('../src/models/Doctor', () => ({ find: jest.fn() }));
jest.mock('../src/models/RegistryDoctor', () => ({ find: jest.fn() }));

const Hospital = require('../src/models/Hospital');
const Doctor = require('../src/models/Doctor');
const RegistryDoctor = require('../src/models/RegistryDoctor');
const { getHospitalDoctors, getHospitalById } = require('../src/controllers/hospitalController');

function mockQuery(value) {
  const query = {
    select: jest.fn(),
    lean: jest.fn().mockResolvedValue(value),
  };
  query.select.mockReturnValue(query);
  return query;
}

describe('getHospitalDoctors official profiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    RegistryDoctor.find.mockReturnValue(mockQuery([]));
  });

  test('returns sourced gastroenterology profiles and marks explicit colitis expertise', async () => {
    const sourceUrl = 'https://hospital.example/gastro';
    Hospital.findById.mockReturnValue(mockQuery({
      name: 'Example Hospitals',
      officialEnrichment: {
        sourceUrl,
        checkedAt: new Date('2026-09-30T00:00:00.000Z'),
        doctors: [
          {
            name: 'Dr. Example One',
            specialization: 'Gastroenterology',
            expertise: ['Ulcerative colitis management'],
            profileUrl: 'https://hospital.example/doctor-one',
          },
          {
            name: 'Dr. Example Two',
            specialization: 'Gastroenterology',
            expertise: ['Inflammatory bowel diseases'],
            profileUrl: 'https://hospital.example/doctor-two',
          },
        ],
      },
    }));
    Doctor.find.mockReturnValue(mockQuery([]));
    const res = { json: jest.fn() };
    const next = jest.fn();

    await getHospitalDoctors({
      params: { id: '507f191e810c19729de860ea' },
      query: { specialty: 'colitis' },
    }, res, next);

    const response = res.json.mock.calls[0][0];
    expect(response.data.officialSourceUrl).toBe(sourceUrl);
    expect(response.data.officialDoctors).toHaveLength(2);
    expect(response.data.officialDoctors[0].directConditionMatch).toBe(true);
    expect(response.data.officialDoctors[1].directConditionMatch).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns only sourced registry-doctor links for the requested hospital', async () => {
    const hospitalId = '507f1f77bcf86cd799439011';
    Hospital.findById.mockReturnValue(mockQuery({ _id: hospitalId, name: 'Example Hospital' }));
    Doctor.find.mockReturnValue(mockQuery([]));
    RegistryDoctor.find.mockReturnValue(mockQuery([{
      _id: 'registry-1', name: 'Doctor listed by source', registrationNumber: 'SMC-5',
      sourceUrl: 'https://nmr.nmc.org.in/search-doctor',
      hospitalAssociationSourceUrl: 'https://hospital.example/team',
    }]));
    const res = { json: jest.fn() };

    await getHospitalDoctors({ params: { id: hospitalId }, query: {} }, res, jest.fn());

    expect(RegistryDoctor.find).toHaveBeenCalledWith(expect.objectContaining({
      hospitalId,
      hospitalAssociationSourceUrl: { $exists: true, $ne: '' },
    }));
    expect(res.json.mock.calls[0][0].data.registryDoctors[0].nmrReferenceStatus).toMatch(/not independently verified/);
  });

  test('computes bed availability on hospital detail responses', async () => {
    Hospital.findById.mockReturnValue(mockQuery({ _id: 'hospital-1', totalBeds: 80, availableBeds: 20, occupiedBeds: 60, bedDataSource: 'reported' }));
    const res = { json: jest.fn() };
    await getHospitalById({ params: { id: '507f1f77bcf86cd799439011' } }, res, jest.fn());
    expect(res.json.mock.calls[0][0].data.bedAvailability.availabilityPercent).toBe(25);
    expect(res.json.mock.calls[0][0].data.bedAvailability.isLive).toBe(false);
  });
});