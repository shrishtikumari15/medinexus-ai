const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const Dependent = require('../models/Dependent');
const Recommendation = require('../models/Recommendation');
const Hospital = require('../models/Hospital');
const RegistryDoctor = require('../models/RegistryDoctor');
const mlServiceClient = require('../services/mlServiceClient');
const { geocodeAddress, distanceKm } = require('../services/geocodingService');
const { scoreHospital, DEFAULT_WEIGHTS } = require('../services/recommendationEngine');
const { calculateAge } = require('../utils/age');
const { getBedAvailability } = require('../services/bedAvailability');
const { operationalBedAvailability, selectOperationalRecord } = require('../services/operationalDataset');
const { getSpecialtyTerms } = require('../services/specialtySearch');
const { generateInstitutionalProfile } = require('../services/hospitalProfileGenerator');
const { getHospitalClinicalFaculty } = require('../services/clinicalFacultyProvider');
const { withOperationalData } = require('./hospitalController');

const EMERGENCY_DISCLAIMER =
  'If this is a medical emergency, seek immediate professional medical care or contact emergency services. ' +
  'Medinexus is an AI-assisted decision-support tool and does not replace emergency medical assessment.';

const MAX_CANDIDATE_HOSPITALS = 300; // keep scoring fast; refined by specialty/location filters below
const TOP_K_RESULTS = 10;
const DEMAND_WINDOW_HOURS = 6;
const DEMAND_RADIUS_KM = 50;

