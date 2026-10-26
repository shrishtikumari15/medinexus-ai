const mongoose = require('mongoose');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));
  
  const apollos = await Hospital.find({ name: { $regex: /apollo.*bangalore|apollo.*hospitals/i }, state: { $regex: /karnataka/i } }).lean();
  console.log(`Found ${apollos.length} Apollo hospitals in Karnataka:`);
  apollos.forEach((h, i) => {
    console.log(`${i + 1}: ID: ${h._id}, Name: "${h.name}", OpId: ${h.operationalHospitalId}, SourceRowId: ${h.sourceRowId}, Beds: ${h.totalBeds}, Address: ${h.address}`);
  });

  const fortis = await Hospital.find({ name: { $regex: /fortis/i }, state: { $regex: /karnataka/i } }).lean();
  console.log(`\nFound ${fortis.length} Fortis hospitals in Karnataka:`);
  fortis.forEach((h, i) => {
    console.log(`${i + 1}: ID: ${h._id}, Name: "${h.name}", OpId: ${h.operationalHospitalId}, SourceRowId: ${h.sourceRowId}, Beds: ${h.totalBeds}, Address: ${h.address}`);
  });

  await mongoose.disconnect();
})();
