const Diary = require('../models/Diary');

/**
 * Helper: Normalize a date to start of day (UTC)
 */
const normalizeDate = (dateStr) => {
  const date = new Date(dateStr);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/**
 * @desc    Get all diary entries for user (paginated, sorted by date desc)
 * @route   GET /api/diary
 * @access  Private
 */
const getEntries = async (req, res) => {
  try {
    const { page = 1, limit = 20, month, year, mood, search, favorite } = req.query;

    const filter = { user: req.user._id };

    // Filter by month/year
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by mood
    if (mood) {
      filter.mood = mood;
    }

    // Filter favorites
    if (favorite === 'true') {
      filter.isFavorite = true;
    }

    // Search by text
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const entries = await Diary.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Diary.countDocuments(filter);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diary entries.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single diary entry by date
 * @route   GET /api/diary/date/:date
 * @access  Private
 */
const getEntryByDate = async (req, res) => {
  try {
    const date = normalizeDate(req.params.date);

    const entry = await Diary.findOne({
      user: req.user._id,
      date,
    });

    if (!entry) {
      return res.json({
        success: true,
        data: { entry: null },
      });
    }

    res.json({
      success: true,
      data: { entry },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diary entry.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single diary entry by ID
 * @route   GET /api/diary/:id
 * @access  Private
 */
const getEntryById = async (req, res) => {
  try {
    const entry = await Diary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found.',
      });
    }

    res.json({
      success: true,
      data: { entry },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diary entry.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create or update a diary entry for a specific date
 * @route   POST /api/diary
 * @access  Private
 */
const createOrUpdateEntry = async (req, res) => {
  try {
    const { date, title, content, richContent, mood, tags } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required.',
      });
    }

    const normalizedDate = normalizeDate(date);

    // Build update object with only provided fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (richContent !== undefined) updateFields.richContent = richContent;
    if (mood !== undefined) updateFields.mood = mood;
    if (tags !== undefined) updateFields.tags = tags;

    // Calculate word count from plain text content
    if (content !== undefined) {
      const plainText = (content || '').replace(/<[^>]*>/g, '').trim();
      updateFields.wordCount = plainText ? plainText.split(/\s+/).length : 0;
    }

    // Use findOneAndUpdate with upsert to avoid race conditions
    const entry = await Diary.findOneAndUpdate(
      { user: req.user._id, date: normalizedDate },
      {
        $set: updateFields,
        $setOnInsert: {
          user: req.user._id,
          date: normalizedDate,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Diary entry saved.',
      data: { entry },
    });
  } catch (error) {
    // Handle duplicate key error (shouldn't happen with upsert logic above)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An entry for this date already exists.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to save diary entry.',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle favorite on a diary entry
 * @route   PUT /api/diary/:id/favorite
 * @access  Private
 */
const toggleFavorite = async (req, res) => {
  try {
    const entry = await Diary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found.',
      });
    }

    entry.isFavorite = !entry.isFavorite;
    await entry.save();

    res.json({
      success: true,
      message: entry.isFavorite ? 'Marked as favorite.' : 'Removed from favorites.',
      data: { entry },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update diary entry.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a diary entry
 * @route   DELETE /api/diary/:id
 * @access  Private
 */
const deleteEntry = async (req, res) => {
  try {
    const entry = await Diary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Diary entry not found.',
      });
    }

    res.json({
      success: true,
      message: 'Diary entry deleted.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete diary entry.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get diary statistics (streak, total entries, mood distribution)
 * @route   GET /api/diary/stats
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalEntries = await Diary.countDocuments({ user: userId });
    const favoriteEntries = await Diary.countDocuments({ user: userId, isFavorite: true });

    // Mood distribution
    const moodStats = await Diary.aggregate([
      { $match: { user: userId, mood: { $ne: '' } } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Current writing streak
    const entries = await Diary.find({ user: userId })
      .sort({ date: -1 })
      .select('date')
      .lean();

    let streak = 0;
    if (entries.length > 0) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      let checkDate = new Date(today);
      
      for (const entry of entries) {
        const entryDate = new Date(entry.date);
        entryDate.setUTCHours(0, 0, 0, 0);
        
        if (entryDate.getTime() === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (entryDate < checkDate) {
          break;
        }
      }
    }

    // Total words written
    const wordCountResult = await Diary.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalWords: { $sum: '$wordCount' } } },
    ]);

    const totalWords = wordCountResult.length > 0 ? wordCountResult[0].totalWords : 0;

    // Dates with entries (for calendar marking) — current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthEntries = await Diary.find({
      user: userId,
      date: { $gte: monthStart, $lte: monthEnd },
    }).select('date mood').lean();

    const datesWithEntries = monthEntries.map((e) => ({
      date: e.date,
      mood: e.mood,
    }));

    res.json({
      success: true,
      data: {
        totalEntries,
        favoriteEntries,
        streak,
        totalWords,
        moodStats,
        datesWithEntries,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diary statistics.',
      error: error.message,
    });
  }
};

module.exports = {
  getEntries,
  getEntryByDate,
  getEntryById,
  createOrUpdateEntry,
  toggleFavorite,
  deleteEntry,
  getStats,
};
