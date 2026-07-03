import axios from 'axios';
import { store } from '../store'; // Import Redux store to access auth state
import { onLogout } from '../store/userSlice';

// const BASE_URL = 'http://bermij.com:4500/api/v1/'; // Replace with your API base URL
const BASE_URL = 'http://localhost:2500/api/v1/'; // Replace with your API base URL

// Create an Axios instance
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach Auth Token
axiosClient.interceptors.request.use(
  config => {
    const state = store.getState(); // Access Redux state

    const authToken = state.user.authToken; // Get auth token

    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Errors
axiosClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Unauthorized error (401) - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Logout the user if token is invalid
      store.dispatch(onLogout());

      // Redirect to login page
      window.location.href = '/login'; // Adjust if using React Router navigate()

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Utility Functions
const api = {
  get: (url: string, params = {}) => axiosClient.get(url, { params }),
  post: (url: string, data = {}) => axiosClient.post(url, data),
  put: (url: string, data = {}) => axiosClient.put(url, data),
  patch: (url: string, data = {}) => axiosClient.patch(url, data),
  delete: (url: string) => axiosClient.delete(url)
};

export default api;
export { axiosClient };
