const mongoose = require('mongoose');

const scenarioParamsSchema = new mongoose.Schema(
  {
    arrivalRatePerHour: { type: Number, required: true, min: 0 },
    doctorsAvailable: { type: Number, required: true, min: 1 },
    bedsAvailable: { type: Number, required: true, min: 1 },
    serviceRateMinutesPerPatient: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const simulationSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    baseline: { type: scenarioParamsSchema, required: true },
    scenario: { type: scenarioParamsSchema, required: true },
    results: {
      baseline: {
        queueLength: Number,
        waitingTimeMinutes: Number,
        doctorUtilization: Number,
        bedOccupancy: Number,
        hospitalLoad: Number,
      },
      scenario: {
        queueLength: Number,
        waitingTimeMinutes: Number,
        doctorUtilization: Number,
        bedOccupancy: Number,
        hospitalLoad: Number,
      },
    },
    method: { type: String, enum: ['queueing_theory', 'discrete_event'], default: 'queueing_theory' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Simulation', simulationSchema);