// POST /api/v1/assessments
// Flow: patient clinical input -> ML risk + specialty -> candidate hospitals
// -> score/rank -> save Assessment + Recommendation -> return both.
async function createAssessment(req, res, next) {
  try {
    const {
      temperature, heartrate, resprate, o2sat, sbp, dbp, pain,
      chiefComplaint, gender, race, arrivalTransport, locationText,
      dependentId,
    } = req.body;

    let dependent = null;
    if (dependentId) {
      if (!mongoose.isValidObjectId(dependentId)) {
        return res.status(400).json({ success: false, error: 'Invalid dependent ID.' });
      }
      dependent = await Dependent.findOne({ _id: dependentId, userId: req.user.id, deletedAt: null }).lean();
      if (!dependent) return res.status(404).json({ success: false, error: 'Dependent not found or no longer active.' });
    }
    const assessmentDate = new Date();
    const assessmentGender = dependent?.gender || gender || 'Other';
    const dependentAge = dependent ? calculateAge(dependent.dateOfBirth, assessmentDate) : null;

    // 1. Clinical risk + required specialty/resources (Phases 7 & 10)
    const riskResult = await mlServiceClient.predictRisk({
      temperature, heartrate, resprate, o2sat, sbp, dbp, pain,
      chiefComplaint, gender: assessmentGender, race, arrivalTransport,
    });

    // 2. Save the assessment record
    const assessment = await Assessment.create({
      userId: req.user.id,
      dependentId: dependent?._id || null,
      dependentSnapshot: dependent ? {
        name: dependent.name,
        relationship: dependent.relationship,
        dateOfBirth: dependent.dateOfBirth,
        ageAtAssessment: dependentAge,
      } : undefined,
      clinicalInputs: { temperature, heartrate, resprate, o2sat, sbp, dbp, pain, chiefComplaint, gender: assessmentGender },
      locationInput: { raw: locationText || null },
      riskPrediction: {
        label: riskResult.riskLabel,
        probabilityHigh: riskResult.probabilityHighUrgency,
        modelName: riskResult.modelName,
        modelVersion: riskResult.modelVersion,
      },
      requiredSpecialties: riskResult.requiredSpecialties,
      requiredResources: riskResult.requiredResources,
    });

    // 3. Geocode patient location if provided (never guessed if it fails)
    let patientCoords = null;
    if (locationText) {
      patientCoords = await geocodeAddress(locationText);
      if (patientCoords) {
        assessment.locationInput.lat = patientCoords.lat;
        assessment.locationInput.lon = patientCoords.lon;
        await assessment.save();
      }
    }

    // 4. Candidate hospitals selection with verified doctor & operational priority
    const specialtyTerms = [...new Set(riskResult.requiredSpecialties.flatMap(getSpecialtyTerms))]
      .map((term) => new RegExp(String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

    // Step A: Find all hospitals with VERIFIED doctors matching the required specialty
    const verifiedDoctors = await RegistryDoctor.find({
      verificationStatus: 'Verified',
    }).select('hospitalId specialization').lean();

    const verifiedHospIdsForSpecialty = new Set();
    (verifiedDoctors || []).forEach((doc) => {
      const matchesSpec = !specialtyTerms.length || specialtyTerms.some((regex) => regex.test(doc.specialization || ''));
      if (matchesSpec && doc.hospitalId) {
        verifiedHospIdsForSpecialty.add(String(doc.hospitalId));
      }
    });

    // Step B: Normalize location tokens and synonyms
    const rawTokens = (locationText || '')
      .split(/[,/\n-]+/)
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length >= 2);

    const expandedTokens = new Set(rawTokens);
    if (expandedTokens.has('bengaluru') || expandedTokens.has('bangalore') || expandedTokens.has('karnataka')) {
      expandedTokens.add('bengaluru');
      expandedTokens.add('bangalore');
    }
    if (expandedTokens.has('mumbai') || expandedTokens.has('bombay') || expandedTokens.has('maharashtra')) {
      expandedTokens.add('mumbai');
      expandedTokens.add('bombay');
      expandedTokens.add('navi mumbai');
      expandedTokens.add('thane');
    }
    if (expandedTokens.has('kolkata') || expandedTokens.has('calcutta') || expandedTokens.has('west bengal')) {
      expandedTokens.add('kolkata');
      expandedTokens.add('calcutta');
    }
    if (expandedTokens.has('chennai') || expandedTokens.has('madras') || expandedTokens.has('tamil nadu')) {
      expandedTokens.add('chennai');
      expandedTokens.add('madras');
    }
    if (expandedTokens.has('delhi') || expandedTokens.has('ncr') || expandedTokens.has('gurgaon') || expandedTokens.has('noida')) {
      expandedTokens.add('delhi');
      expandedTokens.add('gurgaon');
      expandedTokens.add('gurugram');
      expandedTokens.add('noida');
    }

    const locationRegexes = Array.from(expandedTokens).map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    const isLocationMatch = (h) => {
      if (!locationRegexes.length) return false;
      const combined = `${h.state || ''} ${h.district || ''} ${h.town || ''} ${h.subtown || ''} ${h.address || ''}`;
      return locationRegexes.some((regex) => regex.test(combined));
    };

    // Step C: Query priority candidates (verified doctors for this specialty OR operational dataset)
    const validPriorityIds = Array.from(verifiedHospIdsForSpecialty)
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const priorityHospitals = await Hospital.find({
      $or: [
        { _id: { $in: validPriorityIds } },
        { operationalHospitalId: { $in: ['H001', 'H002', 'H003', 'H004', 'H005'] } },
      ],
    }).limit(100).lean();

    // Step D: Query local candidates matching location & specialty if location provided
    let localCandidates = [];
    if (locationRegexes.length > 0) {
      localCandidates = await Hospital.find({
        $and: [
          {
            $or: [
              { state: { $in: locationRegexes } },
              { district: { $in: locationRegexes } },
              { town: { $in: locationRegexes } },
              { subtown: { $in: locationRegexes } },
              { address: { $in: locationRegexes } },
            ],
          },
          {
            $or: [
              { specialties: { $in: specialtyTerms } },
              { 'officialEnrichment.departments': { $in: specialtyTerms } },
            ],
          },
        ],
      })
        .limit(100)
        .lean();

      // If local candidates with specific specialty are few, include general and emergency facilities in the same location
      if (localCandidates.length < 30) {
        const localGeneral = await Hospital.find({
          $or: [
            { state: { $in: locationRegexes } },
            { district: { $in: locationRegexes } },
            { town: { $in: locationRegexes } },
            { subtown: { $in: locationRegexes } },
            { address: { $in: locationRegexes } },
          ],
        })
          .limit(100)
          .lean();
        localCandidates = [...localCandidates, ...localGeneral];
      }
    }

    // Step E: Query general candidates matching specialty if needed
    let generalCandidates = [];
    if (priorityHospitals.length + localCandidates.length < 50) {
      generalCandidates = await Hospital.find({
        $or: [
          { specialties: { $in: specialtyTerms } },
          { 'officialEnrichment.departments': { $in: specialtyTerms } },
        ],
      })
        .limit(100)
        .lean();
    }

    // Step F: Combine with tiered ranking and deduplication
    const candidateMap = new Map();
    const getHospKey = (h) => {
      const name = (h.name || '').trim();
      if (!name) return String(h._id);
      const normName = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const normCity = (h.town || h.district || h.state || '').toLowerCase().trim();
      return normCity ? `${normName}:::${normCity}` : String(h._id);
    };

    const hasRichData = (h) => {
      const idStr = String(h._id);
      return Boolean(h.operationalHospitalId || verifiedHospIdsForSpecialty.has(idStr) || (h.totalBeds && h.totalBeds > 0));
    };

    const addCandidate = (h) => {
      if (!h || !h._id) return;
      const key = getHospKey(h);
      if (!candidateMap.has(key)) {
        candidateMap.set(key, h);
      } else {
        const existing = candidateMap.get(key);
        if (!hasRichData(existing) && hasRichData(h)) {
          candidateMap.set(key, h);
        }
      }
    };

    const localPriority = priorityHospitals.filter(isLocationMatch);
    const otherPriority = priorityHospitals.filter((h) => !isLocationMatch(h));

    localPriority.forEach(addCandidate);
    localCandidates.forEach(addCandidate);

    if (candidateMap.size < TOP_K_RESULTS) {
      if (locationRegexes.length === 0) {
        otherPriority.forEach(addCandidate);
      }
      generalCandidates.forEach(addCandidate);
      if (candidateMap.size < TOP_K_RESULTS) {
        otherPriority.forEach(addCandidate);
      }
    }

    let candidates = Array.from(candidateMap.values()).slice(0, MAX_CANDIDATE_HOSPITALS);
    if (candidates.length === 0) {
      candidates = await Hospital.find({}).limit(MAX_CANDIDATE_HOSPITALS).lean();
    }

    // Recent recommendations demand signal
    const since = new Date(Date.now() - DEMAND_WINDOW_HOURS * 60 * 60 * 1000);
    const recentDemand = typeof Recommendation.aggregate === 'function'
      ? await Recommendation.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $unwind: '$hospitalRankings' },
        { $match: { 'hospitalRankings.hospitalId': { $in: candidates.map((hospital) => hospital._id) } } },
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessmentId',
            foreignField: '_id',
            as: 'assessment',
          },
        },
        { $unwind: '$assessment' },
        {
          $group: {
            _id: '$hospitalRankings.hospitalId',
            locations: { $push: '$assessment.locationInput' },
          },
        },
      ])
      : [];
    const recentCountsByHospital = new Map(
      recentDemand.map(({ _id, locations }) => {
        const count = locations.filter((location) => {
          if (!patientCoords) return true;
          if (!Number.isFinite(location?.lat) || !Number.isFinite(location?.lon)) return false;
          return distanceKm(patientCoords, { lat: location.lat, lon: location.lon }) <= DEMAND_RADIUS_KM;
        }).length;
        return [String(_id), count];
      })
    );

    // 5. Score each candidate using the mapped CSV row when available.
    const finalRanked = (await Promise.all(candidates.map(async (h) => {
        let hDistance =
          patientCoords && h.geo?.coordinates
            ? distanceKm(patientCoords, { lat: h.geo.coordinates[1], lon: h.geo.coordinates[0] })
            : null;

        // If coordinates unavailable, use location text matching proximity
        if (hDistance === null && locationRegexes.length > 0) {
          if (isLocationMatch(h)) {
            hDistance = 5;
          } else {
            hDistance = 1200;
          }
        }

        const operationalData = h.operationalHospitalId
          ? selectOperationalRecord(h.operationalHospitalId)
          : null;
        const profile = generateInstitutionalProfile(h, operationalData);
        const baseBedAvailability = operationalBedAvailability(operationalData) || getBedAvailability(h);
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
        const resolvedOperationalData = operationalData || {
          hospitalId: h.operationalHospitalId || null,
          totalBeds: profile.totalBeds,
          bedsAvailable: profile.availableBeds,
          occupiedBeds: profile.occupiedBeds,
          bedAvailabilityPercentage: profile.occupancyRate ? (100 - profile.occupancyRate) : 22,
          hospitalLoad: (profile.occupancyRate || 78) / 100,
          waitingTimeMinutes: profile.waitingTimeMinutes,
          sourceDataset: profile.waitingTimeSource,
          available: false,
          message: 'Operational estimate based on hospital category benchmark',
        };
        const expectedWaitMinutes = resolvedOperationalData.waitingTimeMinutes;
        const availabilityPercent = bedAvailability.availabilityPercent;

        const result = scoreHospital({
          hospital: {
            ...h,
            totalBeds: resolvedOperationalData.totalBeds ?? h.totalBeds,
            availableBeds: resolvedOperationalData.bedsAvailable ?? h.availableBeds,
            occupiedBeds: resolvedOperationalData.occupiedBeds ?? h.occupiedBeds,
            bedDataSource: operationalData ? 'operational_dataset' : (h.bedDataSource || 'benchmark'),
            specialties: [...(h.specialties || []), ...(h.officialEnrichment?.departments || [])],
          },
          requiredSpecialties: riskResult.requiredSpecialties,
          requiredResources: riskResult.requiredResources,
          expectedWaitMinutes,
          distanceKm: hDistance,
          recentRecommendationCount: recentCountsByHospital.get(String(h._id)) || 0,
          availabilityPercent,
        });

        // Boost score if hospital has verified specialists for this condition
        const hasVerifiedSpecialists = verifiedHospIdsForSpecialty.has(String(h._id));
        const boostedScore = hasVerifiedSpecialists ? Math.min(100, result.score + 15) : result.score;

        return {
          hospital: h,
          bedAvailability,
          operationalData: resolvedOperationalData,
          waitingTimeSource: operationalData
            ? `Estimated from ${operationalData.sourceDataset}; not real-time.`
            : `Estimated from ${resolvedOperationalData.sourceDataset}; not real-time.`,
          waitingTimeDataMode: operationalData ? 'simulated' : 'benchmark',
          recentRecommendationCount: recentCountsByHospital.get(String(h._id)) || 0,
          distanceKm: hDistance,
          ...result,
          score: boostedScore,
        };
      })))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K_RESULTS);

    const candidateHospitalIds = finalRanked.map((entry) => entry.hospital._id);
    const doctorRecords = candidateHospitalIds.length
      ? await RegistryDoctor.find({
        hospitalId: { $in: candidateHospitalIds },
        verificationStatus: 'Verified',
      }).select('hospitalId name specialization qualification experience experienceYears nmrId sourceUrl officialDoctorProfileUrl officialHospitalUrl hospitalAssociationSourceUrl city state verificationStatus registrationNumber registrationCouncil photoUrl').lean()
      : [];

    const reqSpecialtyTerms = [...new Set((riskResult.requiredSpecialties || []).flatMap(getSpecialtyTerms))];
    const doctorMatchesSpecialty = (doctorSpec) => {
      if (!reqSpecialtyTerms.length) return true;
      return reqSpecialtyTerms.some((term) => new RegExp(`(^|\\b|\\W)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|\\W|$)`, 'i').test(doctorSpec || ''));
    };

    const recommendation = await Recommendation.create({
      assessmentId: assessment._id,
      userId: req.user.id,
      hospitalRankings: finalRanked.map((r) => {
        const hospitalDocs = (doctorRecords || [])
          .filter((doctor) => String(doctor.hospitalId) === String(r.hospital._id))
          .filter((doctor) => doctorMatchesSpecialty(doctor.specialization));

        const enrichmentDocs = (r.hospital.officialEnrichment?.doctors || [])
          .filter((doc) => doc.verificationStatus === 'Verified' && doctorMatchesSpecialty(doc.specialization || doc.title))
          .map((doc) => ({
            doctorId: doc._id || null,
            name: doc.name,
            specialization: doc.specialization || doc.title,
            qualification: doc.qualification || null,
            experience: doc.experienceText || null,
            experienceYears: null,
            nmrId: null,
            sourceUrl: doc.sourceUrl || null,
            officialDoctorProfileUrl: doc.profileUrl || doc.sourceUrl || null,
            officialHospitalUrl: r.hospital.website || null,
            city: r.hospital.town || r.hospital.district || '',
            state: r.hospital.state || '',
            verificationStatus: 'Verified',
            registrationNumber: null,
            registrationCouncil: null,
            photoUrl: null,
          }));

        const seenDocNames = new Set();
        const mergedDocs = [];
        for (const doc of [...hospitalDocs, ...enrichmentDocs]) {
          const normName = (doc.name || '').toLowerCase().trim();
          if (normName && !seenDocNames.has(normName)) {
            seenDocNames.add(normName);
            mergedDocs.push(doc);
          }
        }

        if (mergedDocs.length === 0) {
          const faculty = getHospitalClinicalFaculty(r.hospital, riskResult.requiredSpecialties?.[0]);
          for (const doc of faculty) {
            const normName = (doc.name || '').toLowerCase().trim();
            if (normName && !seenDocNames.has(normName)) {
              seenDocNames.add(normName);
              mergedDocs.push(doc);
            }
          }
        }

        const reasons = [...(r.reasons || [])];
        if (mergedDocs.length > 0) {
          reasons.unshift(`${mergedDocs.length} verified clinical specialist(s) on staff for ${(riskResult.requiredSpecialties || []).join(', ')}`);
        }
        if (r.distanceKm !== null && r.distanceKm < 30) {
          reasons.unshift(`Optimal local proximity (~${r.distanceKm.toFixed(1)} km) within target care zone`);
        }

        const explanationWithDoctors = mergedDocs.length > 0
          ? `${r.explanation} Accompanied by ${mergedDocs.length} verified specialist(s) in ${(riskResult.requiredSpecialties || []).join(', ')}.`
          : r.explanation;

        return {
          hospitalId: r.hospital._id,
          score: r.score,
          breakdown: r.breakdown,
          expectedWaitMinutes: r.expectedWaitMinutes,
          operationalData: r.operationalData,
          distanceKm: r.distanceKm,
          waitingTimeSource: r.waitingTimeSource,
          waitingTimeDataMode: r.waitingTimeDataMode,
          explanation: explanationWithDoctors,
          bedAvailability: r.bedAvailability,
          doctors: mergedDocs.map((doctor) => ({
            doctorId: doctor._id || doctor.doctorId,
            name: doctor.name,
            specialization: doctor.specialization,
            qualification: doctor.qualification,
            experience: doctor.experience,
            experienceYears: doctor.experienceYears,
            nmrId: doctor.nmrId,
            sourceUrl: doctor.sourceUrl,
            officialDoctorProfileUrl: doctor.officialDoctorProfileUrl || doctor.hospitalAssociationSourceUrl || doctor.sourceUrl,
            officialHospitalUrl: doctor.officialHospitalUrl,
            hospitalAssociationSourceUrl: doctor.hospitalAssociationSourceUrl,
            city: doctor.city,
            state: doctor.state,
            verificationStatus: doctor.verificationStatus || 'Verified',
            registrationNumber: doctor.registrationNumber,
            registrationCouncil: doctor.registrationCouncil,
            photoUrl: doctor.photoUrl,
          })),
          recentRecommendationCount: r.recentRecommendationCount,
          reasons,
        };
      }),
      scoreWeightsUsed: finalRanked[0] ? finalRanked[0].weightsUsed : DEFAULT_WEIGHTS,
      demandContext: {
        windowHours: DEMAND_WINDOW_HOURS,
        radiusKm: patientCoords ? DEMAND_RADIUS_KM : null,
        locationScoped: Boolean(patientCoords),
      },
    });

    // Populate recommendation with complete hospital and assessment details if supported
    let populatedRecommendation = null;
    if (typeof Recommendation.findById === 'function') {
      try {
        const query = Recommendation.findById(recommendation._id);
        if (query && typeof query.populate === 'function') {
          populatedRecommendation = await query
            .populate('hospitalRankings.hospitalId', 'name description address location town subtown village district subdistrict pincode state stateId districtId website telephone mobileNumber emergencyNumber category careType accreditation totalBeds availableBeds occupiedBeds sourceRowId specialties facilities emergencyFlag emergencyFlagSource operationalHospitalId officialEnrichment geo')
            .populate('assessmentId', 'clinicalInputs dependentSnapshot dependentId createdAt requiredSpecialties requiredResources locationInput riskPrediction')
            .lean();
          if (populatedRecommendation && Array.isArray(populatedRecommendation.hospitalRankings)) {
            populatedRecommendation.hospitalRankings = populatedRecommendation.hospitalRankings.map((ranking) => ({
              ...ranking,
              hospitalId: ranking.hospitalId && typeof ranking.hospitalId === 'object'
                ? withOperationalData(ranking.hospitalId)
                : ranking.hospitalId,
            }));
          }
        }
      } catch {
        populatedRecommendation = null;
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        assessment: {
          ...(typeof assessment.toObject === 'function' ? assessment.toObject() : assessment),
          chiefComplaint: assessment.clinicalInputs?.chiefComplaint,
          locationText: assessment.locationInput?.raw,
          vitals: assessment.clinicalInputs,
        },
        recommendation: populatedRecommendation || recommendation,
        riskDisclaimer: riskResult.disclaimer,
        emergencyDisclaimer: riskResult.riskLabel === 'HIGH_URGENCY' ? EMERGENCY_DISCLAIMER : null,
      },
    });
  } catch (err) {
    const isMlUnavailable =
      err && (
        err.code === 'ML_SERVICE_UNAVAILABLE' ||
        err.code === 'ECONNREFUSED' ||
        err.message?.includes('ECONNREFUSED')
      );

    if (isMlUnavailable) {
      return res.status(503).json({
        success: false,
        error: err.code === 'ML_SERVICE_UNAVAILABLE'
          ? err.message
          : 'ML service is unavailable. Please start the Python service and try again.',
      });
    }

    return next(err);
  }
}

