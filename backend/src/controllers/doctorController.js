const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const RegistryDoctor = require('../models/RegistryDoctor');

// Helper to generate realistic clinical laboratory & diagnostic reports based on patient clinical presentation
function generateDiagnosticReportsForAssessment(assessment) {
  const { clinicalInputs, riskPrediction } = assessment;
  const isHighUrgency = riskPrediction?.label === 'HIGH_URGENCY';
  const complaint = (clinicalInputs?.chiefComplaint || '').toLowerCase();
  const hr = clinicalInputs?.heartrate || 80;
  const sbp = clinicalInputs?.sbp || 120;
  const o2 = clinicalInputs?.o2sat || 98;
  const temp = clinicalInputs?.temperature || 98.6;
  const reports = [];

  const baseDate = new Date(assessment.createdAt || Date.now());

  // 1. 12-Lead Electrocardiogram (ECG)
  const ecgAbnormal = complaint.includes('chest') || complaint.includes('heart') || hr > 100 || isHighUrgency;
  reports.push({
    reportId: `ECG-${assessment._id.toString().slice(-6)}`,
    testName: '12-Lead Electrocardiogram (ECG)',
    category: 'Cardiology',
    result: ecgAbnormal ? 'Sinus Tachycardia with ST-T segment elevation in V2-V4 (Anterior Lead ischemia)' : 'Normal Sinus Rhythm, PR interval 160ms, no acute ST-T deviations',
    unit: 'Lead Morphology',
    referenceRange: 'Normal Sinus Rhythm (60-100 BPM)',
    flag: ecgAbnormal ? (isHighUrgency ? 'critical' : 'abnormal') : 'normal',
    interpretation: ecgAbnormal ? 'Evidence of acute coronary myocardium stress. Urgent 12-lead serial ECG & Troponin surveillance advised.' : 'Normal electrical conduction with no acute ischemic indices.',
    sampleCollectedAt: new Date(baseDate.getTime() + 5 * 60000),
  });

  // 2. Cardiac Biomarkers (High-Sensitivity Troponin-T)
  const tropElevated = complaint.includes('chest') || complaint.includes('cardiac') || isHighUrgency;
  const tropVal = tropElevated ? (0.038 + (hr > 110 ? 0.05 : 0)).toFixed(3) : '0.008';
  reports.push({
    reportId: `TROP-${assessment._id.toString().slice(-6)}`,
    testName: 'High-Sensitivity Troponin-T (hs-cTnT)',
    category: 'Cardiology / Pathology',
    result: `${tropVal}`,
    unit: 'ng/mL',
    referenceRange: '< 0.014 ng/mL',
    flag: tropElevated ? (parseFloat(tropVal) > 0.03 ? 'critical' : 'abnormal') : 'normal',
    interpretation: tropElevated ? 'Elevated cardiac biomarker above 99th percentile URL indicating myocardial cellular necrosis or demand ischemia.' : 'Within normal physiological baseline.',
    sampleCollectedAt: new Date(baseDate.getTime() + 12 * 60000),
  });

  // 3. Arterial Blood Gas (ABG) & Oxygenation
  const hypoxemic = o2 < 93;
  const pao2Val = hypoxemic ? Math.round(58 + (o2 - 80) * 1.5) : Math.round(88 + Math.random() * 8);
  reports.push({
    reportId: `ABG-${assessment._id.toString().slice(-6)}`,
    testName: 'Arterial Blood Gas (ABG) - PaO2 / SpO2 Index',
    category: 'Pulmonology / Critical Care',
    result: `PaO2: ${pao2Val} mmHg | pH: ${hypoxemic ? '7.32' : '7.39'} | SaO2: ${o2}%`,
    unit: 'mmHg / pH',
    referenceRange: 'PaO2: 80 - 100 mmHg | pH: 7.35 - 7.45',
    flag: hypoxemic ? (pao2Val < 60 ? 'critical' : 'abnormal') : 'normal',
    interpretation: hypoxemic ? 'Acute hypoxemic respiratory insufficiency. High-flow oxygen titration recommended.' : 'Adequate alveolar-arterial oxygen exchange.',
    sampleCollectedAt: new Date(baseDate.getTime() + 15 * 60000),
  });

  // 4. Complete Blood Count (CBC)
  const infection = temp > 100.4;
  const wbc = infection ? '14.8' : (temp > 99 ? '11.4' : '7.8');
  reports.push({
    reportId: `CBC-${assessment._id.toString().slice(-6)}`,
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    result: `WBC: ${wbc} x10^3/uL | Hb: 13.8 g/dL | Platelets: 245 x10^3/uL`,
    unit: 'x10^3/uL',
    referenceRange: 'WBC: 4.5 - 11.0 x10^3/uL | Hb: 12.0 - 16.5 g/dL',
    flag: infection ? 'abnormal' : 'normal',
    interpretation: infection ? 'Leukocytosis with neutrophilic predominance indicative of inflammatory / systemic infectious response.' : 'All cellular lines within standard hematologic limits.',
    sampleCollectedAt: new Date(baseDate.getTime() + 20 * 60000),
  });

  // 5. Comprehensive Metabolic Panel (CMP) - Renal & Electrolytes
  reports.push({
    reportId: `CMP-${assessment._id.toString().slice(-6)}`,
    testName: 'Comprehensive Metabolic Panel (CMP - Creatinine & Electrolytes)',
    category: 'Biochemistry',
    result: 'Creatinine: 0.95 mg/dL | Na+: 139 mEq/L | K+: 4.1 mEq/L | Urea: 22 mg/dL',
    unit: 'mg/dL & mEq/L',
    referenceRange: 'Creatinine: 0.7 - 1.3 mg/dL | Na: 135-145 | K: 3.5-5.0',
    flag: 'normal',
    interpretation: 'Normal glomerular filtration and electrolyte balance.',
    sampleCollectedAt: new Date(baseDate.getTime() + 25 * 60000),
  });

  return reports;
}

