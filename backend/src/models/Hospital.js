const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    // Sr_No from the original Government of India directory - lets us trace
    // every record back to its source row for auditability.
    sourceRowId: { type: Number, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    sourceName: { type: String, trim: true },
    sourceUrl: { type: String, trim: true },
    address: { type: String, trim: true },
    location: { type: String, trim: true }, // free-text "Location" field from source
    state: { type: String, trim: true, index: true },
    district: { type: String, trim: true, index: true },
    subdistrict: { type: String, trim: true },
    town: { type: String, trim: true },
    subtown: { type: String, trim: true },
    village: { type: String, trim: true },
    pincode: { type: String, trim: true },
    stateId: { type: Number, default: null },
    districtId: { type: Number, default: null },

    // GeoJSON point - null when the source had no coordinates and
    // Geoapify geocoding did not resolve it either.
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined }, // [lon, lat]
    },
    geocodeSource: {
      type: String,
      enum: ['source_file', 'geoapify', 'unresolved'],
      default: 'unresolved',
    },

    specialties: [{ type: String, index: true }],
    facilities: [{ type: String, index: true }],

    emergencyFlag: { type: Boolean, default: false },
    // Documents whether emergencyFlag came from genuine source data or was
    // inferred from keyword matching - required per the Phase 0 audit finding
    // that Emergency_Services is populated in only 2 of 30,273 source rows.
    emergencyFlagSource: { type: String, enum: ['raw', 'derived'], default: 'derived' },

    totalBeds: { type: Number, default: null }, // null = unknown, never 0-by-default
    availableBeds: { type: Number, default: null, min: 0 },
    occupiedBeds: { type: Number, default: null, min: 0 },
    bedDataSource: { type: String, enum: ['unknown', 'reported', 'simulated'], default: 'unknown' },
    bedDataSourceName: { type: String, trim: true },
    bedDataSourceUrl: { type: String, trim: true },
    bedDataUpdatedAt: { type: Date },
    operationalSnapshot: {
      hospitalId: { type: String, enum: ['H001', 'H002', 'H003', 'H004', 'H005'] },
      patientArrivals: Number,
      doctorsAvailable: Number,
      queueLength: Number,
      doctorUtilization: Number,
      diagnosticUtilization: Number,
      hospitalLoad: Number,
      hour: { type: Number, min: 0, max: 23 },
      dayOfWeek: { type: Number, min: 0, max: 6 },
      observedAt: Date,
      source: { type: String, enum: ['simulated', 'reported'] },
      sourceName: String,
      sourceUrl: String,
    },
    numberDoctors: { type: Number, default: null },
    consultantCount: { type: Number, default: null },
    privateWardCount: { type: Number, default: null },
    economicallyWeakerBeds: { type: Number, default: null },

    category: { type: String, trim: true }, // Private / Public-Government / unknown
    careType: { type: String, trim: true },
    medicineSystems: [{ type: String }],
    ayushSystems: [{ type: String }],
    miscellaneousFacilities: [{ type: String }],
    accreditation: { type: String, trim: true },
    establishedYear: { type: Number, default: null },
    empanelment: { type: String, trim: true },
    tariffRange: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    registrationScan: { type: String, trim: true },
    website: { type: String, trim: true },
    telephone: { type: String, trim: true },
    mobileNumber: { type: String, trim: true },
    emergencyNumber: { type: String, trim: true },
    ambulancePhone: { type: String, trim: true },
    bloodbankPhone: { type: String, trim: true },
    foreignPatientCare: { type: String, trim: true },
    tollfree: { type: String, trim: true },
    helpline: { type: String, trim: true },
    fax: { type: String, trim: true },
    primaryEmail: { type: String, trim: true },
    secondaryEmail: { type: String, trim: true },
    nodalPerson: { type: String, trim: true },
    nodalPersonTelephone: { type: String, trim: true },
    nodalPersonEmail: { type: String, trim: true },
    officialEnrichment: {
      sourceUrl: { type: String, trim: true },
      checkedAt: { type: Date },
      summary: { type: String, trim: true },
      departments: [{ type: String, trim: true }],
      services: [{ type: String, trim: true }],
      technologies: [{ type: String, trim: true }],
      doctors: [
        {
          name: { type: String, trim: true },
          title: { type: String, trim: true },
          specialization: { type: String, trim: true },
          qualification: { type: String, trim: true },
          experienceText: { type: String, trim: true },
          biography: { type: String, trim: true },
          expertise: [{ type: String, trim: true }],
          profileUrl: { type: String, trim: true },
          bookingUrl: { type: String, trim: true },
          sourceUrl: { type: String, trim: true },
          verificationStatus: { type: String, default: 'Verified' },
          registrationNumber: { type: String, trim: true },
          source: { type: String, trim: true },
        },
      ],
    },

    // Links this hospital to one of the 5 simulated operational hospital_ids
    // (H001-H005) if/when an admin maps it, so waiting-time prediction can
    // apply. Left null for the other ~30,000 hospitals per the documented
    // Phase 0 limitation.
    operationalHospitalId: {
      type: String,
      enum: ['H001', 'H002', 'H003', 'H004', 'H005', null],
      default: null,
    },

    duplicateFlag: { type: Boolean, default: false }, // true for the 211 Name+Location duplicates found in audit
  },
  { timestamps: true }
);

hospitalSchema.index({ geo: '2dsphere' });
hospitalSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('Hospital', hospitalSchema);
