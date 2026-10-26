const axios = require('axios');
const mlServiceClient = require('./src/services/mlServiceClient');

(async () => {
  const riskResult = await mlServiceClient.predictTriage({
    temperature: 98.6,
    heartrate: 98,
    resprate: 18,
    o2sat: 96,
    sbp: 130,
    dbp: 85,
    pain: 8,
    chiefComplaint: 'Severe left-sided chest pain radiating to left arm, shortness of breath',
  });
  console.log('Risk Result from ML service:');
  console.log(JSON.stringify(riskResult, null, 2));
})();
