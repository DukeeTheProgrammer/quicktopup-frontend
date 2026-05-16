import axios from 'axios';

const BASE_URL = 'https://unmade-backboned-agreeably.ngrok-free.dev/api';

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // NOTE: ngrok-skip-browser-warning is NOT sent here.
    // It's not in the server's CORS_ALLOW_HEADERS, so including it causes
    // the preflight to fail. The Django CORS config allows our Vercel origin
    // directly, so we don't need it — ngrok only shows the interstitial for
    // browser tab visits, not for programmatic API calls from an allowed origin.
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
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
