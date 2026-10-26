import axios from 'axios';

// Base URL comes from an env var, never hard-coded, so dev/staging/prod
// can point at different backends without code changes.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({ baseURL });

// Attach the JWT (once auth exists, Phase 3+) on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medinexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      localStorage.removeItem('medinexus_token');
      localStorage.removeItem('medinexus_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function apiHealthCheck() {
  return api.get('/health');
}
