/**
 * User Model Tests
 * Validates schema validation, password hashing, and model methods
 */
const mongoose = require('mongoose');
const User = require('../../models/User');
// Must load setup to connect to in-memory MongoDB
require('../setup');

describe('User Model', () => {
  const validUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
  };

  describe('Validation', () => {
    it('should create a valid user', async () => {
      const user = await User.create(validUserData);
      expect(user).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.isActive).toBe(true);
      expect(user.isPremium).toBe(false);
    });

    it('should fail without name', async () => {
      await expect(User.create({ email: 'test@example.com', password: 'Password123' }))
        .rejects
        .toThrow('Name is required');
    });

    it('should fail with short name', async () => {
      await expect(User.create({ ...validUserData, name: 'A' }))
        .rejects
        .toThrow('Name must be at least 2 characters');
    });

    it('should fail without email', async () => {
      await expect(User.create({ name: 'Test', password: 'Password123' }))
        .rejects
        .toThrow('Email is required');
    });

    it('should fail with invalid email', async () => {
      await expect(User.create({ ...validUserData, email: 'not-an-email' }))
        .rejects
        .toThrow('valid email');
    });

    it('should fail with duplicate email', async () => {
      await User.create(validUserData);
      await expect(User.create({ ...validUserData, name: 'Another' }))
        .rejects
        .toThrow(); // 11000 duplicate key error
    });

    it('should fail without password', async () => {
      await expect(User.create({ name: 'Test', email: 'test@example.com' }))
        .rejects
        .toThrow('Password is required');
    });

    it('should fail with short password', async () => {
      await expect(User.create({ ...validUserData, password: 'Ab1' }))
        .rejects
        .toThrow('at least 6 characters');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = await User.create(validUserData);
      // Password field is available after create (not via select:false)
      // Check that it's been hashed (not plaintext)
      expect(user.password).not.toBe('Password123');
      expect(user.password).toContain('$2a$'); // bcrypt hash prefix
    });

    it('should exclude password via toJSON', async () => {
      const user = await User.create(validUserData);
      const json = user.toJSON();
      expect(json.password).toBeUndefined();
    });

    it('should not re-hash password on update without password change', async () => {
      const user = await User.create(validUserData);
      const originalHash = user.password;
      user.name = 'Updated Name';
      await user.save();
      
      const userWithPassword = await User.findById(user._id).select('+password');
      expect(userWithPassword.password).toBe(originalHash);
    });

    it('should compare password correctly', async () => {
      const user = await User.create(validUserData);
      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('Password123');
      expect(isMatch).toBe(true);
    });

    it('should fail comparison with wrong password', async () => {
      const user = await User.create(validUserData);
      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('WrongPassword1');
      expect(isMatch).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should exclude password, __v, and refreshToken', async () => {
      const user = await User.create(validUserData);
      const json = user.toJSON();
      expect(json.password).toBeUndefined();
      expect(json.__v).toBeUndefined();
      expect(json.refreshToken).toBeUndefined();
      expect(json.refreshTokenExpires).toBeUndefined();
      expect(json.name).toBeDefined();
      expect(json.email).toBeDefined();
    });
  });

  describe('Premium Fields', () => {
    it('should create non-premium user by default', async () => {
      const user = await User.create(validUserData);
      expect(user.isPremium).toBe(false);
      expect(user.premiumSince).toBeNull();
    });

    it('should create premium user with premiumSince date', async () => {
      const now = new Date();
      const user = await User.create({
        ...validUserData,
        isPremium: true,
        premiumSince: now,
      });
      expect(user.isPremium).toBe(true);
      expect(user.premiumSince).toEqual(now);
    });

    it('should track per-feature AI usage', async () => {
      const user = await User.create(validUserData);
      expect(user.aiUsage).toBeDefined();
      expect(user.aiUsage.summarize).toEqual({ count: 0, month: '' });
      expect(user.aiUsage['grammar-check']).toEqual({ count: 0, month: '' });
      expect(user.aiUsage['smart-tags']).toEqual({ count: 0, month: '' });
      expect(user.aiUsage.chat).toEqual({ count: 0, month: '' });
    });
  });
});
