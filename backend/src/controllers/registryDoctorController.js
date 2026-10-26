const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const RegistryDoctor = require('../models/RegistryDoctor');
const { getSpecialtyTerms } = require('../services/specialtySearch');
const { getCityAliases } = require('../utils/locationSearch');

const NMR_SOURCE = 'National Medical Register (NMC)';
const NMR_URL = 'https://nmr.nmc.org.in/search-doctor';
const MAX_RESULTS = 100;

function escapeRegex(value) {
  return Array.from(String(value), (character) => '.*+?^${}()|[]\\'.includes(character) ? `\\${character}` : character).join('');
}

function queryValue(value) {
  return typeof value === 'string' ? value.trim().slice(0, 100) : '';
}

function sourcedUrl(value) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function publicDoctor(doctor) {
  const value = { ...doctor };
  value.verificationStatus = value.verificationStatus || 'Verified';
  value.nmrReferenceStatus = value.sourceUrl?.includes('nmr.nmc.org.in')
    ? 'Reference available; not independently verified by MediNexus'
    : value.officialDoctorProfileUrl || value.sourceUrl
      ? 'Official Hospital Directory Verified'
      : 'Reference unavailable';
  for (const field of ['nmrId', 'registrationYear', 'qualification', 'specialization', 'experience', 'lastVerifiedAt', 'officialDoctorProfileUrl', 'officialHospitalUrl']) {
    if (value[field] === undefined) value[field] = null;
  }
  return value;
}

async function searchDoctors(req, res, next) {
  try {
    const state = queryValue(req.query.state);
    const city = queryValue(req.query.city);
    const hospital = queryValue(req.query.hospital);
    const specialty = queryValue(req.query.specialty);
    const specialtyTerms = getSpecialtyTerms(specialty);
    const specialtyPatterns = specialtyTerms.map((term) => new RegExp(escapeRegex(term), 'i'));
    const q = queryValue(req.query.q);
    const filter = {};
    const hospitalFilter = {};

    if (state) {
      const stateRegex = new RegExp(escapeRegex(state.trim()), 'i');
      hospitalFilter.state = stateRegex;
    }
    if (city) {
      const cityPatterns = getCityAliases(city).map((alias) => new RegExp(escapeRegex(alias), 'i'));
      hospitalFilter.$or = ['district', 'town', 'subdistrict', 'subtown', 'village', 'location']
        .flatMap((field) => cityPatterns.map((pattern) => ({ [field]: pattern })));
    }
    if (hospital) {
      if (mongoose.isValidObjectId(hospital)) {
        hospitalFilter._id = hospital;
      } else {
        hospitalFilter.name = new RegExp(escapeRegex(hospital.trim()), 'i');
      }
    }
    if (state || city || hospital) {
      const hospitalIds = await Hospital.find(hospitalFilter).distinct('_id');
      if (city || hospital) filter.hospitalId = { $in: hospitalIds };
      else filter.$or = [
        { stateMedicalCouncil: new RegExp(escapeRegex(state.trim()), 'i') },
        { hospitalId: { $in: hospitalIds } },
      ];
    }
    if (specialty) filter.specialization = { $in: specialtyPatterns };
    if (q) {
      const query = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$and = (filter.$and || []).concat([{ $or: [
        { name: query }, { nmrId: query }, { registrationNumber: query }, { stateMedicalCouncil: query },
      ] }]);
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_RESULTS, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const profileConditions = [{ 'officialEnrichment.doctors.0': { $exists: true } }];
    if (Object.keys(hospitalFilter).length) profileConditions.push(hospitalFilter);
    if (specialty) profileConditions.push({ $or: [
      { 'officialEnrichment.doctors.specialization': { $in: specialtyPatterns } },
      { 'officialEnrichment.doctors.title': { $in: specialtyPatterns } },
    ] });
    if (q) profileConditions.push({ 'officialEnrichment.doctors.name': new RegExp(escapeRegex(q), 'i') });

    const [records, total, profileHospitals] = await Promise.all([
      RegistryDoctor.find(filter).populate('hospitalId', 'name state district town address specialties').sort({ name: 1 })
        .skip(0).limit(Math.min(page * limit, 1000)).lean(),
      RegistryDoctor.countDocuments(filter),
      Hospital.find({ $and: profileConditions })
        .select('name state district town address officialEnrichment')
        .limit(1000)
        .lean(),
    ]);
    const officialRecords = profileHospitals.flatMap((hospitalItem) => (
      hospitalItem.officialEnrichment?.doctors || []
    ).map((doctor, index) => {
      const profileUrl = sourcedUrl(doctor.profileUrl) || sourcedUrl(doctor.sourceUrl);
      const sourceUrl = sourcedUrl(doctor.sourceUrl) || profileUrl;
      if (!doctor.name || !profileUrl || !sourceUrl) return null;
      if (specialty && !specialtyTerms.some((term) => `${doctor.specialization || ''} ${doctor.title || ''}`.toLowerCase().includes(term.toLowerCase()))) return null;
      if (q && !new RegExp(escapeRegex(q), 'i').test(`${doctor.name} ${doctor.specialization || ''}`)) return null;
      return {
        _id: `${hospitalItem._id}:${index}`,
        recordType: 'hospital_profile',
        name: doctor.name,
        registrationNumber: doctor.registrationNumber || null,
        registrationYear: null,
        nmrId: null,
        stateMedicalCouncil: null,
        qualification: doctor.qualification || null,
        specialization: doctor.specialization || doctor.title || null,
        title: doctor.title || null,
        experience: doctor.experienceText || null,
        biography: doctor.biography || null,
        expertise: Array.isArray(doctor.expertise) ? doctor.expertise : [],
        source: doctor.source || 'Official Hospital Profile',
        sourceName: hospitalItem.name,
        sourceUrl,
        profileUrl,
        bookingUrl: sourcedUrl(doctor.bookingUrl) || null,
        verificationStatus: doctor.verificationStatus || 'Verified',
        hospitalId: {
          _id: hospitalItem._id,
          name: hospitalItem.name,
          state: hospitalItem.state,
          district: hospitalItem.district,
          town: hospitalItem.town,
          address: hospitalItem.address,
        },
        nmrReferenceStatus: 'Hospital-published profile; not independently verified by MediNexus',
      };
    }).filter(Boolean));

    const combinedRaw = [...records.map(publicDoctor), ...officialRecords];
    const seenDoctors = new Set();
    const combined = [];
    for (const doc of combinedRaw) {
      const hId = doc.hospitalId?._id ? String(doc.hospitalId._id) : (doc.hospitalId ? String(doc.hospitalId) : '');
      const key = `${doc.name.toLowerCase()}_${hId}`;
      if (!seenDoctors.has(key)) {
        seenDoctors.add(key);
        combined.push(doc);
      }
    }
    combined.sort((left, right) => left.name.localeCompare(right.name));

    const totalResults = combined.length;
    const pageRecords = combined.slice((page - 1) * limit, page * limit);
    return res.json({
      success: true,
      data: pageRecords,
      pagination: { page, limit, total: totalResults, pages: Math.ceil(totalResults / limit) },
      source: { name: NMR_SOURCE, url: NMR_URL, verificationNote: 'A public registry reference is not a MediNexus verification or endorsement.' },
    });
  } catch (err) {
    return next(err);
  }
}

async function getDoctorById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid doctor ID.' });
    const doctor = await RegistryDoctor.findById(req.params.id)
      .populate('hospitalId', 'name state district town address specialties facilities telephone website geo')
      .lean();
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor record not found.' });
    return res.json({ success: true, data: publicDoctor(doctor) });
  } catch (err) {
    return next(err);
  }
}

