import { apiClient } from '../api/apiClient';

export const orderService = {
  async checkout(addressId, notes = '') {
    return await apiClient.post('/orders/checkout/', {
      address_id: addressId,
      payment_method: 'COD',
      notes: notes
    });
  },
  async getUserOrders(page = 1) {
    return await apiClient.get(`/orders/?page=${page}`);
  },
  async getOrderDetail(id) {
    return await apiClient.get(`/orders/${id}/`);
  }
};
