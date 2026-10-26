const mongoose = require('mongoose');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));
  const RegistryDoctor = mongoose.model('RegistryDoctor', new mongoose.Schema({}, { strict: false }));

  // Find all Fortis Bannerghatta records
  const fortisBannerghatta = await Hospital.find({
    name: { $regex: /fortis/i },
    state: { $regex: /karnataka/i },
    address: { $regex: /bannerghatta/i }
  }).lean();

  console.log('Fortis Bannerghatta records:', fortisBannerghatta.map(h => ({ id: h._id, name: h.name, opId: h.operationalHospitalId })));

  // Canonical Fortis Bannerghatta is H004
  const canonicalFortis = fortisBannerghatta.find(h => h.operationalHospitalId === 'H004') || fortisBannerghatta[0];
  console.log('Canonical Fortis:', canonicalFortis._id, canonicalFortis.name);

  // Find doctors linked to ANY Fortis in Bangalore
  const fortisDocs = await RegistryDoctor.find({
    name: { $in: [
      'Dr. Rajpal Singh R L', 'Dr. Shashidhara .', 'Dr. Chetan Kumar H B',
      'Dr. Shivanand S Patil', 'Dr. Arjun Sreekumar', 'Dr. Ashwin Kodliwadmath'
    ]}
  });
  console.log('Found BG Road doctors:', fortisDocs.length);

  // Link these 6 doctors to all fortisBannerghatta IDs if needed, or link all fortis records to point to canonical
  // Actually, let's clone or update hospitalId to the canonical Fortis:
  for (const d of fortisDocs) {
    // If d.hospitalId is not canonicalFortis._id, set it to canonicalFortis._id
    d.hospitalId = canonicalFortis._id;
    d.hospitalName = canonicalFortis.name;
    await d.save();
  }
  console.log('Linked 6 BG Road doctors to canonical Fortis:', canonicalFortis._id);

  // Now, ensure in assessmentController getHospKey normalizes "Wockhardt Hospital (New Name-Fortis Hospitals Ltd-Banneraghatta Road)"
  // and "Fortis Hospitals, Bannerghatta Road" to the SAME key as "Fortis Hospital"
  await mongoose.disconnect();
})();
