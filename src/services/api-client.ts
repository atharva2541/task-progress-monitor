import axios from 'axios';

// Determine the API base URL dynamically
const getApiBaseUrl = () => {
  // In production, the API is served from the same domain
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`;
  }
  
  // In development, use the environment variable or fallback to localhost:5000
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with dynamic base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    apiClient.post('/auth/login', { email, password }),
  
  verifyOtp: (email: string, otp: string) => 
    apiClient.post('/auth/verify-otp', { email, otp }),
  
  changePassword: (newPassword: string) => 
    apiClient.post('/auth/change-password', { newPassword }),
  
  getProfile: () => 
    apiClient.get('/auth/me'),
  
  createUser: (userData: any) => 
    apiClient.post('/auth/create-user', userData),
  
  updateUser: (id: string, userData: any) => 
    apiClient.put(`/auth/update-user/${id}`, userData),
  
  deleteUser: (id: string) => 
    apiClient.delete(`/auth/delete-user/${id}`),
  
  getUsers: () => 
    apiClient.get('/auth/users'),
};

// AWS API
export const awsApi = {
  getSettings: () => 
    apiClient.get('/aws'),
  
  updateSettings: (settings: any) => 
    apiClient.post('/aws', settings),
  
  getCredentials: () => 
    apiClient.get('/aws/credentials'),
  
  testConnection: (connectionData: any) => 
    apiClient.post('/aws/test', connectionData),
};

// Tasks API
export const tasksApi = {
  getTasks: () => 
    apiClient.get('/tasks'),
  
  getTask: (id: string) => 
    apiClient.get(`/tasks/${id}`),
  
  createTask: (taskData: any) => 
    apiClient.post('/tasks', taskData),
  
  updateTask: (id: string, taskData: any) => 
    apiClient.put(`/tasks/${id}`, taskData),
  
  deleteTask: (id: string) => 
    apiClient.delete(`/tasks/${id}`),
  
  getTaskInstances: (taskId: string) => 
    apiClient.get(`/tasks/${taskId}/instances`),
};

// Users API
export const usersApi = {
  getUsers: () => 
    apiClient.get('/users'),
  
  getUser: (id: string) => 
    apiClient.get(`/users/${id}`),
  
  updateUser: (id: string, userData: any) => 
    apiClient.put(`/users/${id}`, userData),
  
  deleteUser: (id: string) => 
    apiClient.delete(`/users/${id}`),
};

// Logs API
export const logsApi = {
  getLogs: (params?: any) => 
    apiClient.get('/logs', { params }),
  
  createLog: (logData: any) => 
    apiClient.post('/logs', logData),
};

// Notifications API
export const notificationsApi = {
  getNotifications: () => 
    apiClient.get('/notifications'),
  
  markAsRead: (id: string) => 
    apiClient.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => 
    apiClient.put('/notifications/mark-all-read'),
};

export default apiClient;
