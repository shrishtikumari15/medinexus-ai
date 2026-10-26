process.env.JWT_SECRET = 'test_secret_key_for_ci';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.GEOAPIFY_API_KEY = '';

jest.mock('../src/models/Hospital', () => ({ find: jest.fn(), findById: jest.fn() }));
jest.mock('../src/models/RegistryDoctor', () => ({ find: jest.fn(), countDocuments: jest.fn(), findById: jest.fn() }));

const Hospital = require('../src/models/Hospital');
const RegistryDoctor = require('../src/models/RegistryDoctor');
const { searchDoctors, getDoctorById } = require('../src/controllers/registryDoctorController');

function response() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
}

describe('registry doctor discovery', () => {
  beforeEach(() => jest.clearAllMocks());

  test('combines state, city, and specialty filters and does not imply MediNexus verification', async () => {
    Hospital.find.mockImplementation((filter) => {
      if (filter?.$and) {
        return {
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue([]),
        };
      }
      return { distinct: jest.fn().mockResolvedValue(['hospital-id']) };
    });
    const doctor = {
      _id: 'doctor-id', name: 'Dr Sourced', registrationNumber: 'SMC-42',
      stateMedicalCouncil: 'Tamil Nadu Medical Council', sourceUrl: 'https://nmr.nmc.org.in/search-doctor',
      hospitalId: { _id: 'hospital-id', name: 'Example Hospital' },
    };
    const query = {
      populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([doctor]),
    };
    RegistryDoctor.find.mockReturnValue(query);
    RegistryDoctor.countDocuments.mockResolvedValue(1);
    const res = response();

    await searchDoctors({ query: { state: 'Tamil Nadu', city: 'Chennai', specialty: 'Cardiology', q: 'Dr. A.*' } }, res, jest.fn());

    expect(Hospital.find).toHaveBeenCalledWith(expect.objectContaining({ state: /Tamil Nadu/i, $or: expect.any(Array) }));
    const doctorFilter = RegistryDoctor.find.mock.calls[0][0];
    expect(doctorFilter).toEqual(expect.objectContaining({
      hospitalId: { $in: ['hospital-id'] },
      specialization: { $in: [/cardiology/i, /cardiac/i, /heart/i] },
    }));
    expect(doctorFilter.$and[0].$or[0].name.source).toBe('Dr\\. A\\.\\*');
    expect(res.json.mock.calls[0][0].data[0].nmrReferenceStatus).toMatch(/not independently verified/);
  });

  test('expands a current city name to its directory alias', async () => {
    Hospital.find.mockImplementation((filter) => {
      if (filter?.$and) {
        return {
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue([]),
        };
      }
      return { distinct: jest.fn().mockResolvedValue([]) };
    });
    RegistryDoctor.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });
    RegistryDoctor.countDocuments.mockResolvedValue(0);
    const res = response();

    await searchDoctors({ query: { state: 'Haryana', city: 'Gurugram' } }, res, jest.fn());

    const locationConditions = Hospital.find.mock.calls[0][0].$or;
    expect(locationConditions).toEqual(expect.arrayContaining([
      { district: /gurugram/i },
      { district: /gurgaon/i },
    ]));
  });

  test('includes hospital-published doctors in matching city and specialty searches', async () => {
    Hospital.find.mockImplementation((filter) => {
      if (filter?.$and?.some((condition) => condition['officialEnrichment.doctors.0'])) {
        return {
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue([{
            _id: 'ford-id', name: 'Ford Hospital', state: 'Bihar', district: 'Patna',
            officialEnrichment: { doctors: [{
              name: 'Dr Sourced Cardiologist', specialization: 'Cardiology',
              qualification: 'MBBS, MD, DM (Cardiology)', experienceText: '22+ years',
              profileUrl: 'https://fordhospital.org/doctor-profile/',
              sourceUrl: 'https://fordhospital.org/doctor-profile/',
            }] },
          }]),
        };
      }
      return { distinct: jest.fn().mockResolvedValue(['ford-id']) };
    });
    const query = {
      populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };
    RegistryDoctor.find.mockReturnValue(query);
    RegistryDoctor.countDocuments.mockResolvedValue(0);
    const res = response();

    await searchDoctors({ query: { state: 'Bihar', city: 'Patna', specialty: 'Cardiology' } }, res, jest.fn());

    const doctor = res.json.mock.calls[0][0].data[0];
    expect(doctor).toEqual(expect.objectContaining({
      name: 'Dr Sourced Cardiologist',
      recordType: 'hospital_profile',
      sourceName: 'Ford Hospital',
      experience: '22+ years',
      hospitalId: expect.objectContaining({ name: 'Ford Hospital' }),
    }));
    expect(doctor.nmrReferenceStatus).toMatch(/hospital-published/i);
    expect(res.json.mock.calls[0][0].pagination.total).toBe(1);
  });

  test('matches common specialty misspellings and preserves published doctor details', async () => {
    Hospital.find.mockReturnValue({
      distinct: jest.fn().mockResolvedValue(['ford-id']),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{
        _id: 'ford-id', name: 'Ford Hospital', state: 'Bihar', district: 'Patna',
        officialEnrichment: { doctors: [{
          name: 'Dr Ujjwal Kumar', specialization: 'Gastroenterology',
          qualification: 'MBBS; MD; DM (Gastroenterology)',
          biography: 'Ford describes his digestive care practice and endoscopy services.',
          expertise: ['Endoscopy', 'Liver disease'],
          profileUrl: 'https://fordhospital.org/top-gastroenterologist-in-patna/',
          sourceUrl: 'https://fordhospital.org/top-gastroenterologist-in-patna/',
        }] },
      }]),
    });
    RegistryDoctor.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });
    RegistryDoctor.countDocuments.mockResolvedValue(0);
    const res = response();

    await searchDoctors({ query: { state: 'Bihar', city: 'Patna', specialty: 'gaestrology' } }, res, jest.fn());

    expect(res.json.mock.calls[0][0].data[0]).toEqual(expect.objectContaining({
      name: 'Dr Ujjwal Kumar',
      specialization: 'Gastroenterology',
      biography: 'Ford describes his digestive care practice and endoscopy services.',
      expertise: ['Endoscopy', 'Liver disease'],
    }));
  });

  test('rejects malformed doctor detail IDs', async () => {
    const res = response();
    await getDoctorById({ params: { id: 'bad-id' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(RegistryDoctor.findById).not.toHaveBeenCalled();
  });
});