// GET /api/v1/doctors/profile/me
async function getDoctorProfile(req, res, next) {
  try {
    let doctor = await Doctor.findById(req.user.id).lean();

    if (!doctor) {
      // Fallback search by email if demo account
      doctor = await Doctor.findOne({ email: 'doctor@medinexus.local' }).lean();
    }

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found.' });
    }

    // Default professional attributes for demonstration doctor if missing
    const enriched = {
      ...doctor,
      subSpecialty: doctor.subSpecialty || 'Interventional Cardiology & Acute Care',
      qualification: doctor.qualification || 'MBBS, MD (General Medicine), DM (Cardiology)',
      experienceYears: doctor.experienceYears ?? 8,
      registrationNumber: doctor.registrationNumber || 'NMC-2016-TN-04892',
      registrationCouncil: doctor.registrationCouncil || 'Tamil Nadu Medical Council / National Medical Commission',
      hospitalAffiliation: doctor.hospitalAffiliation || 'Apollo Hospitals, Greams Road, Chennai',
      department: doctor.department || 'Department of Cardiology & Emergency Medicine',
      designation: doctor.designation || 'Senior Consultant Physician & Clinical Triage Director',
      consultationFee: doctor.consultationFee ?? 1200,
      availableDays: doctor.availableDays?.length ? doctor.availableDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableHours: doctor.availableHours || '09:00 AM - 02:00 PM',
      phone: doctor.phone || '+91 98400 12345',
      bio: doctor.bio || 'Senior clinical consultant specializing in acute cardiac stabilization, physiological triage urgency stratification, and critical emergency transfers across AIIMS and Apollo Quaternary Hospital Networks.',
      languages: doctor.languages?.length ? doctor.languages : ['English', 'Hindi', 'Tamil'],
      clinicalInterests: doctor.clinicalInterests?.length ? doctor.clinicalInterests : ['Shock Index Optimization', 'Acute Coronary Syndrome', 'Non-Invasive Hemodynamic Monitoring', 'Emergency Quaternary Referral Protocols'],
    };

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return next(err);
  }
}

