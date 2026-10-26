const express = require('express');
const { createAssessment, getRecommendationHistory } = require('../controllers/assessmentController');
const { handleValidation, createAssessmentRules } = require('../validators/assessmentValidators');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireRole(['user']));

router.post('/', createAssessmentRules, handleValidation, createAssessment);
router.get('/history', getRecommendationHistory);

module.exports = router;
