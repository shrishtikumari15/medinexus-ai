const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');

async function testSuggestions() {
  await mongoose.connect(env.mongoUri);

  const query = 'apollo';
  // Find hospitals matching query, prioritizing verified/enriched hospitals with doctors
  const hospitals = await Hospital.find({
    name: new RegExp(query, 'i')
  })
    .select('name state town totalBeds officialEnrichment')
    .sort({
      'officialEnrichment.doctors.0': -1,
      totalBeds: -1,
      name: 1
    })
    .limit(30)
    .lean();

  const seen = new Set();
  const suggestions = [];
  for (const h of hospitals) {
    const name = h.name.trim();
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      const docs = h.officialEnrichment?.doctors?.length || 0;
      suggestions.push({ name, state: h.state, town: h.town, beds: h.totalBeds, docs });
    }
  }

  console.log(`Top ${suggestions.length} suggestions for "${query}":`);
  for (const s of suggestions.slice(0, 15)) {
    console.log(` - ${s.name} (${s.town || s.state}) | Beds: ${s.beds} | Doctors: ${s.docs}`);
  }

  await mongoose.disconnect();
}

testSuggestions().catch(console.error);
