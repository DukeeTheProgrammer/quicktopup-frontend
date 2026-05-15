import axios from 'axios';

// In production (Vercel), use the /api proxy to avoid CORS.
// In development, hit the ngrok URL directly.
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? '/api'
    : 'https://unmade-backboned-agreeably.ngrok-free.dev/api';

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
    config.headers.Authorization = `Token ${token}`;
  }
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
