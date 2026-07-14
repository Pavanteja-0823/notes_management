/**
 * Global error handling middleware
 * Provides consistent error responses
 */

// Custom error class with status code
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle specific Mongoose validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate value for ${field}. Please use another value.`;
  return new AppError(message, 409);
};

/**
 * Handle Mongoose cast errors (invalid ObjectId, etc.)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File size too large. Maximum size is 5MB.', 413);
  }

  // Multer unexpected file error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Unexpected file field.', 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler, AppError };
