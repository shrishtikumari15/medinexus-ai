const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');

async function check() {
  await mongoose.connect(env.mongoUri);
  const rows = [9533, 2117, 6690, 2123];
  for (const r of rows) {
    const h = await Hospital.findOne({ sourceRowId: r });
    if (h) {
      console.log(`Row ${r}: ${h.name} (${h.state}, ${h.district}) - Doctors: ${h.officialEnrichment?.doctors?.length || 0}`);
    } else {
      console.log(`Row ${r} not found!`);
    }
  }
  await mongoose.disconnect();
}

check().catch(console.error);
