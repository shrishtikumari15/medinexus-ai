const Simulation = require('../models/Simulation');
const mlServiceClient = require('../services/mlServiceClient');

// POST /api/v1/admin/simulate  (admin-only, enforced by route middleware)
// Body: { baseline: {...}, scenario: {...} }
async function runSimulation(req, res, next) {
  try {
    const { baseline, scenario } = req.body;

    const result = await mlServiceClient.runSimulation(baseline, scenario);

    const simulation = await Simulation.create({
      adminId: req.user.id,
      baseline,
      scenario,
      results: {
        baseline: {
          queueLength: result.baseline.analytical.queue_length,
          waitingTimeMinutes: result.baseline.analytical.waiting_time_minutes,
          doctorUtilization: result.baseline.analytical.doctor_utilization,
          bedOccupancy: result.baseline.analytical.bed_occupancy,
          hospitalLoad: result.baseline.analytical.hospital_load,
        },
        scenario: {
          queueLength: result.scenario.analytical.queue_length,
          waitingTimeMinutes: result.scenario.analytical.waiting_time_minutes,
          doctorUtilization: result.scenario.analytical.doctor_utilization,
          bedOccupancy: result.scenario.analytical.bed_occupancy,
          hospitalLoad: result.scenario.analytical.hospital_load,
        },
      },
      method: 'queueing_theory',
    });

    return res.status(201).json({
      success: true,
      data: {
        simulationId: simulation._id,
        full: result, // includes both analytical AND discrete-event simulation detail + stability warnings
      },
    });
  } catch (err) {
    return next(err);
  }
}

// GET /api/v1/admin/simulate/history
async function getSimulationHistory(req, res, next) {
  try {
    const simulations = await Simulation.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ success: true, data: simulations });
  } catch (err) {
    return next(err);
  }
}

module.exports = { runSimulation, getSimulationHistory };
