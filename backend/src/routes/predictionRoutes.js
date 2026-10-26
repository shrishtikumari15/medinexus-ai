const express = require('express');
const { predictWaitingTime } = require('../controllers/predictionController');

const router = express.Router();

router.post('/waiting-time', predictWaitingTime);

module.exports = router;
