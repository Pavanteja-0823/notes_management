const mongoose = require('mongoose');

/**
 * Category Schema - organizes notes into categories
 */
const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [1, 'Category name cannot be empty'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    color: {
      type: String,
      default: '#6b7280',
    },
    icon: {
      type: String,
      default: 'folder',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    noteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique category names per user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
