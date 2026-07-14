const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

/**
 * File upload configuration using Multer
 * Supports images (jpg, jpeg, png, gif, webp, svg) and PDFs
 */

// Allowed file types
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  pdf: ['application/pdf'],
};

const ALLOWED_MIMETYPES = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.pdf];

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads');
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only images (jpg, jpeg, png, gif, webp, svg) and PDFs are allowed.',
        400
      ),
      false
    );
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
});

module.exports = upload;
