const express = require('express');
const { runSimulation, getSimulationHistory } = require('../controllers/simulationController');
const { handleValidation, runSimulationRules } = require('../validators/simulationValidators');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireRole(['admin']));

router.post('/', runSimulationRules, handleValidation, runSimulation);
router.get('/history', getSimulationHistory);

module.exports = router;
