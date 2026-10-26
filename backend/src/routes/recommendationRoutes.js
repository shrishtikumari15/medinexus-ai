const express = require('express');
const { getRecommendationById, runSensitivityAnalysis } = require('../controllers/recommendationController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireRole(['user']));

router.get('/:id', getRecommendationById);
router.post('/:id/sensitivity', runSensitivityAnalysis);

module.exports = router;
