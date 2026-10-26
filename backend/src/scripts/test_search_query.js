const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');
const { buildSearchFilter } = require('../controllers/hospitalController');

async function testQuery() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected');

  const filter = buildSearchFilter({ state: 'Karnataka', city: 'Bengaluru', specialty: 'Cardiology' });
  console.log('Filter:', JSON.stringify(filter, null, 2));

  const count = await Hospital.countDocuments(filter);
  console.log('Matching hospitals count:', count);

  const hospitals = await Hospital.find(filter).select('name state district town location specialties officialEnrichment').limit(10).lean();
  for (const h of hospitals) {
    console.log(`- ${h.name} | State: ${h.state} | Dist: ${h.district} | Town: ${h.town} | Specs: ${h.specialties?.length} | OfficialDocs: ${h.officialEnrichment?.doctors?.length || 0}`);
  }

  await mongoose.disconnect();
}

testQuery().catch(console.error);
