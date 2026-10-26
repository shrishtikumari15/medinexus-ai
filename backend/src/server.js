// MediNexus AI Server - Active
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const { seedDemoUsers } = require('./scripts/seedDemoUsers');

async function start() {
  await connectDB();
  await seedDemoUsers();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] MediNexus backend running on port ${env.port} (${env.nodeEnv})`);
  });
}

start();
