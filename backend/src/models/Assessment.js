const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dependentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dependent', default: null },
    dependentSnapshot: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      dateOfBirth: { type: Date },
      ageAtAssessment: { type: Number, min: 0 },
    },
    clinicalInputs: {
      temperature: Number,
      heartrate: Number,
      resprate: Number,
      o2sat: Number,
      sbp: Number,
      dbp: Number,
      pain: Number,
      chiefComplaint: { type: String, required: true },
      gender: { type: String, enum: ['M', 'F', 'Other'] },
    },
    locationInput: {
      raw: { type: String },
      lat: { type: Number },
      lon: { type: Number },
    },
    riskPrediction: {
      label: { type: String, enum: ['LOW_URGENCY', 'HIGH_URGENCY', 'UNKNOWN'], default: 'UNKNOWN' },
      probabilityHigh: { type: Number },
      modelName: { type: String }, // "random_forest" | "lightgbm"
      modelVersion: { type: String },
    },
    requiredSpecialties: [{ type: String }],
    requiredResources: [{ type: String }],
    doctorReview: {
      status: {
        type: String,
        enum: ['pending', 'in_review', 'completed', 'admitted'],
        default: 'pending',
      },
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      doctorName: { type: String, trim: true },
      reviewedAt: { type: Date },
      clinicalNotes: { type: String, trim: true },
      diagnosisImpression: { type: String, trim: true },
      prescriptions: [{ type: String, trim: true }],
      recommendedAction: { type: String, trim: true },
    },
    diagnosticReports: [
      {
        reportId: { type: String },
        testName: { type: String, required: true },
        category: { type: String },
        result: { type: String },
        unit: { type: String },
        referenceRange: { type: String },
        flag: { type: String, enum: ['normal', 'abnormal', 'critical'], default: 'normal' },
        interpretation: { type: String },
        sampleCollectedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
