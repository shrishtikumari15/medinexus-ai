const mongoose = require('mongoose');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));
  const agg = await Hospital.aggregate([
    { $match: { state: { $regex: /delhi/i } } },
    { $group: { _id: '$state', count: { $sum: 1 } } }
  ]);
  console.log('Delhi states:', agg);
  const dist = await Hospital.aggregate([
    { $match: { district: { $regex: /delhi/i } } },
    { $group: { _id: { state: '$state', district: '$district' }, count: { $sum: 1 } } }
  ]);
  console.log('Delhi districts:', dist);
  await mongoose.disconnect();
})();
