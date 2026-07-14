const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const hpp = require('hpp');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');
const { xssProtection, noSqlSanitizer } = require('./middleware/sanitize');

// ─── Route Imports ──────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const aiRoutes = require('./routes/aiRoutes');

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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  app.use('/api/ai/', aiLimiter);            // Moderate rate limit for AI features
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

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═════════════════════════════════════════════════════════════════
// API ROUTES
// ═════════════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Notes API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);

// ─── API Documentation ──────────────────────────────────────────
app.get('/api/ai/features', (req, res) => {
  const features = [
    { id: 'summarize', name: 'AI Summarize', price: 5 },
    { id: 'rewrite', name: 'AI Rewrite', price: 4 },
    { id: 'continue-writing', name: 'AI Continue Writing', price: 4 },
    { id: 'grammar-check', name: 'AI Grammar & Spell Check', price: 3 },
    { id: 'improve-writing', name: 'AI Improve Writing', price: 4 },
    { id: 'translate', name: 'AI Translate', price: 4 },
    { id: 'explain', name: 'AI Explain', price: 4 },
    { id: 'chat', name: 'AI Chat with Notes', price: 5 },
    { id: 'smart-search', name: 'AI Smart Search', price: 4 },
    { id: 'smart-tags', name: 'AI Smart Tags', price: 3 },
    { id: 'flashcards', name: 'AI Flashcards', price: 5 },
    { id: 'quiz', name: 'AI Quiz Generator', price: 5 },
    { id: 'mind-map', name: 'AI Mind Map', price: 5 },
    { id: 'meeting-notes', name: 'AI Meeting Notes', price: 5 },
    { id: 'action-items', name: 'AI Action Items', price: 4 },
    { id: 'pdf-summarizer', name: 'AI PDF Summarizer', price: 5 },
    { id: 'ocr', name: 'AI OCR (Image to Text)', price: 4 },
    { id: 'voice-to-notes', name: 'AI Voice to Notes', price: 5 },
    { id: 'email-generator', name: 'AI Email Generator', price: 4 },
    { id: 'blog-generator', name: 'AI Blog/Article Generator', price: 4 },
    { id: 'study-notes', name: 'AI Study Notes', price: 5 },
    { id: 'interview-questions', name: 'AI Interview Questions', price: 4 },
    { id: 'todo-generator', name: 'AI To-Do Generator', price: 4 },
    { id: 'presentation-generator', name: 'AI Presentation Generator', price: 5 },
    { id: 'timeline-generator', name: 'AI Timeline Generator', price: 4 },
    { id: 'table-generator', name: 'AI Table Generator', price: 4 },
    { id: 'code-explanation', name: 'AI Code Explanation', price: 4 },
    { id: 'code-generator', name: 'AI Code Generator', price: 4 },
    { id: 'daily-recap', name: 'AI Daily Recap', price: 3 },
    { id: 'weekly-insights', name: 'AI Weekly Insights', price: 4 },
  ];
  res.json({ success: true, data: { features } });
});

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
    console.log(`\n🚀 Smart Notes API Server`);
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
