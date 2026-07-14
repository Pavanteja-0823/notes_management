const mongoose = require('mongoose');

/**
 * Note Schema - stores all note data with rich features
 */
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: 'Untitled',
    },
    content: {
      type: String,
      default: '',
    },
    // Rich text stored as HTML
    richContent: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    color: {
      type: String,
      default: '#ffffff',
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrashed: {
      type: Boolean,
      default: false,
      index: true,
    },
    trashedAt: {
      type: Date,
      default: null,
    },
    reminder: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        path: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
noteSchema.index({ user: 1, isPinned: -1, createdAt: -1 });
noteSchema.index({ user: 1, isArchived: 1, createdAt: -1 });
noteSchema.index({ user: 1, isTrashed: 1, trashedAt: -1 });
noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ user: 1, title: 'text', content: 'text' });

// Pre-save middleware: set trashedAt when trashing
noteSchema.pre('save', function (next) {
  if (this.isModified('isTrashed') && this.isTrashed) {
    this.trashedAt = new Date();
  }
  if (this.isModified('isTrashed') && !this.isTrashed) {
    this.trashedAt = null;
  }
  next();
});

module.exports = mongoose.model('Note', noteSchema);
