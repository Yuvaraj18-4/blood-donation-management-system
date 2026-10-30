// src/api.js
import axios from 'axios';

// The API base URL points to Express backend /api routes
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization JWT token to all requests if user is logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Auth APIs ---
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getCurrentUser = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// --- Donors API ---
export const getDonors = (bloodGroup = '', location = '') =>
  API.get('/donors', {
    params: {
      bloodGroup: bloodGroup || undefined,
      bloodType: bloodGroup || undefined,
      location: location || undefined,
      pincode: location || undefined,
    },
  });

export const getDonorEligibility = (donorId) =>
  API.get(`/donors/${donorId}/eligibility`);

// --- Camps API ---
export const getCamps = (search = '') =>
  API.get('/camps', {
    params: {
      search: search || undefined,
      pincode: search || undefined,
    },
  });

export const createCamp = (campData) => API.post('/camps', campData);

// --- Registrations API ---
export const getRegistrations = (userId) => API.get(`/registrations/${userId}`);
export const registerForCamp = (campId, userId) =>
  API.post('/registrations', { campId, userId });
export const cancelRegistration = (registrationId) =>
  API.delete(`/registrations/${registrationId}`);
export const getCertificate = (registrationId) =>
  API.get(`/registrations/${registrationId}/certificate`);

// --- Emergency Blood Requests API ---
export const getBloodRequests = (params = {}) => API.get('/requests', { params });
export const createBloodRequest = (data) => API.post('/requests', data);
export const updateBloodRequestStatus = (id, status) =>
  API.put(`/requests/${id}/status`, { status });

// --- Chatbot API ---
export const sendChatMessage = (message) => API.post('/chatbot', { message });

export default API;
