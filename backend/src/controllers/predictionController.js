const mlServiceClient = require('../services/mlServiceClient');

const NUMERIC_FIELDS = [
  'patientArrivals',
  'doctorsAvailable',
  'totalBeds',
  'bedsAvailable',
  'bedOccupancy',
  'queueLength',
  'doctorUtilization',
  'diagnosticUtilization',
  'hospitalLoad',
  'hour',
  'dayOfWeek',
];
const HOSPITAL_IDS = new Set(['H001', 'H002', 'H003', 'H004', 'H005']);

async function predictWaitingTime(req, res, next) {
  const input = req.body || {};
  if (!HOSPITAL_IDS.has(input.hospitalId)) {
    return res.status(400).json({ success: false, error: 'hospitalId must be one of H001-H005.' });
  }
  if (NUMERIC_FIELDS.some((field) => input[field] === null || input[field] === '' || !Number.isFinite(Number(input[field])))) {
    return res.status(400).json({ success: false, error: 'All operational prediction features must be finite numbers.' });
  }
  if (Number(input.hour) < 0 || Number(input.hour) > 23 || !Number.isInteger(Number(input.hour))) {
    return res.status(400).json({ success: false, error: 'hour must be an integer from 0 to 23.' });
  }
  if (Number(input.dayOfWeek) < 0 || Number(input.dayOfWeek) > 6 || !Number.isInteger(Number(input.dayOfWeek))) {
    return res.status(400).json({ success: false, error: 'dayOfWeek must be an integer from 0 to 6.' });
  }
  if (
    NUMERIC_FIELDS.filter((field) => !['hour', 'dayOfWeek'].includes(field))
      .some((field) => Number(input[field]) < 0) ||
    Number(input.totalBeds) <= 0 ||
    Number(input.bedsAvailable) > Number(input.totalBeds) ||
    ['bedOccupancy', 'doctorUtilization', 'diagnosticUtilization', 'hospitalLoad']
      .some((field) => Number(input[field]) > 1)
  ) {
    return res.status(400).json({ success: false, error: 'Operational counts must be non-negative, bedsAvailable cannot exceed totalBeds, and ratios must be from 0 to 1.' });
  }

  try {
    const prediction = await mlServiceClient.predictWaitingTime(input);
    const predictedWaitingTime = Number(
      prediction?.predicted_waiting_time_minutes ?? prediction?.expectedWaitMinutes
    );
    if (!Number.isFinite(predictedWaitingTime)) {
      return next(new Error('ML service returned an invalid waiting-time prediction.'));
    }
    return res.json({
      success: true,
      data: {
        predicted_waiting_time_minutes: predictedWaitingTime,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { predictWaitingTime };
