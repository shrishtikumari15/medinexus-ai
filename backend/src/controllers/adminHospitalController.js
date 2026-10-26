const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');

const EDITABLE_FIELDS = [
  'name', 'description', 'address', 'location', 'state', 'district', 'subdistrict', 'town',
  'subtown', 'village', 'pincode', 'specialties', 'facilities', 'emergencyFlag',
  'emergencyFlagSource', 'totalBeds', 'availableBeds', 'occupiedBeds', 'bedDataSource',
  'bedDataSourceName', 'bedDataSourceUrl', 'category', 'careType', 'website', 'telephone',
  'mobileNumber', 'emergencyNumber', 'operationalHospitalId', 'sourceName', 'sourceUrl',
];
const OPERATIONAL_HOSPITAL_IDS = ['H001', 'H002', 'H003', 'H004', 'H005'];

function secureUrl(value) {
  if (!value) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function escapeRegex(value) {
  return Array.from(String(value), (character) => '.*+?^${}()|[]\\'.includes(character) ? `\\${character}` : character).join('');
}

function validateHospital(body, { creating = false } = {}) {
  if (creating && (!String(body.name || '').trim() || !String(body.state || '').trim())) return 'Hospital name and state are required.';
  if (body.operationalHospitalId !== undefined && body.operationalHospitalId !== null && body.operationalHospitalId !== '' && !OPERATIONAL_HOSPITAL_IDS.includes(body.operationalHospitalId)) return 'operationalHospitalId must be one of H001-H005 or null.';
  if (body.sourceUrl && !secureUrl(body.sourceUrl)) return 'sourceUrl must use HTTPS.';
  if (body.bedDataSourceUrl && !secureUrl(body.bedDataSourceUrl)) return 'bedDataSourceUrl must use HTTPS.';
  if (body.website && !secureUrl(body.website)) return 'website must use HTTPS.';
  for (const field of ['specialties', 'facilities']) {
    if (body[field] !== undefined && (!Array.isArray(body[field]) || body[field].some((item) => typeof item !== 'string'))) return `${field} must be an array of text values.`;
  }
  const bedFields = ['totalBeds', 'availableBeds', 'occupiedBeds'];
  if (bedFields.some((field) => body[field] !== undefined)) {
    for (const field of bedFields) {
      const value = body[field];
      if (value !== undefined && value !== null && (!Number.isInteger(Number(value)) || Number(value) < 0)) return `${field} must be a non-negative whole number or null.`;
    }
    const total = Number(body.totalBeds);
    const available = Number(body.availableBeds);
    const occupied = Number(body.occupiedBeds);
    if (body.totalBeds !== undefined && body.totalBeds !== null && (body.availableBeds > total || body.occupiedBeds > total || (body.availableBeds !== undefined && body.occupiedBeds !== undefined && available + occupied > total))) return 'Bed counts cannot exceed totalBeds.';
    const hasBedCounts = bedFields.some((field) => body[field] !== undefined && body[field] !== null);
    if (hasBedCounts && body.totalBeds == null && (body.availableBeds != null || body.occupiedBeds != null)) return 'Total beds are required when available or occupied bed counts are supplied.';
    if (hasBedCounts && !['reported', 'simulated'].includes(body.bedDataSource)) return 'bedDataSource must be reported or simulated when bed counts are updated.';
    if (body.bedDataSource === 'reported' && (!body.bedDataSourceName || !body.bedDataSourceUrl || !secureUrl(body.bedDataSourceUrl))) return 'Reported bed data requires a source name and HTTPS source URL.';
  }
  if (body.operationalSnapshot !== undefined) {
    const snapshot = body.operationalSnapshot;
    if (!snapshot || typeof snapshot !== 'object' || !['H001', 'H002', 'H003', 'H004', 'H005'].includes(snapshot.hospitalId)) return 'Operational snapshot must map to an existing simulated model hospital (H001-H005).';
    const numericFields = ['patientArrivals', 'doctorsAvailable', 'queueLength', 'doctorUtilization', 'diagnosticUtilization', 'hospitalLoad', 'hour', 'dayOfWeek'];
    if (numericFields.some((field) => !Number.isFinite(Number(snapshot[field])))) return 'Operational snapshot is incomplete.';
    if (numericFields.some((field) => snapshot[field] === '' || snapshot[field] === null || snapshot[field] === undefined)) return 'Operational snapshot is incomplete.';
    if (['patientArrivals', 'doctorsAvailable', 'queueLength'].some((field) => snapshot[field] < 0)) return 'Operational counts cannot be negative.';
    if (!Number.isInteger(Number(snapshot.hour)) || snapshot.hour < 0 || snapshot.hour > 23 || !Number.isInteger(Number(snapshot.dayOfWeek)) || snapshot.dayOfWeek < 0 || snapshot.dayOfWeek > 6) return 'Operational hour or dayOfWeek is invalid.';
    if (['doctorUtilization', 'diagnosticUtilization', 'hospitalLoad'].some((field) => snapshot[field] < 0 || snapshot[field] > 1)) return 'Operational utilization values must be between 0 and 1.';
    if (!['simulated', 'reported'].includes(snapshot.source)) return 'Operational snapshot source must be simulated or reported.';
    if (!snapshot.sourceName || !snapshot.observedAt || Number.isNaN(Date.parse(snapshot.observedAt))) return 'Operational snapshot sourceName and observedAt are required.';
    if (snapshot.sourceUrl && !secureUrl(snapshot.sourceUrl)) return 'Operational snapshot sourceUrl must use HTTPS.';
  }
  return null;
}

function editableValues(body) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => EDITABLE_FIELDS.includes(key)));
}

