const mongoose = require('mongoose');

/**
 * Diary Schema - stores daily journal/diary entries
 * Each entry represents a day's personal reflection, feelings, and experiences
 */
const diarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: '',
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
    mood: {
      type: String,
      enum: ['happy', 'excited', 'neutral', 'sad', 'angry', 'anxious', 'grateful', 'tired', ''],
      default: '',
    },
    // Weather or activity tags for the day
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // Word count for tracking writing habits
    wordCount: {
      type: Number,
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one entry per user per date
diarySchema.index({ user: 1, date: 1 }, { unique: true });
// Text search on content and title (user filter applied in query, not in text index)
diarySchema.index({ title: 'text', content: 'text' });

// Pre-save: calculate word count from plain text content
diarySchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const plainText = this.content.replace(/<[^>]*>/g, '').trim();
    this.wordCount = plainText ? plainText.split(/\s+/).length : 0;
  }
  next();
});

module.exports = mongoose.model('Diary', diarySchema);
