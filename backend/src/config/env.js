// Centralized environment configuration.
// Every other file in the backend must read secrets/config through this
// module instead of calling process.env directly, so there is exactly one
// place that touches raw environment variables.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function required(name, { allowEmptyInDev = false } = {}) {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV !== 'production' && allowEmptyInDev) {
      return '';
    }
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        'Copy backend/.env.example to backend/.env and fill it in.'
    );
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  mongoUri: required('MONGO_URI'),

  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',

  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',

  // In production, restrict CORS to the known frontend origin instead of
  // allowing any origin. Left undefined in dev so localhost works freely.
  frontendUrl: process.env.FRONTEND_URL || null,

  // Read once here; every consumer (e.g. geocodingService.js) imports this
  // object rather than reading process.env.GEOAPIFY_API_KEY itself.
  geoapifyApiKey: required('GEOAPIFY_API_KEY', { allowEmptyInDev: true }),
};

module.exports = env;
