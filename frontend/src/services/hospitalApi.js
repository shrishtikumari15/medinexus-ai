import { api } from './api';

export function searchHospitals(params) {
  return api.get('/hospitals', { params }).then((r) => r.data);
}

export function getOperationalReference() {
  return api.get('/operations/reference').then((r) => r.data);
}

export function getHospitalSuggestions(type, query) {
  return api.get('/hospitals/suggestions', { params: { type, q: query } }).then((r) => r.data.data);
}

export function getHospitalById(id) {
  return api.get(`/hospitals/${id}`).then((r) => r.data);
}

export function getHospitalDoctors(id, specialty) {
  return api.get(`/hospitals/${id}/doctors`, { params: specialty ? { specialty } : {} }).then((r) => r.data);
}

export function compareHospitals(ids) {
  return api.get('/hospitals/compare', { params: { ids: ids.join(',') } }).then((r) => r.data);
}
