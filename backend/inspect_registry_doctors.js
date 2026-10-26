const mongoose = require('mongoose');
const { execSync } = require('child_process');
const fs = require('fs');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const RegistryDoctor = mongoose.model('RegistryDoctor', new mongoose.Schema({}, { strict: false }));
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));
  
  const existingDocs = await RegistryDoctor.find().lean();
  console.log(`Existing RegistryDoctors in DB: ${existingDocs.length}`);
  
  const existingNames = new Set(existingDocs.map(d => d.name.toLowerCase().trim()));
  
  // Let's check hospitals that have doctors
  const hospDocs = await RegistryDoctor.aggregate([
    { $group: { _id: '$hospitalName', count: { $sum: 1 }, city: { $first: '$city' } } },
    { $sort: { count: -1 } }
  ]);
  console.log('Doctors by Hospital in DB:');
  console.table(hospDocs);
  
  await mongoose.disconnect();
})();
