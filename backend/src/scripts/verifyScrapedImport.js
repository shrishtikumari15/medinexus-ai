require('dotenv').config();
const connectDb = require('../config/db');
const RegistryDoctor = require('../models/RegistryDoctor');
const Hospital = require('../models/Hospital');

async function verify() {
  await connectDb();

  console.log('--- Checking Paras HMRI Hospital in MongoDB ---');
  const hospital = await Hospital.findOne({ sourceRowId: 2122 }).lean();
  console.log('Hospital Name:', hospital.name);
  console.log('Location:', hospital.location, hospital.district, hospital.state);
  console.log('Official website:', hospital.website);
  console.log('Specialties count:', hospital.specialties.length);
  console.log('Enriched doctors count:', hospital.officialEnrichment?.doctors?.length);

  console.log('\n--- Checking Scraped Doctors in RegistryDoctor Collection ---');
  const totalParasDoctors = await RegistryDoctor.countDocuments({ hospitalId: hospital._id });
  console.log(`Total doctors linked to ${hospital.name}: ${totalParasDoctors}`);

  const specialties = ['Cardiology', 'ENT', 'Dermatology', 'Gastroenterology', 'General Surgery', 'Obstetrics & Gynaecology', 'General Medicine', 'Neurology', 'Oncology', 'Orthopaedics'];
  
  for (const spec of specialties) {
    const docs = await RegistryDoctor.find({
      hospitalId: hospital._id,
      specialization: new RegExp(spec.split(' ')[0], 'i'),
    }).select('name specialization experience officialDoctorProfileUrl').lean();

    if (docs.length > 0) {
      console.log(`\nSpecialty: ${spec} (${docs.length} doctors)`);
      docs.slice(0, 3).forEach(d => {
        console.log(`  - ${d.name} | ${d.specialization} | ${d.experience} | ${d.officialDoctorProfileUrl}`);
      });
    }
  }

  process.exit(0);
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
