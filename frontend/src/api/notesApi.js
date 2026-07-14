import api from './axios';

const notesApi = {
  /**
   * Get all notes with optional filters
   */
  getNotes: (params) => api.get('/notes', { params }),

  /**
   * Get single note
   */
  getNote: (id) => api.get(`/notes/${id}`),

  /**
   * Create a new note
   */
  createNote: (data) => api.post('/notes', data),

  /**
   * Update a note
   */
  updateNote: (id, data) => api.put(`/notes/${id}`, data),

  /**
   * Delete a note permanently
   */
  deleteNote: (id) => api.delete(`/notes/${id}`),

  /**
   * Restore a trashed note
   */
  restoreNote: (id) => api.put(`/notes/${id}/restore`),

  /**
   * Toggle pin status
   */
  togglePin: (id) => api.put(`/notes/${id}/pin`),

  /**
   * Toggle favorite status
   */
  toggleFavorite: (id) => api.put(`/notes/${id}/favorite`),

  /**
   * Move note to trash
   */
  trashNote: (id) => api.put(`/notes/${id}/trash`),

  /**
   * Upload attachment to a note
   */
  uploadAttachment: (id, formData) =>
    api.post(`/notes/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Remove attachment from note
   */
  removeAttachment: (noteId, attachmentId) =>
    api.delete(`/notes/${noteId}/attachments/${attachmentId}`),

  /**
   * Get all tags for current user
   */
  getTags: () => api.get('/notes/tags'),
};

export default notesApi;
