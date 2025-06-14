import axios, { AxiosError } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: false, // Disable credentials for now
});

/**
 * Request interceptor
 * Adds auth token to requests if available
 */
api.interceptors.request.use(
  (config) => {
    // Only add token if it exists and the request is not to the auth endpoints
    if (!config.url?.includes('/signin') && !config.url?.includes('/signup')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common errors and token refresh logic
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear token and redirect to login if this is not a retry
      if (originalRequest && !(originalRequest.headers as any)['X-Retry']) {
        localStorage.removeItem('token');
        
        // Only redirect if not already on login page to prevent infinite redirects
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.',
        isNetworkError: true
      });
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject({
        message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.',
        isServerError: true
      });
    }
    
    // For other errors, pass through the error
    return Promise.reject(error);
  }
);

export default api;