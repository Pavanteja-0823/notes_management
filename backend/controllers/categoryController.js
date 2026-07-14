const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const Note = require('../models/Note');

/**
 * @desc    Get all categories for current user
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, color, icon, description } = req.body;

    const category = await Category.create({
      user: req.user._id,
      name,
      color: color || '#6b7280',
      icon: icon || 'folder',
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, color, icon, description } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { name, color, icon, description } },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully!',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Remove category reference from all notes
    await Note.updateMany(
      { category: category._id, user: req.user._id },
      { category: null }
    );

    res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
