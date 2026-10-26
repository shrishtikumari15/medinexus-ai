/**
 * One-time (re-runnable) import script: loads
 * data/processed/hospital/hospitals_clean.csv into the Hospital collection.
 *
 * Run from backend/:
 *   node src/scripts/importHospitals.js
 *
 * Safe to re-run: it upserts on sourceRowId, so re-running after a fresh
 * ETL pass updates existing records instead of duplicating them.
 */
const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/sync');
const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');

const CSV_PATH = path.join(__dirname, '../../../data/processed/hospital/hospitals_clean.csv');

function toNullableNumber(value) {
  if (value === '' || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toBool(value) {
  return String(value).trim().toLowerCase() === 'true';
}

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('[import] connected to MongoDB');

  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = csvParse.parse(fileContent, { columns: true, skip_empty_lines: true });
  console.log(`[import] read ${rows.length} rows from ${CSV_PATH}`);

  let upserted = 0;
  const bulkOps = rows.map((row) => {
    const lat = toNullableNumber(row.latitude);
    const lon = toNullableNumber(row.longitude);
    const hasCoords = lat !== null && lon !== null;

    const doc = {
      sourceRowId: Number(row.source_row_id),
      name: row.name,
      address: row.address || '',
      location: row.location || '',
      state: row.state || '',
      district: row.district || '',
      subdistrict: row.subdistrict || '',
      town: row.town || '',
      subtown: row.subtown || '',
      village: row.village || '',
      pincode: row.pincode || '',
      stateId: toNullableNumber(row.state_id),
      districtId: toNullableNumber(row.district_id),
      telephone: row.telephone || null,
      mobileNumber: row.mobile_number || null,
      emergencyNumber: row.emergency_number || null,
      ambulancePhone: row.ambulance_phone || null,
      bloodbankPhone: row.bloodbank_phone || null,
      foreignPatientCare: row.foreign_patient_care || null,
      tollfree: row.tollfree || null,
      helpline: row.helpline || null,
      fax: row.fax || null,
      primaryEmail: row.primary_email || null,
      secondaryEmail: row.secondary_email || null,
      registrationNumber: row.registration_number || null,
      registrationScan: row.registration_scan || null,
      nodalPerson: row.nodal_person || null,
      nodalPersonTelephone: row.nodal_person_telephone || null,
      nodalPersonEmail: row.nodal_person_email || null,
      establishedYear: toNullableNumber(row.established_year),
      medicineSystems: JSON.parse(row.medicine_systems || '[]'),
      ayushSystems: JSON.parse(row.ayush_systems || '[]'),
      miscellaneousFacilities: JSON.parse(row.miscellaneous_facilities || '[]'),
      specialties: JSON.parse(row.specialties || '[]'),
      facilities: JSON.parse(row.facilities || '[]'),
      emergencyFlag: toBool(row.emergency_flag),
      emergencyFlagSource: row.emergency_flag_source,
      totalBeds: toNullableNumber(row.total_beds),
      numberDoctors: toNullableNumber(row.number_doctors),
      consultantCount: toNullableNumber(row.consultant_count),
      privateWardCount: toNullableNumber(row.private_ward_count),
      economicallyWeakerBeds: toNullableNumber(row.economically_weaker_beds),
      category: row.category || null,
      careType: row.care_type || null,
      empanelment: row.empanelment || null,
      tariffRange: row.tariff_range || null,
      accreditation: row.accreditation || null,
      website: row.website || null,
      duplicateFlag: toBool(row.duplicate_flag),
      geocodeSource: hasCoords ? 'source_file' : 'unresolved',
    };

    const updateDoc = { $set: doc };
    if (hasCoords) {
      updateDoc.$set.geo = { type: 'Point', coordinates: [lon, lat] };
    } else {
      updateDoc.$unset = { geo: '' };
    }

    return {
      updateOne: {
        filter: { sourceRowId: doc.sourceRowId },
        update: updateDoc,
        upsert: true,
      },
    };
  });

  // Mongo bulkWrite has a practical batch size limit - chunk it.
  const BATCH_SIZE = 2000;
  for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
    const batch = bulkOps.slice(i, i + BATCH_SIZE);
    const result = await Hospital.bulkWrite(batch);
    upserted += result.upsertedCount + result.modifiedCount;
    console.log(`[import] processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length}`);
  }

  console.log(`[import] done. ${upserted} hospitals upserted/updated.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[import] failed:', err);
  process.exit(1);
});
