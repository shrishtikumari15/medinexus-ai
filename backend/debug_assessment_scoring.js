const mongoose = require('mongoose');
const Hospital = require('./src/models/Hospital');
const RegistryDoctor = require('./src/models/RegistryDoctor');
const { scoreHospital } = require('./src/services/recommendationEngine');
const { getSpecialtyTerms } = require('./src/services/specialtySearch');
const { operationalBedAvailability, selectOperationalRecord } = require('./src/services/operationalDataset');
const { getBedAvailability } = require('./src/services/bedAvailability');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');

  const requiredSpecialties = ['Cardiology'];
  const requiredResources = ['ICU', 'Cath Lab', 'Cardiac Monitor'];

  const specialtyTerms = [...new Set(requiredSpecialties.flatMap(getSpecialtyTerms))]
    .map((term) => new RegExp(String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

  const verifiedDoctors = await RegistryDoctor.find({
    verificationStatus: 'Verified',
  }).select('hospitalId specialization').lean();

  const verifiedHospIdsForSpecialty = new Set();
  (verifiedDoctors || []).forEach((doc) => {
    const matchesSpec = !specialtyTerms.length || specialtyTerms.some((regex) => regex.test(doc.specialization || ''));
    if (matchesSpec && doc.hospitalId) {
      verifiedHospIdsForSpecialty.add(String(doc.hospitalId));
    }
  });

  console.log('Verified Hosp IDs for Cardiology count:', verifiedHospIdsForSpecialty.size);

  const apolloHosp = await Hospital.findOne({ name: 'Apollo Hospitals', operationalHospitalId: 'H003' }).lean();
  console.log('Apollo ID:', String(apolloHosp._id));
  console.log('Is Apollo in verifiedHospIdsForSpecialty?', verifiedHospIdsForSpecialty.has(String(apolloHosp._id)));

  // Check doctors linked to Apollo ID
  const apolloDocs = await RegistryDoctor.find({ hospitalId: apolloHosp._id }).lean();
  console.log(`Doctors for Apollo ID ${apolloHosp._id}:`, apolloDocs.map(d => `${d.name} (${d.specialization})`));

  // Now check Kusuma Hospital
  const kusuma = await Hospital.findOne({ name: 'Kusuma Hospital' }).lean();
  console.log('\nKusuma ID:', String(kusuma._id));
  console.log('Is Kusuma in verifiedHospIdsForSpecialty?', verifiedHospIdsForSpecialty.has(String(kusuma._id)));

  await mongoose.disconnect();
})();
