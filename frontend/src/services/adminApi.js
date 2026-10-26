import { api } from './api';

export function listAdminHospitals(params = {}) {
  return api.get('/admin/hospitals', { params }).then((response) => response.data);
}

export function createAdminHospital(payload) {
  return api.post('/admin/hospitals', payload).then((response) => response.data);
}

export function updateAdminHospital(id, payload) {
  return api.patch(`/admin/hospitals/${id}`, payload).then((response) => response.data);
}

export function getWaitingTimeMetrics() {
  return api.get('/admin/waiting-time-metrics').then((response) => response.data);
}

export function getRiskModelMetrics() {
  return api.get('/admin/risk-model-metrics').then((response) => response.data);
}

export function runSimulationScenario(payload) {
  return api.post('/simulations', payload).then((response) => response.data);
}

export function getSimulationHistory() {
  return api.get('/simulations/history').then((response) => response.data);
}

export function getOperationalReference() {
  return api.get('/operational-dataset/reference').then((response) => response.data);
}

export function listAdminDoctors() {
  return api.get('/admin/doctors').then((response) => response.data);
}

export function createRegistryDoctor(payload) {
  return api.post('/admin/doctors', payload).then((response) => response.data);
}

export function updateRegistryDoctor(id, payload) {
  return api.patch(`/admin/doctors/${id}`, payload).then((response) => response.data);
}