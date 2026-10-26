const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  return next();
}

function scenarioRules(prefix) {
  return [
    body(`${prefix}.arrivalRatePerHour`).isFloat({ min: 0.01 }).withMessage(`${prefix}.arrivalRatePerHour must be positive`),
    body(`${prefix}.doctorsAvailable`).isInt({ min: 1 }).withMessage(`${prefix}.doctorsAvailable must be at least 1`),
    body(`${prefix}.bedsAvailable`).isInt({ min: 1 }).withMessage(`${prefix}.bedsAvailable must be at least 1`),
    body(`${prefix}.serviceRateMinutesPerPatient`).isFloat({ min: 0.1 }).withMessage(`${prefix}.serviceRateMinutesPerPatient must be positive`),
  ];
}

const runSimulationRules = [...scenarioRules('baseline'), ...scenarioRules('scenario')];

module.exports = { handleValidation, runSimulationRules };
