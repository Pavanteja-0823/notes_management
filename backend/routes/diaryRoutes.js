const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getEntries,
  getEntryByDate,
  getEntryById,
  createOrUpdateEntry,
  toggleFavorite,
  deleteEntry,
  getStats,
} = require('../controllers/diaryController');

// All diary routes require authentication
router.use(protect);

// Stats (must be before /:id route to avoid conflict)
router.get('/stats', getStats);

// Get entry by date (e.g., /api/diary/date/2026-07-21)
router.get('/date/:date', getEntryByDate);

// CRUD
router.get('/', getEntries);
router.get('/:id', getEntryById);
router.post('/', createOrUpdateEntry);
router.put('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteEntry);

module.exports = router;
