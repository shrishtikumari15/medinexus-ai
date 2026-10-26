const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
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
    role: { type: String, enum: ['user'], default: 'user' },
    phone: { type: String, trim: true },
    // Optional location captured once so future assessments can prefill it.
    lastKnownLocation: {
      raw: { type: String },
      lat: { type: Number },
      lon: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
