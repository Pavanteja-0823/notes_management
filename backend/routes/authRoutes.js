const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
} = require('../controllers/authController');
const { protect, refreshAccessToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  registerValidation,
  loginValidation,
  profileValidation,
  passwordValidation,
} = require('../utils/validators');

// ─── Public Routes ────────────────────────────────────────────────
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// ─── Refresh Token Route ──────────────────────────────────────────
// Exchanges a valid refresh token for a new access token
router.post('/refresh-token', refreshAccessToken);

// ─── Protected Routes ─────────────────────────────────────────────
router.get('/me', protect, getMe);
router.put('/profile', protect, profileValidation, updateProfile);
router.put('/password', protect, passwordValidation, changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/account', protect, deleteAccount);

module.exports = router;
