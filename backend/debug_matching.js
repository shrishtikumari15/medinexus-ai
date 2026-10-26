const mongoose = require('mongoose');
const { getSpecialtyTerms } = require('./src/services/specialtySearch');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const rawTerms = getSpecialtyTerms('Cardiology');
  console.log('rawTerms:', rawTerms);
  const specialtyTerms = rawTerms.map((term) => new RegExp(term, 'i'));

  const verifiedDoctors = await mongoose.connection.collection('registrydoctors').find({ verificationStatus: 'Verified' }).toArray();
  console.log('Total verified doctors in DB:', verifiedDoctors.length);
  
  const matchingHospIds = new Set();
  for (const doc of verifiedDoctors) {
    const matches = specialtyTerms.some((r) => r.test(doc.specialization || ''));
    if (matches && doc.hospitalId) {
      matchingHospIds.add(String(doc.hospitalId));
    }
  }
  console.log('Matching hospital IDs for Cardiology count:', matchingHospIds.size);

  const hospitals = await mongoose.connection.collection('hospitals').find({
    $or: [
      { _id: { $in: Array.from(matchingHospIds).map((id) => new mongoose.Types.ObjectId(id)) } },
      { operationalHospitalId: { $in: ['H001', 'H002', 'H003', 'H004', 'H005'] } },
    ],
  }).toArray();
  console.log('Found priority hospitals:', hospitals.length);
  hospitals.forEach((h) => {
    console.log('  -', h.name, '| State:', h.state, '| OpID:', h.operationalHospitalId, '| Beds:', h.totalBeds);
  });

  await mongoose.disconnect();
}
run();
