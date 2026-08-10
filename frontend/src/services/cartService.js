import { apiClient } from '../api/apiClient';

export const cartService = {
  async getCart() {
    return await apiClient.get('/cart/');
  },
  async addToCart(productId, quantity = 1, variantId = null) {
    return await apiClient.post('/cart/add/', {
      product_id: productId,
      variant_id: variantId,
      quantity: quantity
    });
  },
  async updateCartItem(itemId, quantity) {
    return await apiClient.put(`/cart/items/${itemId}/`, { quantity });
  },
  async removeCartItem(itemId) {
    return await apiClient.delete(`/cart/items/${itemId}/`);
  },
  async clearCart() {
    return await apiClient.post('/cart/clear/');
  }
};
