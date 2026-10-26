const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const RegistryDoctor = require('../models/RegistryDoctor');
const { upsertDoctor, importDoctors } = require('../controllers/registryDoctorController');

const router = express.Router();

router.use(protect, requireRole(['admin']));
router.get('/', async (req, res, next) => {
  try {
    const data = await RegistryDoctor.find().populate('hospitalId', 'name state district town').sort({ name: 1 }).lean();
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});
router.post('/import', importDoctors);
router.post('/', upsertDoctor);
router.patch('/:id', upsertDoctor);

module.exports = router;
