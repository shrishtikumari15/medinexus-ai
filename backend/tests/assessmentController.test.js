process.env.JWT_SECRET = 'test_secret_key_for_ci';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.GEOAPIFY_API_KEY = '';

jest.mock('../src/models/Assessment');
jest.mock('../src/models/Dependent');
jest.mock('../src/models/Recommendation');
jest.mock('../src/models/Hospital');
jest.mock('../src/models/RegistryDoctor', () => ({ find: jest.fn() }));
jest.mock('../src/services/geocodingService', () => ({
  geocodeAddress: jest.fn(),
  distanceKm: jest.fn(),
}));
jest.mock('../src/services/recommendationEngine', () => ({
  scoreHospital: jest.fn(),
  DEFAULT_WEIGHTS: { specialty: 1 },
}));
jest.mock('../src/services/mlServiceClient', () => ({
  predictRisk: jest.fn(),
}));

const { createAssessment, getRecommendationHistory } = require('../src/controllers/assessmentController');
const { createAssessmentRules } = require('../src/validators/assessmentValidators');
const { validationResult } = require('express-validator');
const mlServiceClient = require('../src/services/mlServiceClient');
const Assessment = require('../src/models/Assessment');
const Dependent = require('../src/models/Dependent');
const Recommendation = require('../src/models/Recommendation');
const Hospital = require('../src/models/Hospital');
const RegistryDoctor = require('../src/models/RegistryDoctor');
const { scoreHospital } = require('../src/services/recommendationEngine');
const { calculateAge } = require('../src/utils/age');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('createAssessment', () => {
  beforeEach(() => jest.clearAllMocks());

  function setupSuccessfulAssessment() {
    mlServiceClient.predictRisk.mockResolvedValue({
      riskLabel: 'LOW_URGENCY',
      probabilityHighUrgency: 0.1,
      modelName: 'lightgbm',
      modelVersion: 'phase7_v1',
      requiredSpecialties: ['General Medicine'],
      requiredResources: [],
      disclaimer: 'Decision support only.',
    });
    Assessment.create.mockResolvedValue({ locationInput: {}, save: jest.fn() });
    Recommendation.aggregate.mockResolvedValue([]);
    Recommendation.create.mockResolvedValue({ _id: 'recommendation-1' });
    Hospital.find.mockImplementation(() => ({ limit: () => ({ lean: async () => [] }) }));
    RegistryDoctor.find.mockReturnValue({ select: () => ({ lean: async () => [] }) });
  }

  test('keeps existing self-assessment behavior and stores no dependent', async () => {
    setupSuccessfulAssessment();
    const req = { body: { chiefComplaint: 'headache' }, user: { id: 'user-1' } };
    const res = mockRes();

    await createAssessment(req, res, jest.fn());

    expect(Dependent.findOne).not.toHaveBeenCalled();
    expect(Assessment.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      dependentId: null,
      dependentSnapshot: undefined,
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('returns at most ten hospitals ordered by score with saved explanations', async () => {
    setupSuccessfulAssessment();
    const candidates = Array.from({ length: 12 }, (_, index) => ({
      _id: `hospital-${index}`,
      testScore: 100 - index,
      totalBeds: 100,
      availableBeds: 25,
      occupiedBeds: 75,
      specialties: ['General Medicine'],
      facilities: [],
    }));
    Hospital.find.mockImplementation(() => ({ limit: () => ({ lean: async () => candidates }) }));
    scoreHospital.mockImplementation(({ hospital, availabilityPercent }) => ({
      score: hospital.testScore,
      breakdown: { specialtyMatch: 100, facilityMatch: 100, bedAvailability: availabilityPercent },
      expectedWaitMinutes: null,
      explanation: 'Recommended because a relevant specialty is listed. Decision support only.',
      reasons: ['Required specialty available: General Medicine'],
      weightsUsed: { specialty: 1 },
    }));
    const res = mockRes();

    await createAssessment({ body: { chiefComplaint: 'headache' }, user: { id: 'user-1' } }, res, jest.fn());

    const savedRankings = Recommendation.create.mock.calls[0][0].hospitalRankings;
    expect(savedRankings).toHaveLength(10);
    expect(savedRankings[0].score).toBe(100);
    expect(savedRankings[9].score).toBe(91);
    expect(savedRankings[0].explanation).toMatch(/Recommended because/);
    expect(savedRankings[0].bedAvailability.availabilityPercent).toBe(25);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('creates an assessment for an owned dependent and snapshots calculated age', async () => {
    setupSuccessfulAssessment();
    const dependentId = '507f1f77bcf86cd799439011';
    const dependent = {
      _id: dependentId,
      name: 'Rahul',
      relationship: 'Son',
      dateOfBirth: new Date('2010-01-15T00:00:00.000Z'),
      gender: 'M',
    };
    Dependent.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(dependent) });
    const req = { body: { chiefComplaint: 'fever', dependentId }, user: { id: 'user-1' } };
    const res = mockRes();

    await createAssessment(req, res, jest.fn());

    expect(Dependent.findOne).toHaveBeenCalledWith({ _id: dependentId, userId: 'user-1', deletedAt: null });
    expect(mlServiceClient.predictRisk).toHaveBeenCalledWith(expect.objectContaining({ gender: 'M' }));
    expect(Assessment.create).toHaveBeenCalledWith(expect.objectContaining({
      dependentId,
      dependentSnapshot: expect.objectContaining({
        name: 'Rahul',
        relationship: 'Son',
        ageAtAssessment: calculateAge(dependent.dateOfBirth),
      }),
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('refuses an unknown, deleted, or foreign dependent before ML prediction', async () => {
    Dependent.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const req = {
      body: { chiefComplaint: 'fever', dependentId: '507f1f77bcf86cd799439011' },
      user: { id: 'user-1' },
    };
    const res = mockRes();

    await createAssessment(req, res, jest.fn());

    expect(mlServiceClient.predictRisk).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Dependent not found') }));
  });

  test('returns a friendly error when the ML service is unavailable', async () => {
    mlServiceClient.predictRisk.mockRejectedValue(
      Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:8000'), { code: 'ECONNREFUSED' })
    );

    const req = {
      body: {
        temperature: 101,
        heartrate: 98,
        resprate: 20,
        o2sat: 84,
        sbp: 120,
        dbp: 76,
        pain: 5,
        chiefComplaint: 'fever chest pain and weakness',
        gender: 'Other',
        locationText: 'Bengaluru',
      },
      user: { id: 'user-123' },
    };
    const res = mockRes();
    const next = jest.fn();

    await createAssessment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('ML service'),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects oxygen saturation above the clinical input range', async () => {
    const req = { body: { chiefComplaint: 'fever and chest pain', o2sat: 120 } };
    await Promise.all(createAssessmentRules.map((rule) => rule.run(req)));
    const errors = validationResult(req).array();

    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'o2sat', msg: 'O2 saturation must be between 50 and 100%.' }),
    ]));
  });

  test('filters recommendation history to the signed-in user’s own assessments', async () => {
    Assessment.find.mockReturnValue({ distinct: jest.fn().mockResolvedValue(['self-assessment']) });
    const query = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };
    Recommendation.find.mockReturnValue(query);
    const req = { user: { id: 'user-1' }, query: { scope: 'mine' } };
    const res = mockRes();

    await getRecommendationHistory(req, res, jest.fn());

    expect(Assessment.find).toHaveBeenCalledWith({ userId: 'user-1', dependentId: null });
    expect(Recommendation.find).toHaveBeenCalledWith({ userId: 'user-1', assessmentId: { $in: ['self-assessment'] } });
  });

  test('filters family history without mixing in self assessments', async () => {
    Assessment.find.mockReturnValue({ distinct: jest.fn().mockResolvedValue(['dependent-assessment']) });
    const query = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };
    Recommendation.find.mockReturnValue(query);
    const req = { user: { id: 'user-1' }, query: { scope: 'family' } };
    const res = mockRes();

    await getRecommendationHistory(req, res, jest.fn());

    expect(Assessment.find).toHaveBeenCalledWith({ userId: 'user-1', dependentId: { $ne: null } });
    expect(Recommendation.find).toHaveBeenCalledWith({ userId: 'user-1', assessmentId: { $in: ['dependent-assessment'] } });
  });

  test('requires ownership before filtering to one dependent history', async () => {
    Dependent.findOne.mockReturnValue({ select: () => ({ lean: async () => null }) });
    const req = {
      user: { id: 'user-1' },
      query: { dependentId: '507f1f77bcf86cd799439011' },
    };
    const res = mockRes();

    await getRecommendationHistory(req, res, jest.fn());

    expect(Dependent.findOne).toHaveBeenCalledWith({ _id: req.query.dependentId, userId: 'user-1' });
    expect(Assessment.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
