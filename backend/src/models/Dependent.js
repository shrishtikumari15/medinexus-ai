const mongoose = require('mongoose');

const dependentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    relationship: { type: String, required: true, trim: true, maxlength: 40 },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['M', 'F', 'Other'], default: undefined },
    deletedAt: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

dependentSchema.index({ userId: 1, deletedAt: 1, createdAt: -1 });

module.exports = mongoose.model('Dependent', dependentSchema);