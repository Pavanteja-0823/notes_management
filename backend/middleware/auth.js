/**
 * Authentication Middleware
 * Handles JWT verification, refresh token logic, and token generation
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Authentication middleware
 * Verifies JWT access token from Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.',
        code: 'NO_TOKEN',
      });
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND',
      });
    }

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This account has been deactivated.',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN',
      });
    }
    if (error.name === 'TokenExpiredError') {
      // Don't immediately reject — client can use refresh token
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Generate JWT access token (short-lived)
 * @param {string} id - User ID
 * @returns {string} JWT access token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Generate JWT refresh token (long-lived)
 * A refresh token is also a JWT but with a longer expiry
 * and signed with a different secret for security isolation.
 * The token hash is stored in the database for revocation.
 * @param {string} id - User ID
 * @returns {Promise<{ refreshToken: string }>}
 */
const generateRefreshToken = async (id) => {
  const expiresInMs = parseInt(process.env.REFRESH_TOKEN_EXPIRES_MS) || 30 * 24 * 60 * 60 * 1000;
  const expiresInSeconds = Math.floor(expiresInMs / 1000);

  const refreshToken = jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: expiresInSeconds }
  );

  // Store a SHA-256 hash of the refresh token in the database
  // This allows server-side revocation without storing the raw token
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await User.findByIdAndUpdate(id, {
    refreshToken: hashedToken,
    refreshTokenExpires: new Date(
      Date.now() + (parseInt(process.env.REFRESH_TOKEN_EXPIRES_MS) || 30 * 24 * 60 * 60 * 1000)
    ),
  });

  return { refreshToken };
};

/**
 * Verify a refresh token against stored hash
 * @param {string} userId - User ID
 * @param {string} refreshToken - JWT refresh token to verify
 * @returns {Promise<boolean>} Whether token is valid
 */
const verifyRefreshToken = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshToken +refreshTokenExpires');
  if (!user || !user.refreshToken || !user.refreshTokenExpires) {
    return false;
  }

  // Check expiry
  if (new Date() > user.refreshTokenExpires) {
    return false;
  }

  // Hash the provided token and compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  return hashedToken === user.refreshToken;
};

/**
 * Refresh token endpoint handler
 * Exchanges a valid refresh token for a new access token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
        code: 'NO_REFRESH_TOKEN',
      });
    }

    // Verify the refresh token is a valid JWT
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token has expired. Please log in again.',
          code: 'REFRESH_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Verify the refresh token against stored hash
    const isValid = await verifyRefreshToken(decoded.id, refreshToken);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked or is invalid.',
        code: 'REFRESH_REVOKED',
      });
    }

    // Generate new access token
    const newToken = generateToken(decoded.id);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        token: newToken,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not refresh token.',
      code: 'REFRESH_ERROR',
    });
  }
};

module.exports = {
  protect,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  refreshAccessToken,
};
