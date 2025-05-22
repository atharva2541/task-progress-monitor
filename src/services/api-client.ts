
import axios from 'axios';

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized error (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  requestOtp: (email: string) => api.post('/auth/request-otp', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (newPassword: string) => api.post('/auth/reset-password', { newPassword }),
  getProfile: () => api.get('/auth/me'),
};

// User API
export const userApi = {
  getUsers: () => api.get('/users'),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (userData: any) => api.post('/users', userData),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Task API
export const taskApi = {
  getTasks: () => api.get('/tasks'),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (taskData: any) => api.post('/tasks', taskData),
  updateTask: (id: string, taskData: any) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  getTaskInstances: (id: string) => api.get(`/tasks/${id}/instances`),
};

// AWS API
export const awsApi = {
  getSettings: () => api.get('/aws'),
  updateSettings: (settings: any) => api.post('/aws', settings),
  testConnection: (credentials: any) => api.post('/aws/test', credentials),
};

// Logs API
export const logsApi = {
  getLogs: (filters?: any) => api.get('/logs', { params: filters }),
  createLog: (logData: any) => api.post('/logs', logData),
  getLogMetrics: () => api.get('/logs/metrics'),
};

// Notification API
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

export default api;
