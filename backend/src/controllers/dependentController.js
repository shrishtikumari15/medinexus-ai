const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const Dependent = require('../models/Dependent');
const Recommendation = require('../models/Recommendation');

function serializeDependent(dependent) {
  const value = dependent.toObject ? dependent.toObject() : dependent;
  return { ...value, dependentId: String(value._id) };
}

async function listDependents(req, res, next) {
  try {
    const dependents = await Dependent.find({ userId: req.user.id, deletedAt: null }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: dependents.map(serializeDependent) });
  } catch (err) {
    return next(err);
  }
}

async function createDependent(req, res, next) {
  try {
    const dependent = await Dependent.create({
      userId: req.user.id,
      name: req.body.name,
      relationship: req.body.relationship,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender || undefined,
    });
    return res.status(201).json({ success: true, data: serializeDependent(dependent) });
  } catch (err) {
    return next(err);
  }
}

async function updateDependent(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid dependent ID.' });
    }
    const update = {
      $set: {
        name: req.body.name,
        relationship: req.body.relationship,
        dateOfBirth: req.body.dateOfBirth,
      },
    };
    if (req.body.gender) update.$set.gender = req.body.gender;
    else update.$unset = { gender: 1 };
    const dependent = await Dependent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, deletedAt: null },
      update,
      { new: true, runValidators: true }
    );
    if (!dependent) return res.status(404).json({ success: false, error: 'Dependent not found.' });
    return res.json({ success: true, data: serializeDependent(dependent) });
  } catch (err) {
    return next(err);
  }
}

async function deleteDependent(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid dependent ID.' });
    }
    const dependent = await Dependent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!dependent) return res.status(404).json({ success: false, error: 'Dependent not found.' });
    return res.json({ success: true, data: { id: dependent._id, deleted: true } });
  } catch (err) {
    return next(err);
  }
}

async function getDependentAssessments(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid dependent ID.' });
    }
    const dependent = await Dependent.findOne({ _id: req.params.id, userId: req.user.id }).select('+deletedAt').lean();
    if (!dependent) return res.status(404).json({ success: false, error: 'Dependent not found.' });

    const assessmentIds = await Assessment.find({ userId: req.user.id, dependentId: dependent._id }).distinct('_id');
    const recommendations = await Recommendation.find({ userId: req.user.id, assessmentId: { $in: assessmentIds } })
      .sort({ createdAt: -1 })
      .populate('hospitalRankings.hospitalId', 'name state district')
      .populate('assessmentId', 'clinicalInputs dependentSnapshot createdAt')
      .lean();
    return res.json({ success: true, data: recommendations });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listDependents, createDependent, updateDependent, deleteDependent, getDependentAssessments };