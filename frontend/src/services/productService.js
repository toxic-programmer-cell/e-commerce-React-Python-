import { apiClient } from '../api/apiClient';

export const productService = {
  async getCategories() {
    return await apiClient.get('/products/categories/');
  },
  async getBrands() {
    return await apiClient.get('/products/brands/');
  },
  async getPublicProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.brand) query.append('brand', params.brand);
    if (params.min_price) query.append('min_price', params.min_price);
    if (params.max_price) query.append('max_price', params.max_price);
    if (params.ordering) query.append('ordering', params.ordering);
    if (params.page) query.append('page', params.page);
    if (params.page_size) query.append('page_size', params.page_size);

    return await apiClient.get(`/products/public/?${query.toString()}`);
  },
  async getProductDetail(pkOrSlug) {
    return await apiClient.get(`/products/public/${pkOrSlug}/`);
  }
};
