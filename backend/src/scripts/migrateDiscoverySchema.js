const mongoose = require('mongoose');
const env = require('../config/env');

mongoose.set('autoIndex', false);
const Hospital = require('../models/Hospital');
const RegistryDoctor = require('../models/RegistryDoctor');

async function migrate() {
  await mongoose.connect(env.mongoUri);
  const hospitalCollection = Hospital.collection;
  const indexes = await hospitalCollection.indexes();
  const previousSourceIndex = indexes.find((index) =>
    index.key?.sourceRowId === 1 && index.unique && !index.sparse
  );

  if (previousSourceIndex) {
    await hospitalCollection.dropIndex(previousSourceIndex.name);
  }
  await hospitalCollection.createIndex({ sourceRowId: 1 }, { unique: true, sparse: true });
  await RegistryDoctor.createIndexes();

  console.log('[migration] hospital sourceRowId is unique when present; registry-doctor indexes are ready.');
}

migrate()
  .catch((error) => {
    console.error('[migration] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });