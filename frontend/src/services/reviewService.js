import { apiClient } from '../api/apiClient';

export const reviewService = {
  async getProductReviews(productId, page = 1) {
    return await apiClient.get(`/reviews/product/${productId}/?page=${page}`);
  },
  async submitReview(reviewData) {
    return await apiClient.post('/reviews/', reviewData);
  }
};
