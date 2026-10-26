const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');
const RegistryDoctor = require('../models/RegistryDoctor');

async function verify() {
  await mongoose.connect(env.mongoUri);
  console.log('[Verification] Connected to MongoDB');

  const apolloHospitals = await Hospital.find({ name: { $regex: 'apollo', $options: 'i' } })
    .select('_id sourceRowId name state town totalBeds emergencyFlag officialEnrichment')
    .lean();

  console.log(`\nFound ${apolloHospitals.length} Apollo Hospitals in DB:`);
  let totalDoctorsInHospitals = 0;

  for (const h of apolloHospitals) {
    const docCount = h.officialEnrichment?.doctors?.length || 0;
    if (docCount > 0) {
      totalDoctorsInHospitals += docCount;
      console.log(`- ${h.name} (${h.town || 'N/A'}, ${h.state}) | Beds: ${h.totalBeds} | Emergency: ${h.emergencyFlag} | Enriched Doctors: ${docCount}`);
    }
  }

  const apolloDocs = await RegistryDoctor.find({
    $or: [
      { hospitalName: { $regex: 'apollo', $options: 'i' } },
      { source: { $regex: 'apollo', $options: 'i' } }
    ]
  }).lean();

  console.log(`\nTotal Apollo Registry Doctors in DB: ${apolloDocs.length}`);
  console.log('\nSample Registry Doctors:');
  for (const d of apolloDocs.slice(0, 8)) {
    console.log(`- ${d.name} | ${d.specialization} | ${d.experience} | ${d.hospitalName} (${d.city}, ${d.state})`);
  }

  // Check unique specializations among Apollo doctors
  const specialties = new Set(apolloDocs.map(d => d.specialization));
  console.log(`\nUnique Specialties covered by Apollo doctors (${specialties.size}):`);
  console.log(Array.from(specialties).sort().join(', '));

  await mongoose.disconnect();
}

verify().catch(console.error);
