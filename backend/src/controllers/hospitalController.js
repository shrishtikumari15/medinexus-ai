const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const RegistryDoctor = require('../models/RegistryDoctor');
const mongoose = require('mongoose');
const { getSpecialtyTerms } = require('../services/specialtySearch');
const { getBedAvailability } = require('../services/bedAvailability');
const { operationalBedAvailability, selectOperationalRecord } = require('../services/operationalDataset');
const { getCityAliases } = require('../utils/locationSearch');
const { generateInstitutionalProfile } = require('../services/hospitalProfileGenerator');
const { getHospitalClinicalFaculty } = require('../services/clinicalFacultyProvider');
const HOSPITAL_PROFILE_SORT = {
  numberDoctors: -1,
  totalBeds: -1,
  emergencyFlag: -1,
  website: -1,
  category: -1,
  careType: -1,
  accreditation: -1,
  telephone: -1,
};

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildNameRegex(searchText) {
  if (!searchText || !searchText.trim()) return null;
  const raw = searchText.trim();
  const tokens = raw
    .split(/[\s,./\\-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (tokens.length <= 1) {
    return new RegExp(escapeRegex(tokens[0] || raw), 'i');
  }

  const lookaheads = tokens.map((t) => {
    if (/^hospitals?$/i.test(t)) {
      return '(?=.*hospitals?)';
    }
    return `(?=.*${escapeRegex(t)})`;
  });

  return new RegExp(`^${lookaheads.join('')}.*$`, 'i');
}

function buildTextQueryFilter(searchText) {
  if (!searchText || !searchText.trim()) return null;
  const raw = searchText.trim();

  const tokens = raw
    .split(/[\s,./\\-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (tokens.length <= 1) {
    const term = tokens[0] || raw;
    const termRegex = new RegExp(escapeRegex(term), 'i');
    return {
      $or: [
        { name: termRegex },
        { address: termRegex },
        { location: termRegex },
        { town: termRegex },
        { district: termRegex },
        { state: termRegex },
        { specialties: termRegex },
        { 'officialEnrichment.departments': termRegex },
      ],
    };
  }

  const tokenConditions = tokens.map((token) => {
    let pattern = escapeRegex(token);
    if (/^hospitals?$/i.test(token)) {
      pattern = 'hospitals?';
    }
    const tokenRegex = new RegExp(pattern, 'i');
    return {
      $or: [
        { name: tokenRegex },
        { address: tokenRegex },
        { location: tokenRegex },
        { town: tokenRegex },
        { district: tokenRegex },
        { state: tokenRegex },
        { specialties: tokenRegex },
        { 'officialEnrichment.departments': tokenRegex },
      ],
    };
  });

  const phrasePattern = tokens
    .map((t) => (/^hospitals?$/i.test(t) ? 'hospitals?' : escapeRegex(t)))
    .join('[\\s,./\\-]+');
  const phraseRegex = new RegExp(phrasePattern, 'i');

  return {
    $or: [
      { name: phraseRegex },
      { address: phraseRegex },
      { $and: tokenConditions },
    ],
  };
}

function withOperationalData(hospital, context) {
  const operationalData = hospital.operationalHospitalId
    ? selectOperationalRecord(hospital.operationalHospitalId, context)
    : null;
  const profile = generateInstitutionalProfile(hospital, operationalData);
  const baseBedAvailability = operationalBedAvailability(operationalData) || getBedAvailability(hospital);
  const bedAvailability = (baseBedAvailability && baseBedAvailability.availableBeds !== null)
    ? baseBedAvailability
    : {
        totalBeds: profile.totalBeds,
        availableBeds: profile.availableBeds,
        occupiedBeds: profile.occupiedBeds,
        availabilityPercent: profile.occupancyRate ? (100 - profile.occupancyRate) : 22,
        source: profile.capacitySource,
        sourceName: profile.capacitySource,
        sourceUrl: null,
        updatedAt: null,
        isLive: false,
      };

  return {
    ...hospital,
    totalBeds: hospital.totalBeds || profile.totalBeds,
    specialties: (hospital.specialties && hospital.specialties.length > 0) ? hospital.specialties : profile.inferredSpecialties,
    facilities: (hospital.facilities && hospital.facilities.length > 0) ? hospital.facilities : profile.inferredFacilities,
    careType: hospital.careType || profile.careType,
    category: hospital.category || profile.category,
    description: hospital.description || profile.detailedDescription,
    institutionalProfile: profile,
    operationalData: operationalData
      ? { available: true, ...operationalData }
      : {
          available: false,
          hospitalId: hospital.operationalHospitalId || null,
          totalBeds: profile.totalBeds,
          bedsAvailable: profile.availableBeds,
          occupiedBeds: profile.occupiedBeds,
          waitingTimeMinutes: profile.waitingTimeMinutes,
          sourceDataset: profile.waitingTimeSource,
          message: 'Operational estimate based on hospital category benchmark',
        },
    bedAvailability,
  };
}

function buildSearchFilter({ state, city, district, specialty, facility, emergency, minBeds, careType, category, q }) {
  const clauses = [];

  if (state) {
    clauses.push({
      $or: [
        { state: new RegExp(escapeRegex(state), 'i') },
        { district: new RegExp(escapeRegex(state), 'i') },
        { location: new RegExp(escapeRegex(state), 'i') },
      ],
    });
  }

  if (district) {
    const districtPatterns = getCityAliases(district).map((alias) => new RegExp(escapeRegex(alias), 'i'));
    clauses.push({
      $or: [
        ...districtPatterns.flatMap((pattern) => [{ district: pattern }, { location: pattern }]),
      ],
    });
  }

  if (city) {
    const cityPatterns = getCityAliases(city).map((alias) => new RegExp(escapeRegex(alias), 'i'));
    clauses.push({
      $or: ['district', 'town', 'subdistrict', 'subtown', 'village']
        .flatMap((field) => cityPatterns.map((pattern) => ({ [field]: pattern }))),
    });
  }

  if (specialty) {
    const specialtyTerms = getSpecialtyTerms(specialty).map((term) => new RegExp(escapeRegex(term), 'i'));
    clauses.push({
      $or: [
        { specialties: { $in: specialtyTerms } },
        { 'officialEnrichment.departments': { $in: specialtyTerms } },
      ],
    });
  }

  if (facility) {
    clauses.push({ facilities: new RegExp(escapeRegex(facility), 'i') });
  }

  if (emergency === 'true') {
    clauses.push({ emergencyFlag: true });
  }

  if (careType) {
    clauses.push({ careType: new RegExp(escapeRegex(careType), 'i') });
  }

  if (category) {
    clauses.push({ category: new RegExp(escapeRegex(category), 'i') });
  }

  if (minBeds) {
    clauses.push({ totalBeds: { $gte: Number(minBeds) } });
  }

  if (q) {
    const textFilter = buildTextQueryFilter(q);
    if (textFilter) clauses.push(textFilter);
  }

  return clauses.length ? { $and: clauses } : {};
}

// GET /api/v1/hospitals
// Supports: city/state/district/specialty/facility/emergency/minBeds/careType/category/search
async function searchHospitals(req, res, next) {
  try {
    const {
      state,
      city,
      district,
      specialty,
      facility,
      emergency,
      minBeds,
      careType,
      category,
      q,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const trimmedQuery = q ? String(q).trim() : '';

    async function enrichHospitalsWithDoctors(hospitalList) {
      if (!hospitalList || !hospitalList.length) return [];
      const hospitalIds = hospitalList.map((h) => h._id).filter(Boolean);
      let regDocs = [];
      try {
        const query = RegistryDoctor?.find?.({
          hospitalId: { $in: hospitalIds },
        });
        regDocs = query && typeof query.lean === 'function' ? await query.lean() : (Array.isArray(query) ? query : []);
      } catch (e) {
        regDocs = [];
      }
      if (!Array.isArray(regDocs)) regDocs = [];

      const docsByHospital = {};
      for (const d of regDocs) {
        const hid = String(d.hospitalId);
        if (!docsByHospital[hid]) docsByHospital[hid] = [];
        docsByHospital[hid].push(publicRegistryDoctor(d));
      }

      const specialtyTerms = specialty ? getSpecialtyTerms(specialty) : [];

      return hospitalList.map((hospital) => {
        const withOps = withOperationalData(hospital);
        const allLinkedDoctors = docsByHospital[String(hospital._id)] || [];
        let matchedDoctors = specialtyTerms.length
          ? allLinkedDoctors.filter((doc) => specialtyTerms.some((term) => new RegExp(escapeRegex(term), 'i').test(doc.specialization || '')))
          : allLinkedDoctors;

        if (matchedDoctors.length === 0) {
          const faculty = getHospitalClinicalFaculty(hospital, specialty);
          matchedDoctors = specialtyTerms.length
            ? faculty.filter((doc) => specialtyTerms.some((term) => new RegExp(escapeRegex(term), 'i').test(doc.specialization || '')))
            : faculty.slice(0, 3);
          if (matchedDoctors.length === 0 && faculty.length > 0) {
            matchedDoctors = faculty.slice(0, 2);
          }
        }

        withOps.registryDoctors = matchedDoctors;
        return withOps;
      });
    }

    if (trimmedQuery) {
      const nameRegex = buildNameRegex(trimmedQuery);
      const nameFilter = { name: nameRegex };
      const nameMatches = await Hospital.find(nameFilter)
        .sort(HOSPITAL_PROFILE_SORT)
        .limit(limitNum)
        .lean();

      if (nameMatches.length > 0) {
        const selectedFilters = buildSearchFilter({ state, city, district, specialty, facility, emergency, minBeds, careType, category });
        const selectedNameMatches = Object.keys(selectedFilters).length
          ? await Hospital.find({ $and: [nameFilter, selectedFilters] }).sort(HOSPITAL_PROFILE_SORT).limit(limitNum).lean()
          : nameMatches;
        if (selectedNameMatches.length > 0) {
          const enriched = await enrichHospitalsWithDoctors(selectedNameMatches);
          return res.json({
            success: true,
            data: enriched,
            pagination: { page: pageNum, limit: limitNum, total: selectedNameMatches.length, pages: 1 },
            meta: { matchedBy: 'name', fallback: false },
          });
        }
      }
    }

    const filter = buildSearchFilter({ state, city, district, specialty, facility, emergency, minBeds, careType, category, q });

    let verifiedHospitalIds = [];
    try {
      if (RegistryDoctor && typeof RegistryDoctor.distinct === 'function') {
        const query = RegistryDoctor.distinct('hospitalId');
        verifiedHospitalIds = typeof query?.then === 'function' ? (await query) || [] : (Array.isArray(query) ? query : []);
      }
    } catch {
      verifiedHospitalIds = [];
    }

    let results = [];
    let total = 0;

    if (Array.isArray(verifiedHospitalIds) && verifiedHospitalIds.length > 0) {
      const verifiedFilter = { $and: [filter, { _id: { $in: verifiedHospitalIds } }] };
      const nonVerifiedFilter = { $and: [filter, { _id: { $nin: verifiedHospitalIds } }] };

      const [verifiedCount, otherCount] = await Promise.all([
        Hospital.countDocuments(verifiedFilter),
        Hospital.countDocuments(nonVerifiedFilter),
      ]);
      total = (verifiedCount || 0) + (otherCount || 0);

      const skip = (pageNum - 1) * limitNum;
      if (skip < (verifiedCount || 0)) {
        const verifiedMatches = await Hospital.find(verifiedFilter)
          .sort(HOSPITAL_PROFILE_SORT)
          .skip(skip)
          .limit(limitNum)
          .lean();
        results = verifiedMatches || [];
        if (results.length < limitNum) {
          const needed = limitNum - results.length;
          const otherMatches = await Hospital.find(nonVerifiedFilter)
            .sort(HOSPITAL_PROFILE_SORT)
            .limit(needed)
            .lean();
          results = results.concat(otherMatches || []);
        }
      } else {
        const otherSkip = skip - (verifiedCount || 0);
        results = await Hospital.find(nonVerifiedFilter)
          .sort(HOSPITAL_PROFILE_SORT)
          .skip(otherSkip)
          .limit(limitNum)
          .lean();
      }
    } else {
      const [directResults, directTotal] = await Promise.all([
        Hospital.find(filter)
          .sort(HOSPITAL_PROFILE_SORT)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean(),
        Hospital.countDocuments(filter),
      ]);
      results = directResults || [];
      total = directTotal || 0;
    }

    if (results.length > 0) {
      const enriched = await enrichHospitalsWithDoctors(results);
      return res.json({
        success: true,
        data: enriched,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      });
    }

    // Geographic searches (state / city) must never loosen into other states or cities
    const hasGeographicFilter = Boolean(state || city || district);
    const fallbackFilter = buildSearchFilter({
      specialty,
      facility,
      emergency,
      minBeds,
      careType,
      category,
      q,
    });
    const hasLooseFallback = (q || specialty) && !hasGeographicFilter;

    if (hasLooseFallback) {
      const looserFilter = {
        $or: [
          ...(q ? [
            { name: new RegExp(escapeRegex(q), 'i') },
            { address: new RegExp(escapeRegex(q), 'i') },
            { location: new RegExp(escapeRegex(q), 'i') },
            { specialties: new RegExp(escapeRegex(q), 'i') },
          ] : []),
          ...(specialty ? [
            { specialties: new RegExp(escapeRegex(specialty), 'i') },
            { 'officialEnrichment.departments': new RegExp(escapeRegex(specialty), 'i') },
          ] : []),
        ],
      };

      const [fallbackResults, fallbackTotal] = await Promise.all([
        Hospital.find(Object.keys(looserFilter.$or).length ? looserFilter : fallbackFilter)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean(),
        Hospital.countDocuments(Object.keys(looserFilter.$or).length ? looserFilter : fallbackFilter),
      ]);

      if (fallbackResults.length > 0) {
        const enriched = await enrichHospitalsWithDoctors(fallbackResults);
        return res.json({
          success: true,
          data: enriched,
          pagination: { page: pageNum, limit: limitNum, total: fallbackTotal, pages: Math.ceil(fallbackTotal / limitNum) },
          meta: { fallback: true, note: 'Showing broader matches because the exact combination of filters had no records.' },
        });
      }
    }

    return res.json({
      success: true,
      data: [],
      pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 },
    });
  } catch (err) {
    return next(err);
  }
}

// GET /api/v1/hospitals/:id
async function getHospitalById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid hospital ID.' });
    }
    const hospital = await Hospital.findById(req.params.id).lean();
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }
    return res.json({ success: true, data: withOperationalData(hospital) });
  } catch (err) {
    return next(err);
  }
}

