const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const { signToken } = require('../utils/token');

const SALT_ROUNDS = 12;

const MODELS_BY_ROLE = { user: User, doctor: Doctor, admin: Admin };

async function registerUser(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash, phone });
    const token = signToken({ id: user._id, role: 'user' });
    return res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: 'user', token },
    });
  } catch (err) {
    return next(err);
  }
}

async function registerDoctor(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      specialization,
      subSpecialty,
      qualification,
      experienceYears,
      registrationNumber,
      registrationCouncil,
      hospitalAffiliation,
      department,
      designation,
      phone,
    } = req.body;
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const doctor = await Doctor.create({
      userId: undefined,
      name,
      email,
      passwordHash,
      specialization,
      subSpecialty,
      qualification,
      experienceYears: Number(experienceYears) || 0,
      registrationNumber,
      registrationCouncil,
      hospitalAffiliation,
      department,
      designation,
      phone,
      verificationStatus: 'approved', // Instant onboarding verification for clinical demo & practice
    });
    doctor.userId = doctor._id;
    await doctor.save();

    const token = signToken({ id: doctor._id, role: 'doctor' });
    return res.status(201).json({
      success: true,
      data: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor',
        specialization: doctor.specialization,
        subSpecialty: doctor.subSpecialty,
        qualification: doctor.qualification,
        experienceYears: doctor.experienceYears,
        hospitalAffiliation: doctor.hospitalAffiliation,
        department: doctor.department,
        designation: doctor.designation,
        registrationNumber: doctor.registrationNumber,
        verificationStatus: doctor.verificationStatus,
        token,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    // role must be provided by the frontend's login form (user/doctor/admin
    // tab) so we know which collection to check - emails are only unique
    // within a role's own collection, not globally across all three.
    const Model = MODELS_BY_ROLE[role];
    if (!Model) {
      return res.status(400).json({ success: false, error: 'Invalid role. Must be user, doctor, or admin.' });
    }

    const account = await Model.findOne({ email }).select('+passwordHash');
    if (!account) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = signToken({ id: account._id, role });
    const payloadData = {
      id: account._id,
      name: account.name,
      email: account.email,
      role,
      token,
    };

    if (role === 'doctor') {
      payloadData.specialization = account.specialization;
      payloadData.subSpecialty = account.subSpecialty;
      payloadData.qualification = account.qualification;
      payloadData.experienceYears = account.experienceYears;
      payloadData.hospitalAffiliation = account.hospitalAffiliation;
      payloadData.department = account.department;
      payloadData.designation = account.designation;
      payloadData.verificationStatus = account.verificationStatus;
      payloadData.registrationNumber = account.registrationNumber;
      payloadData.phone = account.phone;
    }

    return res.json({
      success: true,
      data: payloadData,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { registerUser, registerDoctor, login };
