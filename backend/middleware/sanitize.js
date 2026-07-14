/**
 * Input Sanitization Middleware
 * Protects against XSS attacks and NoSQL injection
 */
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Custom XSS sanitization helper
 * Strips out potentially dangerous HTML/JS from string values
 */
const stripXSS = (value) => {
  if (typeof value === 'string') {
    // Remove script tags and event handlers
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  }
  return value;
};

/**
 * Recursively sanitize all string values in an object
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return stripXSS(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
};

/**
 * XSS Protection Middleware
 * Cleans request body, query params, and URL params
 */
const xssProtection = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

/**
 * MongoDB NoSQL Injection Protection
 * Strip $ and . from keys in req.body, req.query, and req.params
 * to prevent attackers from using MongoDB operators like $gt, $ne, etc.
 */
const noSqlSanitizer = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Request with path ${req.path} contained sanitized key: ${key}`);
  },
});

module.exports = {
  xssProtection,
  noSqlSanitizer,
  stripXSS,
};
