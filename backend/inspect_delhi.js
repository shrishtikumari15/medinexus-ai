const mongoose = require('mongoose');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));
  const count = await Hospital.countDocuments({ state: { $regex: /delhi/i } });
  const delhiHosps = await Hospital.find({ state: { $regex: /delhi/i } }).select('name state district totalBeds').limit(15).lean();
  console.log('Delhi Hospitals in DB count:', count);
  console.log('Sample Delhi Hospitals:', delhiHosps.map(h => ({ name: h.name, district: h.district, beds: h.totalBeds })));
  await mongoose.disconnect();
})();
