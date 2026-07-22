/**
 * Test Setup
 * Uses mongodb-memory-server to create an isolated MongoDB instance for tests
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Set required environment variables for tests ──────────────
process.env.JWT_SECRET = 'test-jwt-secret-key-not-for-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

let mongoServer;

/**
 * Start in-memory MongoDB server and connect Mongoose
 * Called once before all tests
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

/**
 * Clear all collections between tests to prevent data leaks
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

/**
 * Disconnect and stop in-memory server after all tests
 */
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

/**
 * Create a test user and return auth token
 * @param {Object} overrides - Override default user fields
 * @returns {Promise<{user: Object, token: string}>}
 */
const createTestUser = async (overrides = {}) => {
  const userData = {
    name: overrides.name || 'Test User',
    email: overrides.email || 'test@example.com',
    password: overrides.password || 'Password123',
    ...overrides,
  };

  const user = await User.create(userData);
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user: user.toJSON(), token };
};

/**
 * Get auth header object for supertest
 * @param {string} token - JWT token
 * @returns {Object} Authorization header object
 */
const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

module.exports = { createTestUser, authHeader };
