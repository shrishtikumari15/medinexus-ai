const express = require('express');
const { searchDoctors, getDoctorById } = require('../controllers/registryDoctorController');
const {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorPatientCases,
  savePatientCaseNote,
} = require('../controllers/doctorController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Doctor Workspace (Protected, Role: doctor)
router.get('/profile/me', protect, requireRole(['doctor']), getDoctorProfile);
router.put('/profile/me', protect, requireRole(['doctor']), updateDoctorProfile);
router.get('/cases', protect, requireRole(['doctor']), getDoctorPatientCases);
router.post('/cases/:id/review', protect, requireRole(['doctor']), savePatientCaseNote);

// Public Doctor Directory
router.get('/', searchDoctors);
router.get('/:id', getDoctorById);

module.exports = router;
