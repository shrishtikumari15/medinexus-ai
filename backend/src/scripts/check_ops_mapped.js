const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');

async function check() {
  await mongoose.connect(env.mongoUri);
  const ops = await Hospital.find({ operationalHospitalId: { $ne: null } })
    .select('sourceRowId name state district operationalHospitalId totalBeds')
    .lean();
  console.log('Hospitals with operationalHospitalId:', ops.length);
  ops.forEach(h => console.log(`${h.operationalHospitalId} | ${h.sourceRowId} | ${h.name} | ${h.state} | ${h.district}`));
  await mongoose.disconnect();
}

check().catch(console.error);
