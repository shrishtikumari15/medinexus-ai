const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['doctor'], default: 'doctor' },
    specialization: { type: String, required: true, trim: true },
    subSpecialty: { type: String, trim: true },
    qualification: { type: String, trim: true },
    experienceYears: { type: Number, min: 0 },
    registrationNumber: { type: String, trim: true },
    registrationCouncil: { type: String, trim: true },
    hospitalAffiliation: { type: String, trim: true },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    consultationFee: { type: Number, min: 0, default: 1000 },
    availableDays: [{ type: String, trim: true }],
    availableHours: { type: String, trim: true },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true },
    languages: [{ type: String, trim: true }],
    clinicalInterests: [{ type: String, trim: true }],
    documents: [
      {
        url: { type: String, required: true },
        type: { type: String }, // e.g. "medical_license", "degree_certificate"
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
