import { apiClient } from '../api/apiClient';

export const superAdminService = {
  async getInspectionQueue(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    return await apiClient.get(`/super-admin/inspections/queue/?${query.toString()}`);
  },
  async approveProduct(productId, notes = '') {
    return await apiClient.post(`/super-admin/inspections/${productId}/approve/`, { notes });
  },
  async rejectProduct(productId, rejectionReason, notes = '') {
    return await apiClient.post(`/super-admin/inspections/${productId}/reject/`, {
      rejection_reason: rejectionReason,
      notes: notes
    });
  },
  async getUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    return await apiClient.get(`/super-admin/users/?${query.toString()}`);
  },
  async toggleUserStatus(userId) {
    return await apiClient.patch(`/super-admin/users/${userId}/toggle-status/`);
  },
  async createAdmin(data) {
    return await apiClient.post('/super-admin/admins/create/', data);
  },
  async getAuditLogs(page = 1) {
    return await apiClient.get(`/super-admin/audit-logs/?page=${page}`);
  },
  async getStats() {
    return await apiClient.get('/super-admin/stats/');
  }
};
