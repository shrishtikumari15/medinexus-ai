import { api } from './api';

export function searchDoctors(params) {
  return api.get('/doctors', { params }).then((response) => response.data);
}

export function getDoctorById(id) {
  return api.get(`/doctors/${id}`).then((response) => response.data);
}

// Doctor Workspace APIs
export function getDoctorProfile() {
  return api.get('/doctors/profile/me').then((response) => response.data);
}

export function updateDoctorProfile(payload) {
  return api.put('/doctors/profile/me', payload).then((response) => response.data);
}

export function getDoctorPatientCases(params) {
  return api.get('/doctors/cases', { params }).then((response) => response.data);
}

export function savePatientCaseNote(assessmentId, payload) {
  return api.post(`/doctors/cases/${assessmentId}/review`, payload).then((response) => response.data);
}