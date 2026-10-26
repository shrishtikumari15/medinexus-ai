const axios = require('axios');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const env = require('../config/env');

const client = axios.create({ baseURL: env.mlServiceUrl, timeout: 8000 });
let serviceStartPromise = null;

function isConnectionRefused(err) {
  return err && (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED'));
}

function canAutoStartLocalService() {
  if (env.nodeEnv !== 'development') return false;
  try {
    return ['localhost', '127.0.0.1', '::1'].includes(new URL(env.mlServiceUrl).hostname);
  } catch {
    return false;
  }
}

async function waitForLocalService() {
  const deadline = Date.now() + 30000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const { data } = await axios.get(`${env.mlServiceUrl}/health`, { timeout: 1500 });
      if (data.service === 'medinexus-ml-service' && data.status === 'ok') return;
      throw new Error('Port 8000 is responding, but it is not the MediNexus ML service.');
    } catch (err) {
      lastError = err;
      if (err.message?.includes('not the MediNexus ML service')) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(
    `MediNexus ML service did not become healthy within 30 seconds. ${lastError?.message || ''}`.trim()
  );
}

function startLocalService() {
  if (serviceStartPromise) return serviceStartPromise;
  serviceStartPromise = (async () => {
    const serviceDirectory = path.resolve(__dirname, '../../../ml-service');
    let python = path.join(
      serviceDirectory,
      'venv',
      process.platform === 'win32' ? 'Scripts' : 'bin',
      process.platform === 'win32' ? 'python.exe' : 'python'
    );
    if (!fs.existsSync(python)) {
      python = 'python';
    }
    if (process.platform === 'win32') {
      const quote = (value) => `'${value.replace(/'/g, "''")}'`;
      const args = ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'];
      const powershellArgs = args.map(quote).join(',');
      execFileSync('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `Start-Process -FilePath ${quote(python)} -ArgumentList @(${powershellArgs}) -WorkingDirectory ${quote(serviceDirectory)} -WindowStyle Hidden`,
      ], { stdio: 'ignore' });
    } else {
      const child = spawn(
        python,
        ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'],
        { cwd: serviceDirectory, detached: true, stdio: 'ignore' }
      );
      child.unref();
    }
    await waitForLocalService();
  })().finally(() => {
    serviceStartPromise = null;
  });
  return serviceStartPromise;
}

async function postToMlService(endpoint, payload) {
  try {
    const { data } = await client.post(endpoint, payload);
    return data.data;
  } catch (err) {
    if (!isConnectionRefused(err) || !canAutoStartLocalService()) throw normalizeMlError(err);
    try {
      await startLocalService();
    } catch (startupError) {
      const friendly = new Error(
        `Could not start the local ML service automatically. ${startupError.message} Check ml-service/venv and port 8000.`
      );
      friendly.code = 'ML_SERVICE_UNAVAILABLE';
      friendly.originalError = startupError;
      throw friendly;
    }
    try {
      const { data } = await client.post(endpoint, payload);
      return data.data;
    } catch (retryError) {
      throw normalizeMlError(retryError);
    }
  }
}

function normalizeMlError(err) {
  if (isConnectionRefused(err)) {
    const friendly = new Error('ML service is unavailable. Please start the Python service and try again.');
    friendly.code = 'ML_SERVICE_UNAVAILABLE';
    friendly.originalError = err;
    return friendly;
  }
  return err;
}

async function predictRisk(clinicalInputs) {
  return postToMlService('/predict-risk', clinicalInputs);
}

async function predictWaitingTime(operationalInputs) {
  return postToMlService('/predict-waiting-time', operationalInputs);
}

async function getWaitingTimeMetrics() {
  try {
    const { data } = await client.get('/waiting-time-metrics');
    return data.data;
  } catch (err) {
    if (!isConnectionRefused(err) || !canAutoStartLocalService()) throw normalizeMlError(err);
    try {
      await startLocalService();
      const { data } = await client.get('/waiting-time-metrics');
      return data.data;
    } catch (retryError) {
      throw normalizeMlError(retryError);
    }
  }
}

async function getRiskModelMetrics() {
  try {
    const { data } = await client.get('/risk-model-metrics');
    return data.data;
  } catch (err) {
    if (!isConnectionRefused(err) || !canAutoStartLocalService()) throw normalizeMlError(err);
    try {
      await startLocalService();
      const { data } = await client.get('/risk-model-metrics');
      return data.data;
    } catch (retryError) {
      throw normalizeMlError(retryError);
    }
  }
}

async function identifySpecialty(chiefComplaint, riskLabel) {
  return postToMlService('/identify-specialty', { chiefComplaint, riskLabel });
}

async function runSimulation(baseline, scenario) {
  return postToMlService('/simulate', { baseline, scenario });
}

module.exports = { predictRisk, predictWaitingTime, getWaitingTimeMetrics, getRiskModelMetrics, identifySpecialty, runSimulation };
