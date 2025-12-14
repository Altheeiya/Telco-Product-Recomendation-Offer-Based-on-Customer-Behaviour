<<<<<<< Updated upstream
import axios from "axios";
import { getToken } from "../utils/auth";

// Local
const API_URL = "http://localhost:5000/api";

// Production
// const API_URL = "domain.com/api";
=======
import axios from 'axios';
import { getToken } from '../utils/auth';
>>>>>>> Stashed changes

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

<<<<<<< Updated upstream
export default api;
=======
// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
>>>>>>> Stashed changes
