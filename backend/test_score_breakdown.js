const mongoose = require('mongoose');
const Hospital = require('./src/models/Hospital');
const RegistryDoctor = require('./src/models/RegistryDoctor');
const { scoreHospital } = require('./src/services/recommendationEngine');
const { operationalBedAvailability, selectOperationalRecord } = require('./src/services/operationalDataset');
const { getBedAvailability } = require('./src/services/bedAvailability');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  
  const kusuma = await Hospital.findOne({ name: 'Kusuma Hospital' }).lean();
  const apollo = await Hospital.findOne({ name: 'Apollo Hospitals', operationalHospitalId: 'H003' }).lean();
  const fortis = await Hospital.findOne({ name: 'Fortis Hospital', operationalHospitalId: 'H004' }).lean();
  
  const requiredSpecialties = ['Cardiology'];
  const requiredResources = ['ICU', 'Cath Lab', 'Cardiac Monitor'];
  
  [kusuma, apollo, fortis].forEach((h) => {
    if (!h) return;
    const operationalData = h.operationalHospitalId ? selectOperationalRecord(h.operationalHospitalId) : null;
    const bedAvailability = operationalBedAvailability(operationalData) || getBedAvailability(h);
    const expectedWaitMinutes = operationalData?.waitingTimeMinutes ?? null;
    
    const res = scoreHospital({
      hospital: {
        ...h,
        totalBeds: operationalData?.totalBeds ?? h.totalBeds,
        availableBeds: operationalData?.bedsAvailable ?? h.availableBeds,
        occupiedBeds: operationalData?.occupiedBeds ?? h.occupiedBeds,
        bedDataSource: operationalData ? 'operational_dataset' : h.bedDataSource,
        specialties: [...(h.specialties || []), ...(h.officialEnrichment?.departments || [])],
      },
      requiredSpecialties,
      requiredResources,
      expectedWaitMinutes,
      distanceKm: 5, // both in Bangalore
      recentRecommendationCount: 0,
      availabilityPercent: operationalData?.bedAvailabilityPercentage ?? null,
    });
    
    console.log(`\n=== ${h.name} (${h.town || h.district}) ===`);
    console.log('Raw Score:', res.score);
    console.log('Components:', res.components);
    console.log('Effective Weights:', res.effectiveWeights);
    console.log('Beds:', h.totalBeds, 'EmergencyFlag:', h.emergencyFlag, 'Facilities:', h.facilities);
  });
  
  await mongoose.disconnect();
})();
