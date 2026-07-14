import api from './axios';

const authApi = {
  /**
   * Register a new user
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Login user
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Get current user profile
   */
  getMe: () => api.get('/auth/me'),

  /**
   * Update user profile
   */
  updateProfile: (data) => api.put('/auth/profile', data),

  /**
   * Change password
   */
  changePassword: (data) => api.put('/auth/password', data),

  /**
   * Upload avatar
   */
  uploadAvatar: (formData) =>
    api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Delete account
   */
  deleteAccount: () => api.delete('/auth/account'),
};

export default authApi;