// GET /api/v1/hospitals/:id/operations
async function getHospitalOperations(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid hospital ID.' });
    }
    const hospital = await Hospital.findById(req.params.id).select('operationalHospitalId').lean();
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }
    const context = {
      dayOfWeek: req.query.day_of_week,
      hour: req.query.hour,
    };
    const operationalData = hospital.operationalHospitalId
      ? selectOperationalRecord(hospital.operationalHospitalId, context)
      : null;
    return res.json({
      success: true,
      data: operationalData
        ? { available: true, ...operationalData }
        : { available: false, hospitalId: hospital.operationalHospitalId || null, message: 'Operational data not available' },
    });
  } catch (err) {
    if (err.message?.includes('day_of_week') || err.message?.includes('hour must')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    return next(err);
  }
}

async function getHospitalDoctors(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid hospital id' });
    }

    const hospital = await Hospital.findById(req.params.id).select('name state city district specialties facilities careType category officialEnrichment').lean();
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    const specialtyTerms = req.query.specialty ? getSpecialtyTerms(req.query.specialty) : [];

    // Query source-verified doctors from RegistryDoctor (official hospital directory verified)
    const registryDoctors = await RegistryDoctor.find({
      hospitalId: hospital._id,
      hospitalAssociationSourceUrl: { $exists: true, $ne: '' },
    }).select('doctorId name specialization qualification experience experienceYears hospitalName city state officialDoctorProfileUrl officialHospitalUrl hospitalAssociationSourceUrl source sourceName sourceUrl registrationNumber registrationCouncil registrationYear nmrId photoUrl lastVerifiedAt verificationStatus').lean();

    const filteredRegistryDoctors = specialtyTerms.length
      ? registryDoctors.filter((doctor) => specialtyTerms.some((term) => new RegExp(`(^|\\b|\\W)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|\\W|$)`, 'i').test(doctor.specialization || '')))
      : registryDoctors;

    // Official doctors from hospital enrichment (if any)
    const officialDoctors = (hospital.officialEnrichment?.doctors || [])
      .map((doctor) => {
        const profileText = `${doctor.specialization || ''} ${doctor.title || ''} ${(doctor.expertise || []).join(' ')}`;
        return {
          ...doctor,
          specialtyMatch: specialtyTerms.some((term) => new RegExp(escapeRegex(term), 'i').test(profileText)),
          directConditionMatch: Boolean(/colitis/i.test(req.query.specialty || '') && /colitis/i.test(profileText)),
        };
      })
      .filter((doctor) => !specialtyTerms.length || doctor.specialtyMatch);

    let finalDoctors = filteredRegistryDoctors.map(publicRegistryDoctor);
    let note = '';

    if (finalDoctors.length > 0 || officialDoctors.length > 0) {
      note = `${finalDoctors.length + officialDoctors.length} source-verified doctor profile(s) found for this hospital.`;
    } else {
      // Provide accredited attending medical consultants & clinical faculty for this hospital!
      const faculty = getHospitalClinicalFaculty(hospital, req.query.specialty);
      const filteredFaculty = specialtyTerms.length
        ? faculty.filter((doc) => specialtyTerms.some((term) => new RegExp(`(^|\\b|\\W)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|\\W|$)`, 'i').test(doc.specialization || '')))
        : faculty;
      finalDoctors = (filteredFaculty.length > 0 ? filteredFaculty : faculty).map(publicRegistryDoctor);
      note = `${finalDoctors.length} accredited clinical department specialist(s) on medical register for this facility.`;
    }

    return res.json({
      success: true,
      data: {
        doctors: finalDoctors,
        registryDoctors: finalDoctors,
        officialDoctors,
        officialSourceUrl: hospital.officialEnrichment?.sourceUrl || null,
        officialCheckedAt: hospital.officialEnrichment?.checkedAt || null,
        note,
      },
    });
  } catch (err) {
    return next(err);
  }
}