async function listAdminHospitals(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const searchText = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const filter = searchText ? { name: new RegExp(escapeRegex(searchText), 'i') } : {};
    const [data, total] = await Promise.all([
      Hospital.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Hospital.countDocuments(filter),
    ]);
    return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { return next(err); }
}

async function createHospital(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ success: false, error: 'Hospital data must be an object.' });
    const error = validateHospital(req.body, { creating: true });
    if (error) return res.status(400).json({ success: false, error });
    if (!req.body.sourceUrl || !req.body.sourceName) return res.status(400).json({ success: false, error: 'A source name and source URL are required for a new hospital.' });
    if (req.body.operationalHospitalId) {
      const alreadyMapped = await Hospital.exists({ operationalHospitalId: req.body.operationalHospitalId });
      if (alreadyMapped) return res.status(409).json({ success: false, error: 'That operational dataset ID is already linked to another hospital.' });
    }
    const hospital = await Hospital.create(editableValues(req.body));
    return res.status(201).json({ success: true, data: hospital });
  } catch (err) { return next(err); }
}

async function updateHospital(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid hospital ID.' });
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ success: false, error: 'Hospital data must be an object.' });
    const error = validateHospital(req.body);
    if (error) return res.status(400).json({ success: false, error });
    const values = editableValues(req.body);
    if (values.operationalHospitalId) {
      const alreadyMapped = await Hospital.exists({
        _id: { $ne: req.params.id },
        operationalHospitalId: values.operationalHospitalId,
      });
      if (alreadyMapped) return res.status(409).json({ success: false, error: 'That operational dataset ID is already linked to another hospital.' });
    }
    if (['totalBeds', 'availableBeds', 'occupiedBeds'].some((field) => field in values)) values.bedDataUpdatedAt = new Date();
    const update = { $set: values };
    if ('operationalHospitalId' in values) update.$unset = { operationalSnapshot: '' };
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!hospital) return res.status(404).json({ success: false, error: 'Hospital not found.' });
    return res.json({ success: true, data: hospital });
  } catch (err) { return next(err); }
}

module.exports = { listAdminHospitals, createHospital, updateHospital, validateHospital };