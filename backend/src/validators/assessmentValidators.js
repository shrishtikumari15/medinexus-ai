const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  return next();
}

const createAssessmentRules = [
  body('chiefComplaint').trim().notEmpty().withMessage('chiefComplaint is required'),
  body('dependentId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid dependent ID.'),
  body('temperature').optional({ nullable: true }).isFloat({ min: 70, max: 115 }).withMessage('Temperature must be between 70 and 115 °F.'),
  body('heartrate').optional({ nullable: true }).isInt({ min: 20, max: 250 }).withMessage('Heart rate must be between 20 and 250 bpm.'),
  body('resprate').optional({ nullable: true }).isInt({ min: 1, max: 80 }).withMessage('Respiratory rate must be between 1 and 80 breaths per minute.'),
  body('o2sat').optional({ nullable: true }).isFloat({ min: 50, max: 100 }).withMessage('O2 saturation must be between 50 and 100%.')
    .bail(),
  body('sbp').optional({ nullable: true }).isInt({ min: 40, max: 300 }).withMessage('Systolic BP must be between 40 and 300 mmHg.'),
  body('dbp').optional({ nullable: true }).isInt({ min: 20, max: 200 }).withMessage('Diastolic BP must be between 20 and 200 mmHg.'),
  body('pain').optional({ nullable: true }).isInt({ min: 0, max: 10 }).withMessage('Pain level must be between 0 and 10.'),
  body('locationText').optional({ nullable: true }).isString(),
];

module.exports = { handleValidation, createAssessmentRules };
