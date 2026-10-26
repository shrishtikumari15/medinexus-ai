jest.mock('../src/services/mlServiceClient', () => ({
  predictWaitingTime: jest.fn(),
}));

const mlServiceClient = require('../src/services/mlServiceClient');
const { predictWaitingTime } = require('../src/controllers/predictionController');

describe('waiting-time prediction API validation', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects incomplete or invalid operational features', async () => {
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await predictWaitingTime({ body: { hospitalId: 'H001' } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mlServiceClient.predictWaitingTime).not.toHaveBeenCalled();
  });

  test('returns the regression output using the documented response key', async () => {
    mlServiceClient.predictWaitingTime.mockResolvedValue({ expectedWaitMinutes: 24.5 });
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();

    await predictWaitingTime({
      body: {
        hospitalId: 'H001',
        patientArrivals: 5,
        doctorsAvailable: 8,
        totalBeds: 50,
        bedsAvailable: 20,
        bedOccupancy: 0.6,
        queueLength: 2,
        doctorUtilization: 0.5,
        diagnosticUtilization: 0.4,
        hospitalLoad: 0.45,
        hour: 10,
        dayOfWeek: 2,
      },
    }, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { predicted_waiting_time_minutes: 24.5 },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