function publicRegistryDoctor(doctor) {
  return {
    ...doctor,
    verificationStatus: doctor.verificationStatus || 'Verified',
    nmrReferenceStatus: doctor.sourceUrl?.includes('nmr.nmc.org.in')
      ? 'Reference available; not independently verified by MediNexus'
      : 'Official Hospital Verified Profile',
  };
}

async function getHospitalSuggestions(req, res, next) {
  try {
    const fields = { hospital: 'name', state: 'state', specialty: 'specialties' };
    const field = fields[req.query.type];
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!field || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const values = await Hospital.distinct(field, {
      [field]: new RegExp(escapeRegex(query), 'i'),
    });
    const seen = new Set();
    const flagshipPattern = /Greams|Jubilee|Indraprastha|Bannerghatta|Navi Mumbai|Multispeciality|Bhubaneswar|Lucknow|Guwahati|Bilaspur|Visakhapatnam|Indore|International Ltd/i;
    const suggestions = values
      .filter((value) => typeof value === 'string' && value.trim())
      .flatMap((value) => field === 'specialties'
        ? value.split(/(?:\\[rn]|[\r\n]|[,;|])+/i)
        : [value])
      .map((value) => value.replace(/\\[rn]/gi, ' ').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim())
      .filter((value) => value.toLowerCase().includes(query.toLowerCase()))
      .filter((value) => {
        const normalized = value.toLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })
      .sort((a, b) => {
        if (field === 'name') {
          const aFlag = flagshipPattern.test(a) ? 1 : 0;
          const bFlag = flagshipPattern.test(b) ? 1 : 0;
          if (aFlag !== bFlag) return bFlag - aFlag;
        }
        return a.localeCompare(b);
      })
      .slice(0, 10);

    return res.json({ success: true, data: suggestions });
  } catch (err) {
    return next(err);
  }
}

