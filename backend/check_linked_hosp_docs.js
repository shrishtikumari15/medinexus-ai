const mongoose = require('mongoose');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const RegistryDoctor = mongoose.model('RegistryDoctor', new mongoose.Schema({}, { strict: false }));
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));

  const docs = await RegistryDoctor.find({ verificationStatus: 'Verified' }).lean();
  console.log(`Total verified doctors: ${docs.length}`);

  const hospIds = [...new Set(docs.map(d => String(d.hospitalId)).filter(Boolean))];
  console.log(`Unique hospital IDs linked: ${hospIds.length}`);

  for (const hid of hospIds) {
    const h = await Hospital.findById(hid).lean();
    const count = docs.filter(d => String(d.hospitalId) === hid).length;
    console.log(`- ${h?.name} (${h?.town || h?.district}, ${h?.state}) [ID: ${hid}]: ${count} doctors`);
  }

  await mongoose.disconnect();
})();
