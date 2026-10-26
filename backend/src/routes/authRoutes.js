const express = require('express');
const { registerUser, registerDoctor, login } = require('../controllers/authController');
const {
  handleValidation,
  registerUserRules,
  registerDoctorRules,
  loginRules,
} = require('../validators/authValidators');
const { body } = require('express-validator');

const router = express.Router();

router.post('/register/user', registerUserRules, handleValidation, registerUser);
router.post('/register/doctor', registerDoctorRules, handleValidation, registerDoctor);
router.post(
  '/login',
  [...loginRules, body('role').isIn(['user', 'doctor', 'admin']).withMessage('role must be user, doctor, or admin')],
  handleValidation,
  login
);

module.exports = router;
