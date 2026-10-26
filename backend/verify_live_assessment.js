const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function testAssessment() {
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
      locationText: 'Bengaluru, Karnataka',
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
  console.log(`Total Ranked Hospitals: ${rankings.length}\n`);

  rankings.forEach((r, i) => {
    const h = r.hospitalId;
    console.log(`#${i + 1}: ${h?.name} (ID: ${h?._id})`);
    console.log(`   Score: ${r.score}/100, Wait: ${r.expectedWaitMinutes}m, Beds: ${r.bedAvailability?.totalBeds}, Available: ${r.bedAvailability?.reportedAvailableBeds}, Docs: ${r.doctors?.length}`);
    console.log(`   Distance: ${r.distanceKm}km, Town: ${h?.town || h?.district}`);
    if (r.doctors?.length) {
      console.log(`   Doctors: ${r.doctors.map(d => `${d.name} (${d.specialization})`).join(', ')}`);
    }
  });

  await mongoose.disconnect();
}

testAssessment().catch((err) => {
  console.error('Error:', err.response?.data || err.message);
  process.exit(1);
});
