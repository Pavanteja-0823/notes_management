const { validationResult } = require('express-validator');
const Note = require('../models/Note');
const Category = require('../models/Category');

/**
 * @desc    Get all notes for current user with filters
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      tag,
      isPinned,
      isFavorite,
      isArchived,
      isTrashed,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      color,
      startDate,
      endDate,
      hasReminder,
    } = req.query;

    // Build filter query
    const query = { user: req.user._id };

    // By default, show non-archived, non-trashed notes
    if (isArchived === undefined && isTrashed === undefined) {
      query.isArchived = false;
      query.isTrashed = false;
    }

    // Apply specific filters
    if (isArchived !== undefined) query.isArchived = isArchived === 'true';
    if (isTrashed !== undefined) query.isTrashed = isTrashed === 'true';
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';
    if (isFavorite !== undefined) query.isFavorite = isFavorite === 'true';

    // Category filter
    if (category) query.category = category;

    // Tag filter
    if (tag) query.tags = { $in: [tag.toLowerCase()] };

    // Color filter
    if (color) query.color = color;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Reminder filter
    if (hasReminder === 'true') query.reminder = { $ne: null };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [search.toLowerCase()] } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    // Always sort pinned notes first
    sort.isPinned = -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Note.countDocuments(query);

    const notes = await Note.find(query)
      .populate('category', 'name color')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
          hasMore: skip + notes.length < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('category', 'name color');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    res.json({
      success: true,
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { title, content, richContent, category, tags, color, reminder } = req.body;

    // Verify category belongs to user if provided
    if (category) {
      const catExists = await Category.findOne({
        _id: category,
        user: req.user._id,
      });
      if (!catExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
      }
    }

    // Format tags
    const formattedTags = tags
      ? tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean)
      : [];

    const note = await Note.create({
      user: req.user._id,
      title: title || 'Untitled',
      content: content || '',
      richContent: richContent || '',
      category: category || null,
      tags: formattedTags,
      color: color || '#ffffff',
      reminder: reminder || null,
    });

    // Update category note count
    if (category) {
      await Category.findByIdAndUpdate(category, { $inc: { noteCount: 1 } });
    }

    const populatedNote = await Note.findById(note._id).populate('category', 'name color');

    res.status(201).json({
      success: true,
      message: 'Note created successfully!',
      data: { note: populatedNote },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    let note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    const {
      title,
      content,
      richContent,
      category,
      tags,
      color,
      isPinned,
      isFavorite,
      isArchived,
      isTrashed,
      reminder,
    } = req.body;

    // Track old category for count update
    const oldCategory = note.category;

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (richContent !== undefined) note.richContent = richContent;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isFavorite !== undefined) note.isFavorite = isFavorite;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (isTrashed !== undefined) note.isTrashed = isTrashed;
    if (reminder !== undefined) note.reminder = reminder;

    // Handle tags
    if (tags) {
      note.tags = tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean);
    }

    // Handle category change
    if (category !== undefined) {
      note.category = category || null;

      // Update old category count
      if (oldCategory && oldCategory.toString() !== category) {
        await Category.findByIdAndUpdate(oldCategory, { $inc: { noteCount: -1 } });
      }

      // Update new category count
      if (category) {
        await Category.findByIdAndUpdate(category, { $inc: { noteCount: 1 } });
      }
    }

    await note.save();

    const populatedNote = await Note.findById(note._id).populate('category', 'name color');

    res.json({
      success: true,
      message: 'Note updated successfully!',
      data: { note: populatedNote },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a note permanently
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Update category count
    if (note.category) {
      await Category.findByIdAndUpdate(note.category, { $inc: { noteCount: -1 } });
    }

    res.json({
      success: true,
      message: 'Note deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restore a trashed note
 * @route   PUT /api/notes/:id/restore
 * @access  Private
 */
const restoreNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, isTrashed: true },
      { isTrashed: false, trashedAt: null },
      { new: true }
    ).populate('category', 'name color');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Trashed note not found.',
      });
    }

    res.json({
      success: true,
      message: 'Note restored successfully!',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload note attachment
 * @route   POST /api/notes/:id/attachments
 * @access  Private
 */
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file.',
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
    };

    note.attachments.push(attachment);
    await note.save();

    res.status(201).json({
      success: true,
      message: 'Attachment uploaded successfully!',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove note attachment
 * @route   DELETE /api/notes/:id/attachments/:attachmentId
 * @access  Private
 */
const removeAttachment = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    note.attachments = note.attachments.filter(
      (att) => att._id.toString() !== req.params.attachmentId
    );
    await note.save();

    res.json({
      success: true,
      message: 'Attachment removed successfully!',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tags for current user
 * @route   GET /api/notes/tags
 * @access  Private
 */
const getTags = async (req, res, next) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
      isTrashed: false,
    }).select('tags');

    // Aggregate all tags and count occurrences
    const tagMap = {};
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });

    const tags = Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: { tags },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle pin status
 * @route   PUT /api/notes/:id/pin
 * @access  Private
 */
const togglePin = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({
      success: true,
      message: note.isPinned ? 'Note pinned!' : 'Note unpinned!',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle favorite status
 * @route   PUT /api/notes/:id/favorite
 * @access  Private
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.json({
      success: true,
      message: note.isFavorite ? 'Note added to favorites!' : 'Note removed from favorites!',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trash a note (soft delete)
 * @route   PUT /api/notes/:id/trash
 * @access  Private
 */
const trashNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isTrashed: true, isArchived: false },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    res.json({
      success: true,
      message: 'Note moved to trash.',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
