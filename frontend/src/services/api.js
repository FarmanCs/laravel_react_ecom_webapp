import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject({
      type: 'REQUEST_ERROR',
      message: 'Failed to prepare request',
      originalError: error,
    });
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response from server)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({
          type: 'TIMEOUT_ERROR',
          status: 408,
          message: 'Request timeout - Server is not responding. Please check your connection.',
          details: 'The server took too long to respond. Please try again.',
        });
      }

      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        return Promise.reject({
          type: 'NETWORK_ERROR',
          status: 0,
          message: 'Network Error - Unable to connect to server',
          details: 'Please check your internet connection and ensure the server is running.',
        });
      }

      return Promise.reject({
        type: 'CONNECTION_ERROR',
        status: 0,
        message: 'Connection failed',
        details: error.message || 'Unable to reach the server.',
      });
    }

    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    // Handle specific status codes
    switch (status) {
      case 400:
        return Promise.reject({
          type: 'VALIDATION_ERROR',
          status: 400,
          message: data.message || 'Validation failed - Please check your input',
          details: data.errors || data.message,
        });

      case 401:
        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('logout'));
        return Promise.reject({
          type: 'AUTH_ERROR',
          status: 401,
          message: 'Session expired - Please login again',
          details: 'Your authentication token has expired.',
        });

      case 403:
        return Promise.reject({
          type: 'PERMISSION_ERROR',
          status: 403,
          message: 'Access Denied - You do not have permission',
          details: data.message || 'You do not have permission to perform this action.',
        });

      case 404:
        return Promise.reject({
          type: 'NOT_FOUND_ERROR',
          status: 404,
          message: 'Not Found - Resource does not exist',
          details: data.message || 'The requested resource could not be found.',
        });

      case 422:
        // Validation errors (Laravel returns 422 for validation)
        return Promise.reject({
          type: 'VALIDATION_ERROR',
          status: 422,
          message: 'Please correct the errors below',
          details: data.errors || data.message,
        });

      case 429:
        return Promise.reject({
          type: 'RATE_LIMIT_ERROR',
          status: 429,
          message: 'Too many requests - Please wait before trying again',
          details: 'You are making too many requests. Please slow down.',
        });

      case 500:
        return Promise.reject({
          type: 'SERVER_ERROR',
          status: 500,
          message: 'Server Error - Something went wrong',
          details: data.message || 'An error occurred on the server. Please try again later.',
        });

      case 502:
        return Promise.reject({
          type: 'BAD_GATEWAY_ERROR',
          status: 502,
          message: 'Bad Gateway - Server is temporarily unavailable',
          details: 'The server is temporarily unavailable. Please try again later.',
        });

      case 503:
        return Promise.reject({
          type: 'SERVICE_UNAVAILABLE_ERROR',
          status: 503,
          message: 'Service Under Maintenance',
          details: 'The server is under maintenance. Please check back soon.',
        });

      case 504:
        return Promise.reject({
          type: 'GATEWAY_TIMEOUT_ERROR',
          status: 504,
          message: 'Gateway Timeout - Server did not respond',
          details: 'The server did not respond in time. Please try again.',
        });

      default:
        return Promise.reject({
          type: 'UNKNOWN_ERROR',
          status: status,
          message: data.message || `Error ${status}`,
          details: data.message || 'An unexpected error occurred.',
        });
    }
  }
);

export default api;