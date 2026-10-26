const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');
const RegistryDoctor = require('../models/RegistryDoctor');

// Source CSV paths
const EXTERNAL_SCRAPER_CSV = path.resolve(__dirname, '..', '..', '..', '..', 'medinexus-doctor-scraper', 'data', 'processed', 'medinexus_verified_indian_doctors.csv');
const LOCAL_CSV = path.resolve(__dirname, '..', '..', '..', 'data', 'raw', 'doctor', 'scraped_doctors.csv');

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('[importScrapedDoctors] Connected to MongoDB');

  // Choose file: external scraper CSV if available, else local copy
  let csvPath = EXTERNAL_SCRAPER_CSV;
  if (!fs.existsSync(csvPath)) {
    csvPath = LOCAL_CSV;
  }
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Scraped CSV not found at either ${EXTERNAL_SCRAPER_CSV} or ${LOCAL_CSV}`);
  }

  console.log(`[importScrapedDoctors] Reading CSV from ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf8');

  // Always keep local project copy synchronized
  try {
    fs.mkdirSync(path.dirname(LOCAL_CSV), { recursive: true });
    fs.writeFileSync(LOCAL_CSV, csvContent, 'utf8');
    console.log(`[importScrapedDoctors] Saved copy to ${LOCAL_CSV}`);
  } catch (err) {
    console.warn('[importScrapedDoctors] Could not copy to local project path:', err.message);
  }

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  console.log(`[importScrapedDoctors] Parsed ${records.length} records from CSV`);

  // Group doctors by hospital_name and state
  const hospitalGroups = new Map();
  for (const row of records) {
    const hospName = row.hospital_name || 'Paras HMRI Hospital';
    const state = row.state || 'Bihar';
    const key = `${hospName.toLowerCase()}__${state.toLowerCase()}`;
    if (!hospitalGroups.has(key)) {
      hospitalGroups.set(key, { hospName, state, city: row.city || 'Patna', doctors: [] });
    }
    hospitalGroups.get(key).doctors.push(row);
  }

  let totalDoctorsImported = 0;
  let totalHospitalsUpdated = 0;

  for (const [key, group] of hospitalGroups.entries()) {
    console.log(`\n[importScrapedDoctors] Processing hospital group: ${group.hospName} (${group.state}) with ${group.doctors.length} doctors`);

    // Match hospital in MongoDB
    let hospital = null;
    if (group.hospName.toLowerCase().includes('paras')) {
      hospital = await Hospital.findOne({ sourceRowId: 2122 });
      if (!hospital) {
        hospital = await Hospital.findOne({ name: new RegExp('paras\\s+hmri', 'i'), state: new RegExp('bihar', 'i') });
      }
    }

    if (!hospital) {
      hospital = await Hospital.findOne({
        name: new RegExp(escapeRegex(group.hospName), 'i'),
        state: new RegExp(escapeRegex(group.state), 'i'),
      });
    }

    if (!hospital) {
      console.warn(`[importScrapedDoctors] Warning: Could not find hospital in MongoDB for ${group.hospName} (${group.state})`);
      continue;
    }

    console.log(`[importScrapedDoctors] Matched hospital: "${hospital.name}" (_id: ${hospital._id}, sourceRowId: ${hospital.sourceRowId})`);

    const departmentsSet = new Set(hospital.officialEnrichment?.departments || []);
    const specialtiesSet = new Set(hospital.specialties || []);
    const existingDoctors = hospital.officialEnrichment?.doctors || [];

    const newEnrichmentDoctors = [...existingDoctors];

    for (const doc of group.doctors) {
      const docName = doc.doctor_name;
      if (!docName) continue;

      const rawSpec = doc.specialty || '';
      const stdSpec = doc.specialty_standardized || rawSpec || 'Specialist';
      const cleanSpec = stdSpec || rawSpec;

      if (cleanSpec) {
        departmentsSet.add(cleanSpec);
        specialtiesSet.add(cleanSpec);
      }
      if (rawSpec) {
        departmentsSet.add(rawSpec);
      }

      const experienceText = doc.experience_text || (doc.experience_years ? `${doc.experience_years}+ years of clinical experience` : 'Senior Medical Specialist');
      const qualification = doc.qualifications || (doc.professional_description && doc.professional_description.includes('MBBS') ? 'MBBS, Specialist' : 'Specialist Consultant');

      const isVerified = (doc.verification_status || '').toUpperCase() === 'VERIFIED';
      const verificationStatus = isVerified ? 'Verified' : 'not_independently_verified';

      // Check if already in RegistryDoctor
      const stableDoctorId = doc.doctor_id ? `DOC-${doc.doctor_id.toUpperCase()}` : `DOC-${hospital.sourceRowId}-${docName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase()}`;

      const registryDocData = {
        doctorId: stableDoctorId,
        name: docName,
        specialization: cleanSpec,
        qualification: qualification,
        experience: experienceText,
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        city: doc.city || hospital.town || hospital.district || 'Patna',
        state: doc.state || hospital.state || 'Bihar',
        officialDoctorProfileUrl: doc.official_doctor_profile_url || '',
        officialHospitalUrl: doc.official_hospital_url || hospital.website || 'https://www.parashospitals.com',
        hospitalAssociationSourceUrl: doc.hospital_affiliation_source_url || doc.official_doctor_profile_url || '',
        source: doc.source_type || 'Official Hospital Website Profile',
        sourceName: hospital.name,
        sourceUrl: doc.official_doctor_profile_url || doc.official_hospital_url || '',
        verificationStatus: verificationStatus,
        lastVerifiedAt: doc.last_verified_date ? new Date(doc.last_verified_date) : new Date(),
      };

      await RegistryDoctor.findOneAndUpdate(
        { name: docName, hospitalId: hospital._id },
        { $set: registryDocData },
        { upsert: true, new: true, runValidators: true }
      );

      // Add to hospital.officialEnrichment.doctors if not present
      const docLower = docName.toLowerCase();
      const existingIdx = newEnrichmentDoctors.findIndex((d) => (d.name || '').toLowerCase() === docLower);
      const enrichmentDoctorItem = {
        name: docName,
        title: cleanSpec,
        specialization: cleanSpec,
        qualification: qualification,
        experienceText: experienceText,
        profileUrl: doc.official_doctor_profile_url || '',
        sourceUrl: doc.official_doctor_profile_url || '',
        verificationStatus: verificationStatus,
        source: doc.source_type || 'Official Hospital Website Profile',
      };

      if (existingIdx >= 0) {
        newEnrichmentDoctors[existingIdx] = { ...newEnrichmentDoctors[existingIdx], ...enrichmentDoctorItem };
      } else {
        newEnrichmentDoctors.push(enrichmentDoctorItem);
      }

      totalDoctorsImported++;
    }

    // Update hospital officialEnrichment and specialties
    const website = hospital.website || group.doctors[0]?.official_hospital_url || 'https://www.parashospitals.com';
    const officialEnrichment = {
      sourceUrl: website,
      checkedAt: new Date(),
      summary: `${hospital.name} official specialist faculty directory.`,
      departments: [...departmentsSet],
      services: hospital.officialEnrichment?.services || [],
      technologies: hospital.officialEnrichment?.technologies || [],
      doctors: newEnrichmentDoctors,
    };

    await Hospital.updateOne(
      { _id: hospital._id },
      {
        $set: {
          specialties: [...specialtiesSet],
          website,
          officialEnrichment,
        },
      }
    );

    totalHospitalsUpdated++;
    console.log(`[importScrapedDoctors] Successfully enriched "${hospital.name}" with ${newEnrichmentDoctors.length} doctors and ${specialtiesSet.size} specialties`);
  }

  const finalCount = await RegistryDoctor.countDocuments();
  console.log(`\n[importScrapedDoctors] Finished!`);
  console.log(`  - Total doctor records imported/updated: ${totalDoctorsImported}`);
  console.log(`  - Hospitals enriched: ${totalHospitalsUpdated}`);
  console.log(`  - Total RegistryDoctor collection size: ${finalCount}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[importScrapedDoctors] Error:', err);
  process.exit(1);
});
