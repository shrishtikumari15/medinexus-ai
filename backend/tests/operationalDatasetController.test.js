jest.mock('../src/services/operationalDataset', () => ({
  getOperationalReference: jest.fn(),
}));

const { getOperationalReference } = require('../src/services/operationalDataset');
const { getOperationalReferenceEndpoint } = require('../src/controllers/operationalDatasetController');

describe('operational dataset reference endpoint', () => {
  test('returns synthetic dataset bed-count estimates with an explicit disclaimer', () => {
    const data = {
      totalBedsEstimate: 60,
      availableBedsEstimate: 15,
      sourceDataset: 'operational_dataset.csv',
      disclaimer: 'Synthetic median; not specific to this hospital.',
    };
    getOperationalReference.mockReturnValue(data);
    const res = { json: jest.fn() };

    getOperationalReferenceEndpoint({}, res, jest.fn());

    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: true,
      data,
      meta: {
        datasetType: 'synthetic_reference',
        hospitalIdentityMappingAvailable: false,
      },
    });
  });

  test('forwards dataset-loading failures to Express error handling', () => {
    const error = new Error('CSV unavailable');
    getOperationalReference.mockImplementation(() => { throw error; });
    const next = jest.fn();

    getOperationalReferenceEndpoint({}, { json: jest.fn() }, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