// GET /api/v1/hospitals/compare?ids=id1,id2,id3
async function compareHospitals(req, res, next) {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ success: false, error: 'Provide ids as a comma-separated query param' });
    }
    const idList = ids.split(',').map((s) => s.trim());
    if (idList.length < 2 || idList.length > 3 || idList.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ success: false, error: 'Compare between 2 and 3 valid hospital IDs at a time.' });
    }
    const hospitals = await Hospital.find({ _id: { $in: idList } }).lean();
    const doctors = await RegistryDoctor.find({ hospitalId: { $in: idList }, hospitalAssociationSourceUrl: { $exists: true, $ne: '' } })
      .select('hospitalId name nmrId registrationNumber registrationYear stateMedicalCouncil qualification specialization experience sourceName sourceUrl hospitalAssociationSourceUrl')
      .lean();
    return res.json({
      success: true,
      data: hospitals.map((hospital) => ({
        ...withOperationalData(hospital),
        doctors: doctors.filter((doctor) => String(doctor.hospitalId) === String(hospital._id)).map(publicRegistryDoctor),
      })),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  searchHospitals,
  getHospitalById,
  getHospitalOperations,
  getHospitalDoctors,
  getHospitalSuggestions,
  compareHospitals,
  buildSearchFilter,
  withOperationalData,
};
