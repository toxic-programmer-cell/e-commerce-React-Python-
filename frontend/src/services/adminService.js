import { apiClient } from '../api/apiClient';

export const adminService = {
  async getAdminProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    return await apiClient.get(`/products/admin/list/?${query.toString()}`);
  },
  async createProduct(formData) {
    return await apiClient.post('/products/admin/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  async updateProduct(id, formData) {
    return await apiClient.put(`/products/admin/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  async submitForInspection(id) {
    return await apiClient.post(`/products/admin/${id}/submit-inspection/`);
  },
  async getAdminOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    return await apiClient.get(`/orders/admin/list/?${query.toString()}`);
  },
  async updateOrderStatus(orderId, status) {
    return await apiClient.patch(`/orders/admin/${orderId}/status/`, { order_status: status });
  }
};