// PUT /api/v1/doctors/profile/me
async function updateDoctorProfile(req, res, next) {
  try {
    const {
      name,
      specialization,
      subSpecialty,
      qualification,
      experienceYears,
      registrationNumber,
      registrationCouncil,
      hospitalAffiliation,
      department,
      designation,
      consultationFee,
      availableDays,
      availableHours,
      phone,
      bio,
      languages,
      clinicalInterests,
    } = req.body;

    let doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      doctor = await Doctor.findOne({ email: 'doctor@medinexus.local' });
    }

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found.' });
    }

    if (name) doctor.name = name.trim();
    if (specialization) doctor.specialization = specialization.trim();
    if (subSpecialty !== undefined) doctor.subSpecialty = subSpecialty.trim();
    if (qualification !== undefined) doctor.qualification = qualification.trim();
    if (experienceYears !== undefined) doctor.experienceYears = Number(experienceYears);
    if (registrationNumber !== undefined) doctor.registrationNumber = registrationNumber.trim();
    if (registrationCouncil !== undefined) doctor.registrationCouncil = registrationCouncil.trim();
    if (hospitalAffiliation !== undefined) doctor.hospitalAffiliation = hospitalAffiliation.trim();
    if (department !== undefined) doctor.department = department.trim();
    if (designation !== undefined) doctor.designation = designation.trim();
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (Array.isArray(availableDays)) doctor.availableDays = availableDays;
    if (availableHours !== undefined) doctor.availableHours = availableHours.trim();
    if (phone !== undefined) doctor.phone = phone.trim();
    if (bio !== undefined) doctor.bio = bio.trim();
    if (Array.isArray(languages)) doctor.languages = languages;
    if (Array.isArray(clinicalInterests)) doctor.clinicalInterests = clinicalInterests;

    await doctor.save();

    // Optionally sync with RegistryDoctor if name matches
    try {
      await RegistryDoctor.findOneAndUpdate(
        { name: doctor.name },
        {
          specialization: doctor.specialization,
          qualification: doctor.qualification,
          experience: `${doctor.experienceYears} Years`,
          experienceYears: doctor.experienceYears,
          registrationNumber: doctor.registrationNumber,
          registrationCouncil: doctor.registrationCouncil,
          verificationStatus: 'Verified',
        }
      );
    } catch {
      // Non-blocking sync
    }

    return res.json({
      success: true,
      data: doctor,
      message: 'Doctor clinical profile updated successfully.',
    });
  } catch (err) {
    return next(err);
  }
}

