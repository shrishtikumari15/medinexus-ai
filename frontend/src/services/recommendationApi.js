import { api } from './api';

export function createAssessment(payload) {
  return api.post('/assessments', payload).then((r) => r.data);
}

export function getRecommendationHistory(filters = {}) {
  return api.get('/assessments/history', { params: filters }).then((r) => r.data);
}

export function getRecommendationById(id) {
  return api.get(`/recommendations/${id}`).then((r) => r.data);
}

export function runSensitivityAnalysis(id, weightScenarios) {
  return api.post(`/recommendations/${id}/sensitivity`, { weightScenarios }).then((r) => r.data);
}
