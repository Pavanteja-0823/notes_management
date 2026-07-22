const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const hpp = require('hpp');
require('dotenv').config();

const connectDB = require('./config/db');
const fs = require('fs');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const { xssProtection, noSqlSanitizer } = require('./middleware/sanitize');

// ─── Route Imports ──────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const diaryRoutes = require('./routes/diaryRoutes');

// ─── Initialize Express ─────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Database Connection ────────────────────────────────────────
// Only connect if not in test environment (tests use in-memory MongoDB)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ═════════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE (applied in order of importance)
// ═════════════════════════════════════════════════════════════════

// 1. Security headers via Helmet
app.use(helmet({ crossOriginResourcePolicy: false }));

// 2. CORS - allow frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. HTTP Parameter Pollution protection
app.use(hpp());

// 4. Rate Limiting (disabled in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', generalLimiter);          // General rate limit for all API routes
  app.use('/api/auth/', authLimiter);        // Strict rate limit for auth routes
}

// 5. Body parsing (before sanitization to parse the input)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 6. Input sanitization
app.use(xssProtection);                    // XSS protection - strips dangerous HTML/JS
app.use(noSqlSanitizer);                   // NoSQL injection prevention

// 7. Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═════════════════════════════════════════════════════════════════
// API ROUTES
// ═════════════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Memora API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/diary', diaryRoutes);

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────
// Only start listening when not in test mode
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Memora API Server`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
  });
}

module.exports = app;
