import { api } from './api';

export function getDependents() {
  return api.get('/dependents').then((response) => response.data);
}

export function createDependent(payload) {
  return api.post('/dependents', payload).then((response) => response.data);
}

export function updateDependent(id, payload) {
  return api.put(`/dependents/${id}`, payload).then((response) => response.data);
}

export function deleteDependent(id) {
  return api.delete(`/dependents/${id}`).then((response) => response.data);
}

export function getDependentAssessments(id) {
  return api.get(`/dependents/${id}/assessments`).then((response) => response.data);
}