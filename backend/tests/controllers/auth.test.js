/**
 * Auth Controller Tests
 * Tests: register, login, getMe, updateProfile, changePassword
 */
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const { createTestUser, authHeader } = require('../setup');

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('New User');
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.token).toBeDefined();
      // Password should not be returned
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should fail with existing email', async () => {
      await User.create({
        name: 'Existing',
        email: 'existing@example.com',
        password: 'Password123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another',
          email: 'existing@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should fail without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'not-an-email',
          password: 'Password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword1',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail without email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail for deactivated account', async () => {
      await User.findOneAndUpdate({ email: 'login@example.com' }, { isActive: false });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('deactivated');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/auth/me')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update profile name', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/auth/profile')
        .set(authHeader(token))
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
    });

    it('should update preferences', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/auth/profile')
        .set(authHeader(token))
        .send({
          preferences: {
            theme: 'dark',
            defaultNoteColor: '#fbbc04',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.preferences.theme).toBe('dark');
      expect(res.body.data.user.preferences.defaultNoteColor).toBe('#fbbc04');
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'No Auth' });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/password', () => {
    it('should change password with correct current password', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/auth/password')
        .set(authHeader(token))
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPass456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with incorrect current password', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/auth/password')
        .set(authHeader(token))
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPass456',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('incorrect');
    });

    it('should fail with weak new password', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/auth/password')
        .set(authHeader(token))
        .send({
          currentPassword: 'Password123',
          newPassword: '123',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/auth/account', () => {
    it('should deactivate account', async () => {
      const { token, user } = await createTestUser();

      const res = await request(app)
        .delete('/api/auth/account')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify user is deactivated
      const deactivatedUser = await User.findById(user._id);
      expect(deactivatedUser.isActive).toBe(false);
    });
  });
});
