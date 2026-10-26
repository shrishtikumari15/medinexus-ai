const { predictRisk } = require('./src/services/mlServiceClient');

(async () => {
  const riskResult = await predictRisk({
    temperature: 98.6,
    heartrate: 98,
    resprate: 18,
    o2sat: 96,
    sbp: 130,
    dbp: 85,
    pain: 8,
    chiefComplaint: 'Severe left-sided chest pain radiating to left arm, shortness of breath',
    age: 45,
    gender: 'male',
  });
  console.log('Risk Result:');
  console.log(JSON.stringify(riskResult, null, 2));
})();
