process.env.JWT_SECRET = 'caregiver_test_secret_key';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.GEOAPIFY_API_KEY = '';

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');

describe('dependent route privacy boundary', () => {
  test('requires a login token', async () => {
    const response = await request(app).get('/api/v1/dependents');
    expect(response.status).toBe(401);
  });

  test.each(['admin', 'doctor'])('does not allow the %s role to access private dependents', async (role) => {
    const token = jwt.sign({ id: 'account-1', role }, process.env.JWT_SECRET);
    const response = await request(app)
      .get('/api/v1/dependents')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});