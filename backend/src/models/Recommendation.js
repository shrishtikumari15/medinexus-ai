const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospitalRankings: [
      {
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
        score: { type: Number, required: true }, // 0-100
        breakdown: {
          specialtyMatch: Number,
          facilityMatch: Number,
          emergencyCapability: Number,
          resourceSuitability: Number,
          bedAvailability: Number,
          waitingTimeScore: Number,
          locationScore: Number,
          congestionScore: Number,
        },
        bedAvailability: {
          totalBeds: { type: Number, default: null },
          availableBeds: { type: Number, default: null },
          occupiedBeds: { type: Number, default: null },
          availabilityPercent: { type: Number, default: null },
          source: { type: String, default: 'unknown' },
          sourceName: String,
          sourceUrl: String,
          updatedAt: Date,
          isLive: { type: Boolean, default: false },
        },
        expectedWaitMinutes: { type: Number, default: null }, // null = unavailable (no operational data mapped)
        operationalData: { type: mongoose.Schema.Types.Mixed, default: null },
          distanceKm: { type: Number, default: null },
        waitingTimeSource: { type: String, default: null },
        waitingTimeDataMode: { type: String, default: null },
        explanation: { type: String, default: '' },
        doctors: [
          {
            doctorId: { type: mongoose.Schema.Types.Mixed, default: null },
            name: String,
            specialization: String,
            qualification: String,
            experience: String,
            experienceYears: Number,
            nmrId: String,
            sourceUrl: String,
            officialDoctorProfileUrl: String,
            officialHospitalUrl: String,
            hospitalAssociationSourceUrl: String,
            city: String,
            state: String,
            verificationStatus: { type: String, default: 'Verified' },
            registrationNumber: String,
            registrationCouncil: String,
            photoUrl: String,
          },
        ],
        recentRecommendationCount: { type: Number, default: 0 },
        reasons: [{ type: String }],
      },
    ],
    scoreWeightsUsed: {
      specialty: Number,
      facility: Number,
      emergency: Number,
      resource: Number,
      bedAvailability: Number,
      waitingTime: Number,
      location: Number,
      congestion: Number,
    },
    demandContext: {
      windowHours: Number,
      radiusKm: { type: Number, default: null },
      locationScoped: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
