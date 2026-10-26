const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');

async function checkStates() {
  await mongoose.connect(env.mongoUri);
  const states = await Hospital.distinct('state');
  console.log('States in Hospital collection:', states.sort());

  // Check Fortis in Maharashtra
  const mahFortis = await Hospital.find({ state: /maharashtra/i, name: /fortis/i }).select('sourceRowId name state district town location address').lean();
  console.log('Fortis in Maharashtra:', mahFortis);

  // Check Fortis in Kalyan
  const kalyan = await Hospital.find({ $or: [{ name: /kalyan/i }, { district: /kalyan|thane/i }, { location: /kalyan/i }] }).select('sourceRowId name state district location').limit(5).lean();
  console.log('Kalyan / Thane sample:', kalyan);

  // Check Apollo in Delhi
  const delApollo = await Hospital.find({ name: /apollo/i, $or: [{ state: /delhi/i }, { district: /delhi/i }, { location: /delhi/i }] }).select('sourceRowId name state district location').lean();
  console.log('Apollo in Delhi:', delApollo);

  // Check Apollo in Lucknow
  const lkoApollo = await Hospital.find({ name: /apollo/i, state: /uttar/i }).select('sourceRowId name state district location').lean();
  console.log('Apollo in UP:', lkoApollo);

  // Check Apollo in Chennai / Tamil Nadu
  const tnApollo = await Hospital.find({ name: /apollo/i, state: /tamil/i }).select('sourceRowId name state district location').lean();
  console.log('Apollo in Tamil Nadu:', tnApollo);

  // Check Apollo in Assam
  const assamApollo = await Hospital.find({ name: /apollo/i, state: /assam/i }).select('sourceRowId name state district location').lean();
  console.log('Apollo in Assam:', assamApollo);

  await mongoose.disconnect();
}

checkStates().catch(console.error);
