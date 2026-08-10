import { apiClient } from '../api/apiClient';

export const addressService = {
  async getAddresses() {
    return await apiClient.get('/addresses/');
  },
  async createAddress(addressData) {
    return await apiClient.post('/addresses/', addressData);
  },
  async updateAddress(id, addressData) {
    return await apiClient.put(`/addresses/${id}/`, addressData);
  },
  async deleteAddress(id) {
    return await apiClient.delete(`/addresses/${id}/`);
  }
};
