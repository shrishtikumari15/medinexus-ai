const mongoose = require('mongoose');

const registryDoctorSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    nmrId: { type: String, trim: true, index: true },
    registrationNumber: { type: String, trim: true, index: true },
    registrationYear: { type: Number, min: 1900, max: 2100 },
    stateMedicalCouncil: { type: String, trim: true, index: true },
    qualification: { type: String, trim: true },
    qualificationSourceUrl: { type: String, trim: true },
    specialization: { type: String, trim: true, index: true },
    specializationSourceUrl: { type: String, trim: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null, index: true },
    hospitalName: { type: String, trim: true, index: true },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true, index: true },
    hospitalAssociationSourceUrl: { type: String, trim: true },
    officialDoctorProfileUrl: { type: String, trim: true },
    officialHospitalUrl: { type: String, trim: true },
    experience: { type: String, trim: true },
    experienceSourceUrl: { type: String, trim: true },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Unverified', 'not_independently_verified'],
      default: 'Verified',
      index: true,
    },
    source: { type: String, trim: true },
    sourceName: { type: String, required: true, default: 'Official Hospital Directory' },
    sourceUrl: { type: String, required: true, trim: true, default: 'https://nmr.nmc.org.in/search-doctor' },
    lastVerifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

registryDoctorSchema.index({ stateMedicalCouncil: 1, registrationNumber: 1, registrationYear: 1 }, { sparse: true });
registryDoctorSchema.index({ hospitalId: 1, specialization: 1 });
registryDoctorSchema.index({ state: 1, city: 1, specialization: 1 });

module.exports = mongoose.model('RegistryDoctor', registryDoctorSchema);