import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error handling
    if (error.response?.status === 401) {
      // Sesi habis atau belum login
      console.warn('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;