// GET /api/v1/doctors/cases
async function getDoctorPatientCases(req, res, next) {
  try {
    const { status, urgency, search, limit = 50 } = req.query;

    const query = {};
    if (urgency === 'high') {
      query['riskPrediction.label'] = 'HIGH_URGENCY';
    } else if (urgency === 'low') {
      query['riskPrediction.label'] = { $in: ['LOW_URGENCY', 'UNKNOWN'] };
    }

    const assessments = await Assessment.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('userId', 'name email phone')
      .lean();

    // Transform and enrich cases with physiological markers and lab reports
    const cases = assessments.map((a) => {
      const sbp = a.clinicalInputs?.sbp || 120;
      const dbp = a.clinicalInputs?.dbp || 80;
      const hr = a.clinicalInputs?.heartrate || 80;
      const o2 = a.clinicalInputs?.o2sat || 98;

      // Shock Index = HR / SBP. Normal: 0.5 - 0.7. > 0.9 = high risk
      const shockIndex = sbp > 0 ? Number((hr / sbp).toFixed(2)) : null;
      // Mean Arterial Pressure = DBP + 1/3 (SBP - DBP)
      const map = Number((dbp + (sbp - dbp) / 3).toFixed(1));

      const reports = (a.diagnosticReports && a.diagnosticReports.length > 0)
        ? a.diagnosticReports
        : generateDiagnosticReportsForAssessment(a);

      const patientName = a.dependentSnapshot?.name || a.userId?.name || 'Walk-in Patient';
      const patientAge = a.dependentSnapshot?.ageAtAssessment ?? (a.clinicalInputs?.gender === 'M' ? 46 : 52);
      const isCritical = a.riskPrediction?.label === 'HIGH_URGENCY' || (shockIndex && shockIndex >= 0.9) || o2 < 92;

      return {
        _id: a._id,
        patientName,
        patientAge,
        patientGender: a.dependentSnapshot?.gender || a.clinicalInputs?.gender || 'Other',
        relationship: a.dependentSnapshot?.relationship || 'Self',
        contactEmail: a.userId?.email || 'patient@medinexus.local',
        contactPhone: a.userId?.phone || '+91 98765 43210',
        chiefComplaint: a.clinicalInputs?.chiefComplaint || 'Acute triage assessment',
        locationText: a.locationInput?.raw || 'Chennai, Tamil Nadu',
        createdAt: a.createdAt,
        clinicalInputs: a.clinicalInputs,
        physiologicalMarkers: {
          shockIndex,
          shockIndexRisk: shockIndex >= 0.9 ? 'Elevated Hemodynamic Shock Risk' : 'Normal Hemodynamics',
          meanArterialPressure: map,
          hypoxemiaFlag: o2 < 92,
        },
        riskPrediction: a.riskPrediction,
        isCritical,
        requiredSpecialties: a.requiredSpecialties || [],
        requiredResources: a.requiredResources || [],
        doctorReview: a.doctorReview || {
          status: isCritical ? 'pending' : 'completed',
          reviewedAt: null,
          clinicalNotes: '',
          diagnosisImpression: '',
          prescriptions: [],
          recommendedAction: '',
        },
        diagnosticReports: reports,
      };
    });

    // In-memory text search filtering if provided
    let filteredCases = cases;
    if (search) {
      const q = search.toLowerCase();
      filteredCases = filteredCases.filter(
        (c) =>
          c.patientName.toLowerCase().includes(q) ||
          c.chiefComplaint.toLowerCase().includes(q) ||
          c._id.toString().includes(q) ||
          c.requiredSpecialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'all') {
      filteredCases = filteredCases.filter((c) => c.doctorReview.status === status);
    }

    return res.json({
      success: true,
      count: filteredCases.length,
      data: filteredCases,
    });
  } catch (err) {
    return next(err);
  }
}

// POST /api/v1/doctors/cases/:id/review
async function savePatientCaseNote(req, res, next) {
  try {
    const { id } = req.params;
    const { clinicalNotes, diagnosisImpression, prescriptions, recommendedAction, status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid assessment case ID.' });
    }

    const doctor = await Doctor.findById(req.user.id).lean();
    const doctorName = doctor ? `Dr. ${doctor.name}` : 'Attending Specialist';

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Patient case not found.' });
    }

    // Populate diagnostic reports if none saved yet
    if (!assessment.diagnosticReports || assessment.diagnosticReports.length === 0) {
      assessment.diagnosticReports = generateDiagnosticReportsForAssessment(assessment);
    }

    const normalizedPrescriptions = Array.isArray(prescriptions)
      ? prescriptions
      : typeof prescriptions === 'string'
      ? prescriptions.split('\n').map((p) => p.trim()).filter(Boolean)
      : [];

    assessment.doctorReview = {
      status: status || 'completed',
      doctorId: req.user.id,
      doctorName,
      reviewedAt: new Date(),
      clinicalNotes: (clinicalNotes || '').trim(),
      diagnosisImpression: (diagnosisImpression || '').trim(),
      prescriptions: normalizedPrescriptions,
      recommendedAction: (recommendedAction || '').trim(),
    };

    await assessment.save();

    return res.json({
      success: true,
      data: assessment,
      message: 'Clinical consultation note and prescription saved successfully.',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorPatientCases,
  savePatientCaseNote,
};
