const { getOperationalReference } = require('../services/operationalDataset');

function getOperationalReferenceEndpoint(req, res, next) {
  try {
    const data = getOperationalReference();
    return res.json({
      success: true,
      data,
      meta: {
        datasetType: 'synthetic_reference',
        hospitalIdentityMappingAvailable: false,
        disclaimer: data.disclaimer,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getOperationalReferenceEndpoint };
