import { apiClient } from '../api/apiClient';

export const authService = {
  async register(data) {
    return await apiClient.post('/auth/register/', data);
  },
  async login(credentials) {
    const res = await apiClient.post('/auth/login/', credentials);
    if (res.success && res.data.tokens) {
      localStorage.setItem('access_token', res.data.tokens.access_token);
      localStorage.setItem('refresh_token', res.data.tokens.refresh_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  async getProfile() {
    return await apiClient.get('/auth/me/');
  },
  async updateProfile(data) {
    return await apiClient.put('/auth/me/', data);
  },
  async changePassword(data) {
    return await apiClient.post('/auth/change-password/', data);
  },
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
