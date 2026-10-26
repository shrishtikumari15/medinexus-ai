process.env.JWT_SECRET = 'test_secret_key_for_ci';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.GEOAPIFY_API_KEY = '';

const request = require('supertest');
const { signToken } = require('../src/utils/token');
const app = require('../src/app');

describe('POST /api/v1/admin/simulate RBAC', () => {
  test('rejects requests with no token', async () => {
    const res = await request(app).post('/api/v1/admin/simulate').send({});
    expect(res.status).toBe(401);
  });

  test('rejects a user-role token', async () => {
    const token = signToken({ id: 'u1', role: 'user' });
    const res = await request(app)
      .post('/api/v1/admin/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        baseline: { arrivalRatePerHour: 20, doctorsAvailable: 8, bedsAvailable: 40, serviceRateMinutesPerPatient: 20 },
        scenario: { arrivalRatePerHour: 25, doctorsAvailable: 6, bedsAvailable: 30, serviceRateMinutesPerPatient: 20 },
      });
    expect(res.status).toBe(403);
  });

  test('rejects a doctor-role token', async () => {
    const token = signToken({ id: 'd1', role: 'doctor' });
    const res = await request(app)
      .post('/api/v1/admin/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(403);
  });

  test('rejects invalid simulation parameters even for an admin token', async () => {
    const token = signToken({ id: 'a1', role: 'admin' });
    const res = await request(app)
      .post('/api/v1/admin/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        baseline: { arrivalRatePerHour: -5, doctorsAvailable: 0, bedsAvailable: 40, serviceRateMinutesPerPatient: 20 },
        scenario: { arrivalRatePerHour: 25, doctorsAvailable: 6, bedsAvailable: 30, serviceRateMinutesPerPatient: 20 },
      });
    expect(res.status).toBe(400);
  });
});