// GET /api/v1/assessments/history
async function getRecommendationHistory(req, res, next) {
  try {
    const { scope = 'all', dependentId } = req.query;
    if (req.query.scope && !['all', 'mine', 'family'].includes(req.query.scope)) {
      return res.status(400).json({ success: false, error: 'Invalid history filter.' });
    }
    const assessmentFilter = { userId: req.user.id };
    if (dependentId) {
      if (!mongoose.isValidObjectId(dependentId)) {
        return res.status(400).json({ success: false, error: 'Invalid dependent ID.' });
      }
      const dependent = await Dependent.findOne({ _id: dependentId, userId: req.user.id }).select('+deletedAt').lean();
      if (!dependent) return res.status(404).json({ success: false, error: 'Dependent not found.' });
      assessmentFilter.dependentId = dependent._id;
    } else if (scope === 'mine') {
      assessmentFilter.dependentId = null;
    } else if (scope === 'family') {
      assessmentFilter.dependentId = { $ne: null };
    }
    const assessmentIds = await Assessment.find(assessmentFilter).distinct('_id');
    const recommendations = await Recommendation.find({ userId: req.user.id, assessmentId: { $in: assessmentIds } })
      .sort({ createdAt: -1 })
      .populate('hospitalRankings.hospitalId', 'name state district')
      .populate('assessmentId', 'clinicalInputs dependentSnapshot dependentId createdAt')
      .lean();
    return res.json({ success: true, data: recommendations });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createAssessment, getRecommendationHistory };
