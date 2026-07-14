import api from './axios';

const categoriesApi = {
  /**
   * Get all categories
   */
  getCategories: () => api.get('/categories'),

  /**
   * Create a new category
   */
  createCategory: (data) => api.post('/categories', data),

  /**
   * Update a category
   */
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),

  /**
   * Delete a category
   */
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export default categoriesApi;
