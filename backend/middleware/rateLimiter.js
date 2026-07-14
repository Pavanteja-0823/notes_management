/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and brute-force attacks
 */
const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Applied to all /api routes
 * Default: 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Strict rate limiter for auth routes (login, register)
 * Prevents brute-force password attacks
 * Default: 10 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  skipSuccessfulRequests: false,
});

/**
 * Moderate rate limiter for AI features
 * Prevents abuse of premium features
 * Default: 30 requests per minute per IP
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please slow down.',
    code: 'AI_RATE_LIMIT_EXCEEDED',
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  aiLimiter,
};
