import axios from 'axios';

/**
 * Axios instance with base configuration and interceptors
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle token expiration
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Return structured error
      return Promise.reject({
        status,
        message: data.message || 'An unexpected error occurred',
        errors: data.errors || [],
      });
    }

    // Network error - no response received from server
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        status: 0,
        message: 'Request timed out. The server may be busy or not running.',
        errors: [],
      });
    }

    // Generic network failure (server unreachable, CORS, DNS, etc.)
    return Promise.reject({
      status: 0,
      message:
        'Cannot connect to the server. Make sure both the frontend dev server (port 5173) ' +
        'and backend server (port 5000) are running. Try: npm run dev from the project root.',
      errors: [],
    });
  }
);

export default api;
