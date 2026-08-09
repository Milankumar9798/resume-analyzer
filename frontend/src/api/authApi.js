import api from './axios';

export const registerUser = (payload) => api.post('/auth/register', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);
export const fetchProfile = () => api.get('/auth/profile');
export const updateProfile = (payload) => api.put('/auth/profile', payload);
