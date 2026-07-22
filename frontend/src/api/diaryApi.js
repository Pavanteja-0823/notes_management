import axios from './axios';

const diaryApi = {
  // Get all diary entries (with filters/pagination)
  getEntries: (params = {}) => axios.get('/diary', { params }),

  // Get entry for a specific date (YYYY-MM-DD)
  getEntryByDate: (date) => axios.get(`/diary/date/${date}`),

  // Get entry by ID
  getEntryById: (id) => axios.get(`/diary/${id}`),

  // Create or update entry for a date
  saveEntry: (data) => axios.post('/diary', data),

  // Toggle favorite
  toggleFavorite: (id) => axios.put(`/diary/${id}/favorite`),

  // Delete entry
  deleteEntry: (id) => axios.delete(`/diary/${id}`),

  // Get diary stats
  getStats: () => axios.get('/diary/stats'),
};

export default diaryApi;
