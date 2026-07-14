const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { categoryValidation } = require('../utils/validators');

// All routes require authentication
router.use(protect);

router.get('/', getCategories);
router.post('/', categoryValidation, createCategory);
router.put('/:id', categoryValidation, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
