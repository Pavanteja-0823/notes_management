/**
 * Auth Middleware Tests
 * Tests token verification, missing tokens, and token errors
 */
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/User');
const { protect } = require('../../middleware/auth');
const { createTestUser, authHeader } = require('../setup');

describe('Auth Middleware - protect', () => {
  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
  });

  it('should return 401 if no token provided', async () => {
    const req = httpMocks.createRequest({
      headers: {},
    });
    const res = httpMocks.createResponse();

    await protect(req, res, mockNext);

    expect(res.statusCode).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain('No token');
  });

  it('should return 401 if token format is invalid', async () => {
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'InvalidFormat token123',
      },
    });
    const res = httpMocks.createResponse();

    await protect(req, res, mockNext);

    expect(res.statusCode).toBe(401);
  });

  it('should return 401 for invalid token', async () => {
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Bearer invalid-token-here',
      },
    });
    const res = httpMocks.createResponse();

    await protect(req, res, mockNext);

    expect(res.statusCode).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain('Invalid token');
  });

  it('should attach user to request for valid token', async () => {
    const { user, token } = await createTestUser();

    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = httpMocks.createResponse();

    await protect(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user._id.toString()).toBe(user._id.toString());
    expect(req.user.email).toBe(user.email);
  });

  it('should return 401 if user no longer exists', async () => {
    const { token } = await createTestUser();
    
    // Delete the user
    await User.deleteMany({});

    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = httpMocks.createResponse();

    await protect(req, res, mockNext);

    expect(res.statusCode).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain('no longer exists');
  });

  it('should return 401 for deactivated user', async () => {
    const { user, token } = await createTestUser();
    
    // Deactivate user
    await User.findByIdAndUpdate(user._id, { isActive: false });

    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = httpMocks.createResponse();

    await protect(req, res, mockNext);

    expect(res.statusCode).toBe(401);
    const data = JSON.parse(res._getData());
    // The middleware checks deactivated AFTER verifying user exists
    // But since the user exists (just deactivated), it should reach the check
    expect(data.message).toMatch(/deactivated|Invalid/i);
  });

  it('should return 401 for expired token', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString() },
      process.env.JWT_SECRET || 'test-jwt-secret-key-not-for-production',
      { expiresIn: '0s' }
    );

    // Wait a moment for token to expire
    await new Promise(resolve => setTimeout(resolve, 100));

    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${expiredToken}`,
      },
    });
    const res = httpMocks.createResponse();

    await protect(req, res, mockNext);

    expect(res.statusCode).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.code).toBe('TOKEN_EXPIRED');
  });
});
