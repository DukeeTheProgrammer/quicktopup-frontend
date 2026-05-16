import axios from 'axios';

// Always hit the backend directly. The ngrok-skip-browser-warning header
// disables the ngrok interstitial page. CORS is handled by the Django backend.
const BASE_URL = 'https://unmade-backboned-agreeably.ngrok-free.dev/api';

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }
  // Always include ngrok bypass on every request
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
