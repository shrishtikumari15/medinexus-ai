const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@medinexus.local';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe123!';
const DEFAULT_USER_EMAIL = process.env.USER_SEED_EMAIL || 'user@medinexus.local';
const DEFAULT_USER_PASSWORD = process.env.USER_SEED_PASSWORD || 'User123!';
const DEFAULT_DOCTOR_EMAIL = process.env.DOCTOR_SEED_EMAIL || 'doctor@medinexus.local';
const DEFAULT_DOCTOR_PASSWORD = process.env.DOCTOR_SEED_PASSWORD || 'Doctor123!';

async function upsertAccount(Model, email, password, extra = {}) {
  const normalizedEmail = email.toLowerCase();
  let account = await Model.findOne({ email: normalizedEmail });

  if (account) {
    if (Model.modelName === 'Doctor' && !account.userId) {
      account.userId = account._id;
      await account.save();
      console.log(`[seed] Fixed missing userId for doctor: ${normalizedEmail}`);
    }
    console.log(`[seed] Existing ${Model.modelName} account found: ${normalizedEmail}`);
    return account;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const payload = {
    email: normalizedEmail,
    passwordHash,
    name: extra.name || 'Demo User',
    ...extra,
  };

  if (Model.modelName === 'Doctor') {
    payload.userId = payload.userId || new mongoose.Types.ObjectId();
  }

  account = await Model.create(payload);

  if (Model.modelName === 'Doctor' && !account.userId) {
    account.userId = account._id;
    await account.save();
  }

  console.log(`[seed] Created ${Model.modelName} account: ${normalizedEmail}`);
  return account;
}

async function seedDemoUsers({ disconnectAfter = false } = {}) {
  await connectDB();

  try {
    await upsertAccount(User, DEFAULT_USER_EMAIL, DEFAULT_USER_PASSWORD, {
      name: 'Demo Patient',
      phone: '+91 90000 00001',
      role: 'user',
    });

    await upsertAccount(Doctor, DEFAULT_DOCTOR_EMAIL, DEFAULT_DOCTOR_PASSWORD, {
      name: 'Demo Doctor',
      specialization: 'General Medicine',
      qualification: 'MBBS, MD',
      experienceYears: 8,
      hospitalAffiliation: 'MediNexus Demo Hospital',
      verificationStatus: 'approved',
      role: 'doctor',
    });

    await upsertAccount(Admin, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, {
      name: 'Demo Admin',
      role: 'admin',
    });

    console.log('[seed] Done.');
  } finally {
    if (disconnectAfter) {
      await mongoose.disconnect();
    }
  }
}

if (require.main === module) {
  seedDemoUsers({ disconnectAfter: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[seed] Failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDemoUsers, upsertAccount };
