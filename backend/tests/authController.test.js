process.env.JWT_SECRET = 'test_secret_key_for_ci';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.GEOAPIFY_API_KEY = '';

jest.mock('../src/models/User');
jest.mock('../src/models/Doctor');
jest.mock('../src/models/Admin');
jest.mock('bcryptjs');

const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const { registerUser, login } = require('../src/controllers/authController');
const { seedDemoUsers } = require('../src/scripts/seedDemoUsers');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('registerUser', () => {
  test('rejects duplicate email', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing' });
    const req = { body: { name: 'A', email: 'a@test.com', password: 'password123' } };
    const res = mockRes();
    const next = jest.fn();
    await registerUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('creates a user and returns a token on success', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed_password');
    User.create.mockResolvedValue({ _id: 'newid123', name: 'A', email: 'a@test.com' });

    const req = { body: { name: 'A', email: 'a@test.com', password: 'password123' } };
    const res = mockRes();
    const next = jest.fn();
    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data.role).toBe('user');
    expect(payload.data.token).toBeDefined();
  });
});

describe('login', () => {
  test('rejects an invalid role', async () => {
    const req = { body: { email: 'a@test.com', password: 'x', role: 'superadmin' } };
    const res = mockRes();
    const next = jest.fn();
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects unknown email', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const req = { body: { email: 'nobody@test.com', password: 'x', role: 'user' } };
    const res = mockRes();
    const next = jest.fn();
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('rejects wrong password', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'u1', passwordHash: 'hashed', email: 'a@test.com', name: 'A' }),
    });
    bcrypt.compare.mockResolvedValue(false);
    const req = { body: { email: 'a@test.com', password: 'wrong', role: 'user' } };
    const res = mockRes();
    const next = jest.fn();
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('logs in successfully with correct credentials', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'u1', passwordHash: 'hashed', email: 'a@test.com', name: 'A' }),
    });
    bcrypt.compare.mockResolvedValue(true);
    const req = { body: { email: 'a@test.com', password: 'correct', role: 'user' } };
    const res = mockRes();
    const next = jest.fn();
    await login(req, res, next);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data.token).toBeDefined();
  });
});

// Confirms Doctor mock is wired (used implicitly by registerDoctor, exercised
// in the controller integration tests once a real DB is available per README).
describe('sanity', () => {
  test('Doctor model mock is available', () => {
    expect(Doctor).toBeDefined();
  });

  test('seedDemoUsers is available for bootstrapping demo accounts', () => {
    expect(typeof seedDemoUsers).toBe('function');
  });
});
