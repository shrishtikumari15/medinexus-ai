const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { listAdminHospitals, createHospital, updateHospital } = require('../controllers/adminHospitalController');
const mlServiceClient = require('../services/mlServiceClient');

const router = express.Router();

router.use(protect, requireRole(['admin']));

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin routes are available and ready for implementation.',
  });
});

router.get('/hospitals', listAdminHospitals);
router.post('/hospitals', createHospital);
router.patch('/hospitals/:id', updateHospital);
router.get('/waiting-time-metrics', async (req, res, next) => {
  try {
    const data = await mlServiceClient.getWaitingTimeMetrics();
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});
router.get('/risk-model-metrics', async (req, res, next) => {
  try {
    const data = await mlServiceClient.getRiskModelMetrics();
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
