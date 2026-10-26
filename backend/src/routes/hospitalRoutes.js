const express = require('express');
const {
  searchHospitals,
  getHospitalById,
  getHospitalOperations,
  getHospitalDoctors,
  getHospitalSuggestions,
  compareHospitals,
} = require('../controllers/hospitalController');

const router = express.Router();

// Order matters: /compare must be defined before /:id so it isn't
// swallowed by the :id param route.
router.get('/compare', compareHospitals);
router.get('/suggestions', getHospitalSuggestions);
router.get('/', searchHospitals);
router.get('/:id/operations', getHospitalOperations);
router.get('/:id/doctors', getHospitalDoctors);
router.get('/:id', getHospitalById);

module.exports = router;
