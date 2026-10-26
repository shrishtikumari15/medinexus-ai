const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const env = require('./config/env');

const app = express();

// --- Core middleware ---
app.use(helmet());
// Production uses the configured frontend origin. Development allows local
// Vite ports because the dev server may move from 5173 when that port is busy.
app.use(cors(env.nodeEnv === 'production' && env.frontendUrl ? { origin: env.frontendUrl } : {}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting on auth endpoints only - the standard brute-force target.
// Not applied globally so it doesn't throttle legitimate heavy dashboard use.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login/register attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Please try again later.' },
});

// --- Health check (used to verify the server + Mongo are up) ---
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, service: 'medinexus-backend', status: 'ok' });
});

// --- Feature routes are mounted here, phase by phase ---
app.use('/api/v1/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/v1/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/v1/operations', require('./routes/operationalDatasetRoutes'));
app.use('/api/v1/predict', require('./routes/predictionRoutes'));
app.use('/api/v1/assessments', require('./routes/assessmentRoutes'));
app.use('/api/v1/dependents', require('./routes/dependentRoutes'));
app.use('/api/v1/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/v1/admin/simulate', require('./routes/simulationRoutes'));
app.use('/api/v1/doctors', require('./routes/doctorRoutes'));
app.use('/api/v1/admin/doctors', require('./routes/adminDoctorRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
// Static serving of uploaded doctor documents (read-only, filenames are
// server-generated so this cannot be used to traverse the filesystem).
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// --- 404 + centralized error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
