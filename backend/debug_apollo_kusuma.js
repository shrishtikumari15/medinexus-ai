const mongoose = require('mongoose');
const Hospital = require('./src/models/Hospital');
const { scoreHospital } = require('./src/services/recommendationEngine');
const { selectOperationalRecord } = require('./src/services/operationalDataset');
const { distanceKm } = require('./src/services/geocodingService');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');

  const apollo = await Hospital.findOne({ _id: new mongoose.Types.ObjectId('6aa2cbc6b9cb42153692c964') }).lean();
  const kusuma = await Hospital.findOne({ _id: new mongoose.Types.ObjectId('6aa2cbc6b9cb42153692ca4e') }).lean();

  const patientCoords = { lat: 12.9716, lon: 77.5946 }; // Bangalore
  const requiredSpecialties = ['Cardiology'];
  const requiredResources = ['ICU', 'Cath Lab', 'Cardiac Monitor'];

  for (const h of [apollo, kusuma]) {
    const dist = patientCoords && h.geo?.coordinates
      ? distanceKm(patientCoords, { lat: h.geo.coordinates[1], lon: h.geo.coordinates[0] })
      : 5;

    const operationalData = h.operationalHospitalId ? selectOperationalRecord(h.operationalHospitalId) : null;
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
      distanceKm: dist,
      recentRecommendationCount: 0,
      availabilityPercent: operationalData?.bedAvailabilityPercentage ?? null,
    });

    console.log(`\n=== ${h.name} ===`);
    console.log('Distance:', dist);
    console.log('OperationalData:', !!operationalData, 'WaitMinutes:', expectedWaitMinutes);
    console.log('Specialties:', h.specialties);
    console.log('Official departments:', h.officialEnrichment?.departments);
    console.log('Raw Score:', res.score);
    console.log('Breakdown:', res.breakdown);
    console.log('Weights used:', res.weightsUsed);
  }

  await mongoose.disconnect();
})();
