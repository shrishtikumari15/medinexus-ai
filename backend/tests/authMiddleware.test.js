process.env.JWT_SECRET = 'test_secret_key_for_ci';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.GEOAPIFY_API_KEY = '';

const { signToken } = require('../src/utils/token');
const { protect, requireRole } = require('../src/middleware/authMiddleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('protect middleware', () => {
  test('rejects requests with no token', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects an invalid/tampered token', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a valid token and attaches req.user', () => {
    const token = signToken({ id: 'user123', role: 'user' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'user123', role: 'user' });
  });
});

describe('requireRole middleware (RBAC)', () => {
  test('blocks a user token from an admin-only route', () => {
    const req = { user: { id: 'u1', role: 'user' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole(['admin'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('blocks a doctor token from an admin-only route', () => {
    const req = { user: { id: 'd1', role: 'doctor' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole(['admin'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('allows an admin token through an admin-only route', () => {
    const req = { user: { id: 'a1', role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole(['admin'])(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rejects when req.user is missing (protect not run first)', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    requireRole(['admin'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
