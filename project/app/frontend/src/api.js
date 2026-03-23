import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const getProfileCompletion = () => api.get('/profile/completion');

// Jobs
export const getJobs = () => api.get('/jobs');
export const searchJobs = (params) => api.get('/jobs/search', { params });
export const getJob = (id) => api.get(`/jobs/${id}`);

// Applications
export const createApplication = (data) => api.post('/applications', data);
export const getApplications = () => api.get('/applications');
export const updateApplicationStatus = (id, status) => api.patch(`/applications/${id}/status`, { status });

// Chat
export const sendChatMessage = (data) => api.post('/chat/message', data);
export const getChatHistory = (sessionId) => api.get('/chat/history', { params: { session_id: sessionId } });

// Resume
export const getResumeSuggestions = () => api.post('/resume/suggestions');

export default api;