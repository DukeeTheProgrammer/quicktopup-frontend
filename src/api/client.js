import axios from 'axios';

const BASE_URL = 'https://unmade-backboned-agreeably.ngrok-free.dev/api';

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // ngrok shows a browser warning interstitial page for unrecognised browsers.
    // This header bypasses it so we always get JSON back instead of HTML.
    'ngrok-skip-browser-warning': '1',
  },
});

// Always read the token fresh from localStorage on every request.
// This prevents the stale-token bug where the axios instance was created
// before the token was written (e.g. right after login + window.location redirect).
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  } else {
    delete config.headers['Authorization'];
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log full error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
