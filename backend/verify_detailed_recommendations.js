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
      specialties: r.hospitalId?.specialties?.slice(0, 5),
    });
    console.log('Bed Availability:', r.bedAvailability);
    console.log('Operational Data:', r.operationalData ? {
      waitingTimeMinutes: r.operationalData.waitingTimeMinutes,
      totalBeds: r.operationalData.totalBeds,
      bedsAvailable: r.operationalData.bedsAvailable,
      occupiedBeds: r.operationalData.occupiedBeds,
      sourceDataset: r.operationalData.sourceDataset
    } : null);
    console.log('Doctors count:', r.doctors?.length);
    if (r.doctors?.length) {
      console.log('Sample doctor:', {
        name: r.doctors[0].name,
        specialization: r.doctors[0].specialization,
        qualification: r.doctors[0].qualification,
        experience: r.doctors[0].experience,
        profileUrl: r.doctors[0].officialDoctorProfileUrl,
        verificationStatus: r.doctors[0].verificationStatus,
      });
    }
  }

  await mongoose.disconnect();
}

testAssessment().catch((err) => {
  console.error('Error:', err.response?.data || err.message);
  process.exit(1);
});
