const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function testDelhiAssessment() {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const user = await mongoose.connection.collection('users').findOne({ role: 'user' });
  const token = jwt.sign(
    { id: String(user._id), role: user.role || 'user' },
    'medinexus_dev_secret_change_this',
    { expiresIn: '1d' }
  );

  const res = await axios.post(
    'http://localhost:5000/api/v1/assessments',
    {
      chiefComplaint: 'Severe left-sided chest pain radiating to left arm, shortness of breath',
      locationText: 'New Delhi, Delhi',
      temperature: 98.6,
      heartrate: 98,
      resprate: 18,
      o2sat: 96,
      sbp: 130,
      dbp: 85,
      pain: 8,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const rankings = res.data.data.recommendation.hospitalRankings || [];
  console.log(`Total Ranked Hospitals in Delhi: ${rankings.length}\n`);

  for (let i = 0; i < Math.min(3, rankings.length); i++) {
    const r = rankings[i];
    console.log(`=== RANK #${i + 1}: ${r.hospitalId?.name} ===`);
    console.log('Hospital Fields:', {
      _id: r.hospitalId?._id,
      name: r.hospitalId?.name,
      address: r.hospitalId?.address,
      town: r.hospitalId?.town,
      district: r.hospitalId?.district,
      totalBeds: r.hospitalId?.totalBeds,
      operationalHospitalId: r.hospitalId?.operationalHospitalId,
    });
    console.log('Score:', r.score);
    console.log('Distance:', r.distanceKm, 'km');
    console.log('Doctors count:', r.doctors?.length);
    if (r.doctors?.length) {
      console.log('Sample doctor:', {
        name: r.doctors[0].name,
        specialization: r.doctors[0].specialization,
        qualification: r.doctors[0].qualification,
        experience: r.doctors[0].experience,
      });
    }
  }

  await mongoose.disconnect();
}

testDelhiAssessment().catch((err) => {
  console.error('Error:', err.response?.data || err.message);
  process.exit(1);
});