function validateRegistryPayload(body, { partial = false } = {}) {
  const required = ['name', 'registrationNumber', 'stateMedicalCouncil'];
  if (!partial && required.some((field) => !String(body[field] || '').trim())) return 'Name, registration number, and State Medical Council are required.';
  if (body.sourceUrl && (!sourcedUrl(body.sourceUrl) || new URL(body.sourceUrl).hostname !== 'nmr.nmc.org.in')) return 'The registration reference must point to the official NMC National Medical Register.';
  if (body.registrationYear !== undefined && body.registrationYear !== null && (!Number.isInteger(Number(body.registrationYear)) || Number(body.registrationYear) < 1900 || Number(body.registrationYear) > new Date().getFullYear())) return 'Invalid registration year.';
  for (const [field, sourceField] of [
    ['qualification', 'qualificationSourceUrl'],
    ['specialization', 'specializationSourceUrl'],
    ['experience', 'experienceSourceUrl'],
  ]) {
    if (body[field] && !sourcedUrl(body[sourceField])) return `${field} requires a secure source reference.`;
    if (body[sourceField] && !sourcedUrl(body[sourceField])) return `${sourceField} must be a secure URL.`;
  }
  if (body.hospitalId && !sourcedUrl(body.hospitalAssociationSourceUrl)) return 'A hospital association requires a secure source reference.';
  if (body.hospitalAssociationSourceUrl && !sourcedUrl(body.hospitalAssociationSourceUrl)) return 'hospitalAssociationSourceUrl must be a secure URL.';
  if (body.hospitalId && !mongoose.isValidObjectId(body.hospitalId)) return 'Invalid hospital ID.';
  return null;
}

