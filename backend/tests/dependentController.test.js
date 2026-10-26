jest.mock('../src/models/Dependent');
jest.mock('../src/models/Assessment');
jest.mock('../src/models/Recommendation');

const Dependent = require('../src/models/Dependent');
const Assessment = require('../src/models/Assessment');
const Recommendation = require('../src/models/Recommendation');
const {
  createDependent,
  updateDependent,
  deleteDependent,
  getDependentAssessments,
} = require('../src/controllers/dependentController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('dependentController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a dependent under the authenticated owner', async () => {
    const dependent = { _id: 'dependent-1', name: 'Rahul' };
    Dependent.create.mockResolvedValue(dependent);
    const req = {
      user: { id: 'owner-1' },
      body: { name: 'Rahul', relationship: 'Son', dateOfBirth: '2010-01-15', gender: 'M' },
    };
    const res = mockRes();

    await createDependent(req, res, jest.fn());

    expect(Dependent.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'owner-1', name: 'Rahul' }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { ...dependent, dependentId: dependent._id } });
  });

  test('cannot update another user’s dependent', async () => {
    Dependent.findOneAndUpdate.mockResolvedValue(null);
    const req = { params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'owner-2' }, body: {} };
    const res = mockRes();

    await updateDependent(req, res, jest.fn());

    expect(Dependent.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: req.params.id, userId: 'owner-2', deletedAt: null }),
      expect.any(Object),
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updates an owned dependent profile', async () => {
    const id = '507f1f77bcf86cd799439011';
    const dependent = { _id: id, name: 'Rahul Kumar', relationship: 'Son', gender: 'M' };
    Dependent.findOneAndUpdate.mockResolvedValue(dependent);
    const req = {
      params: { id },
      user: { id: 'owner-1' },
      body: { name: 'Rahul Kumar', relationship: 'Son', dateOfBirth: '2010-01-15', gender: 'M' },
    };
    const res = mockRes();

    await updateDependent(req, res, jest.fn());

    expect(Dependent.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: id, userId: 'owner-1', deletedAt: null },
      { $set: { name: 'Rahul Kumar', relationship: 'Son', dateOfBirth: '2010-01-15', gender: 'M' } },
      { new: true, runValidators: true }
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { ...dependent, dependentId: id } });
  });

  test('deletes by soft delete so linked assessment history remains', async () => {
    Dependent.findOneAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
    const req = { params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'owner-1' } };
    const res = mockRes();

    await deleteDependent(req, res, jest.fn());

    expect(Dependent.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'owner-1', deletedAt: null }),
      expect.objectContaining({ $set: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
      expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: '507f1f77bcf86cd799439011', deleted: true } });
  });

  test('lists only recommendation history linked to the owned dependent', async () => {
    const dependentId = '507f1f77bcf86cd799439011';
    const recommendations = [{ _id: 'recommendation-1' }];
    Dependent.findOne.mockReturnValue({ select: () => ({ lean: async () => ({ _id: dependentId }) }) });
    Assessment.find.mockReturnValue({ distinct: async () => ['assessment-1'] });
    const query = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(recommendations),
    };
    Recommendation.find.mockReturnValue(query);
    const req = { params: { id: dependentId }, user: { id: 'owner-1' } };
    const res = mockRes();

    await getDependentAssessments(req, res, jest.fn());

    expect(Dependent.findOne).toHaveBeenCalledWith({ _id: dependentId, userId: 'owner-1' });
    expect(Assessment.find).toHaveBeenCalledWith({ userId: 'owner-1', dependentId });
    expect(Recommendation.find).toHaveBeenCalledWith({ userId: 'owner-1', assessmentId: { $in: ['assessment-1'] } });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: recommendations });
  });

  test('does not reveal a dependent owned by someone else', async () => {
    Dependent.findOne.mockReturnValue({ select: () => ({ lean: async () => null }) });
    const req = { params: { id: '507f1f77bcf86cd799439011' }, user: { id: 'owner-2' } };
    const res = mockRes();

    await getDependentAssessments(req, res, jest.fn());

    expect(Assessment.find).not.toHaveBeenCalled();
    expect(Recommendation.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
  });
});