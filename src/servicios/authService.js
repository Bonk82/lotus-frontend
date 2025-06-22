// services/authService.js
import apiClient from './apiClient';

export const authService = {
  login: async (user, password) => {
    return apiClient.post('/auth/login', { user, password });
  },
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
  // Otros métodos relacionados con autenticación...
};