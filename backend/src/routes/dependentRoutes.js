const express = require('express');
const {
  listDependents,
  createDependent,
  updateDependent,
  deleteDependent,
  getDependentAssessments,
} = require('../controllers/dependentController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { handleValidation } = require('../validators/assessmentValidators');
const { dependentIdParam, dependentFields } = require('../validators/dependentValidators');

const router = express.Router();

router.use(protect, requireRole(['user']));
router.get('/', listDependents);
router.post('/', dependentFields, handleValidation, createDependent);
router.get('/:id/assessments', dependentIdParam, handleValidation, getDependentAssessments);
router.put('/:id', dependentIdParam, dependentFields, handleValidation, updateDependent);
router.delete('/:id', dependentIdParam, handleValidation, deleteDependent);

module.exports = router;