async function upsertDoctor(req, res, next) {
  try {
    if (req.params.id && !mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid doctor ID.' });
    const validationError = validateRegistryPayload(req.body, { partial: Boolean(req.params.id) });
    if (validationError) return res.status(400).json({ success: false, error: validationError });
    if (req.body.hospitalId && !await Hospital.exists({ _id: req.body.hospitalId })) return res.status(404).json({ success: false, error: 'Hospital not found.' });

    const allowed = [
      'name', 'nmrId', 'registrationNumber', 'registrationYear', 'stateMedicalCouncil',
      'qualification', 'qualificationSourceUrl', 'specialization', 'specializationSourceUrl',
      'hospitalId', 'hospitalAssociationSourceUrl', 'experience', 'experienceSourceUrl',
      'sourceUrl', 'lastVerifiedAt',
    ];
    const values = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (values.sourceUrl) values.sourceName = NMR_SOURCE;
    if (!req.params.id) {
      values.doctorId = new mongoose.Types.ObjectId().toString();
      values.sourceName = NMR_SOURCE;
      values.sourceUrl = values.sourceUrl || NMR_URL;
    }
    if (values.lastVerifiedAt && (Number.isNaN(Date.parse(values.lastVerifiedAt)) || new Date(values.lastVerifiedAt) > new Date())) return res.status(400).json({ success: false, error: 'lastVerifiedAt must be a valid date in the past.' });

    const doctor = req.params.id
      ? await RegistryDoctor.findByIdAndUpdate(req.params.id, { $set: values }, { new: true, runValidators: true })
      : await RegistryDoctor.create(values);
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor record not found.' });
    return res.status(req.params.id ? 200 : 201).json({ success: true, data: doctor });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, error: 'A doctor record with this council registration already exists.' });
    return next(err);
  }
}

async function importDoctors(req, res, next) {
  try {
    const records = req.body?.records;
    if (!Array.isArray(records) || records.length === 0 || records.length > 500) {
      return res.status(400).json({ success: false, error: 'records must contain between 1 and 500 sourced doctor records.' });
    }

    const imported = [];
    const rejected = [];
    for (const [index, record] of records.entries()) {
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        rejected.push({ row: index + 1, error: 'Each record must be an object.' });
        continue;
      }
      const error = validateRegistryPayload(record);
      if (error) {
        rejected.push({ row: index + 1, error });
        continue;
      }
      if (record.hospitalId && !await Hospital.exists({ _id: record.hospitalId })) {
        rejected.push({ row: index + 1, error: 'Hospital not found.' });
        continue;
      }
      const values = Object.fromEntries(Object.entries(record).filter(([key]) => [
        'name', 'nmrId', 'registrationNumber', 'registrationYear', 'stateMedicalCouncil',
        'qualification', 'qualificationSourceUrl', 'specialization', 'specializationSourceUrl',
        'hospitalId', 'hospitalAssociationSourceUrl', 'experience', 'experienceSourceUrl',
        'sourceUrl', 'lastVerifiedAt',
      ].includes(key)));
      values.sourceUrl = values.sourceUrl || NMR_URL;
      values.sourceName = NMR_SOURCE;
      const existing = await RegistryDoctor.findOne({
        stateMedicalCouncil: values.stateMedicalCouncil,
        registrationNumber: values.registrationNumber,
      }).select('_id').lean();
      if (!existing) values.doctorId = new mongoose.Types.ObjectId().toString();
      try {
        const saved = await RegistryDoctor.findOneAndUpdate(
          { stateMedicalCouncil: values.stateMedicalCouncil, registrationNumber: values.registrationNumber },
          { $set: values, $setOnInsert: { doctorId: values.doctorId } },
          { new: true, upsert: true, runValidators: true }
        ).select('_id doctorId');
        imported.push({ row: index + 1, doctorId: saved._id });
      } catch (err) {
        rejected.push({ row: index + 1, error: err.code === 11000 ? 'Duplicate council registration.' : 'Record failed model validation.' });
      }
    }
    return res.status(rejected.length ? 207 : 201).json({
      success: rejected.length === 0,
      data: { importedCount: imported.length, rejectedCount: rejected.length, imported, rejected },
      note: 'Imported records retain their source references and are not independently verified by MediNexus.',
    });
  } catch (err) { return next(err); }
}

module.exports = { searchDoctors, getDoctorById, upsertDoctor, importDoctors, validateRegistryPayload };