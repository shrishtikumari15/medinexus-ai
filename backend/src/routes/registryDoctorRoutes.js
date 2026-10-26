const express = require('express');
const { searchDoctors, getDoctorById } = require('../controllers/registryDoctorController');

const router = express.Router();

router.get('/', searchDoctors);
router.get('/:id', getDoctorById);

module.exports = router;