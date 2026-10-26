const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');

async function findThane() {
  await mongoose.connect(env.mongoUri);
  const thane = await Hospital.find({ state: /maharashtra/i, district: /thane/i }).select('sourceRowId name district location address').lean();
  console.log('Thane hospitals count:', thane.length);
  const fortisThane = thane.filter(h => /fortis/i.test(h.name));
  console.log('Fortis in Thane:', fortisThane);
  const kalyanThane = thane.filter(h => /kalyan/i.test(h.name) || /kalyan/i.test(h.location) || /kalyan/i.test(h.address));
  console.log('Kalyan in Thane:', kalyanThane.slice(0, 5));

  await mongoose.disconnect();
}

findThane().catch(console.error);
