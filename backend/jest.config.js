/**
 * Jest Configuration for Smart Notes Backend
 * Uses mongodb-memory-server for isolated test database
 */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  testMatch: [
    '**/__tests__/*.test.js',
    '**/tests/**/*.test.js',
  ],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/config/',
  ],
  // Force exit after tests complete (cleanup mongodb-memory-server)
  forceExit: true,
  detectOpenHandles: true,
};
