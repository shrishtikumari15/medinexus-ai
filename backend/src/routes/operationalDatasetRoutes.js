const express = require('express');
const { getOperationalReferenceEndpoint } = require('../controllers/operationalDatasetController');

const router = express.Router();

router.get('/reference', getOperationalReferenceEndpoint);

module.exports = router;
