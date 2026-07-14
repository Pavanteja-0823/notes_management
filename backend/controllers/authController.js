const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This account has been deactivated.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, preferences } = req.body;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (preferences) {
      updateData['preferences.theme'] = preferences.theme;
      updateData['preferences.defaultNoteColor'] = preferences.defaultNoteColor;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload avatar
 * @route   POST /api/auth/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file.',
      });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully!',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete account (deactivate)
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.json({
      success: true,
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
};
