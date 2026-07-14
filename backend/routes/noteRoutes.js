const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  uploadAttachment,
  removeAttachment,
  getTags,
  togglePin,
  toggleFavorite,
  trashNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { noteValidation } = require('../utils/validators');

// All routes require authentication
router.use(protect);

// ─── Tag Routes ────────────────────────────────────────────────────
router.get('/tags', getTags);

// ─── Note CRUD ────────────────────────────────────────────────────
router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', noteValidation, createNote);
router.put('/:id', noteValidation, updateNote);
router.delete('/:id', deleteNote);

// ─── Note Actions ─────────────────────────────────────────────────
router.put('/:id/restore', restoreNote);
router.put('/:id/pin', togglePin);
router.put('/:id/favorite', toggleFavorite);
router.put('/:id/trash', trashNote);

// ─── Attachments ──────────────────────────────────────────────────
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:attachmentId', removeAttachment);

module.exports = router;
