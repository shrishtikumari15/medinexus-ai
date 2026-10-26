const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const hs = await mongoose.connection.collection('hospitals').find({
    _id: { $in: [
      new mongoose.Types.ObjectId('6aa2cbc6b9cb42153692c964'),
      new mongoose.Types.ObjectId('6aa2cbc6b9cb42153692c967'),
      new mongoose.Types.ObjectId('6aa2cbc6b9cb42153692ca3c'),
      new mongoose.Types.ObjectId('6aa2cbc6b9cb42153692c72d'),
      new mongoose.Types.ObjectId('6aa2cbc6b9cb42153692c7b5')
    ]}
  }).toArray();
  for (const h of hs) {
    console.log(h.name, '| emergencyFlag:', h.emergencyFlag, '| facilities:', h.facilities);
  }
  await mongoose.disconnect();
}
run();
