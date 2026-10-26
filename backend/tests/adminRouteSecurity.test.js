process.env.JWT_SECRET = 'test_secret_key_for_ci';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.GEOAPIFY_API_KEY = '';

jest.mock('../src/controllers/adminHospitalController', () => ({
  listAdminHospitals: (req, res) => res.json({ success: true }),
  createHospital: (req, res) => res.status(201).json({ success: true }),
  updateHospital: (req, res) => res.json({ success: true }),
}));
jest.mock('../src/models/RegistryDoctor', () => ({ find: jest.fn() }));
jest.mock('../src/controllers/registryDoctorController', () => ({
  upsertDoctor: (req, res) => res.status(201).json({ success: true }),
  importDoctors: (req, res) => res.status(201).json({ success: true }),
}));

const express = require('express');
const request = require('supertest');
const { signToken } = require('../src/utils/token');
const adminHospitalRoutes = require('../src/routes/adminRoutes');

const app = express();
app.use(express.json());
app.use('/admin', adminHospitalRoutes);

describe('admin discovery route access', () => {
  test('blocks anonymous and normal-user hospital updates', async () => {
    await request(app).patch('/admin/hospitals/507f1f77bcf86cd799439011').send({ name: 'Unauthorized' }).expect(401);
    const userToken = signToken({ id: 'user-1', role: 'user' });
    await request(app).patch('/admin/hospitals/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${userToken}`).send({ name: 'Unauthorized' }).expect(403);
  });

  test('allows an admin to reach a hospital update handler', async () => {
    const adminToken = signToken({ id: 'admin-1', role: 'admin' });
    await request(app).patch('/admin/hospitals/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${adminToken}`).send({ name: 'Admin edit' }).expect(200);
  });
});