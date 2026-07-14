/**
 * Premium Middleware Tests
 * Tests: requirePremium, checkUsageLimit, incrementUsage, getUsageData
 */
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const {
  requirePremium,
  checkUsageLimit,
  incrementUsage,
  getUsageData,
  FEATURE_LIMITS,
  getCurrentMonth,
} = require('../../middleware/premium');
const { createTestUser, createTestPremiumUser, authHeader } = require('../setup');

describe('Premium Middleware', () => {
  describe('requirePremium', () => {
    it('should allow premium users through', async () => {
      const { user } = await createTestPremiumUser();
      const req = { user: { _id: user._id, isPremium: true } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await requirePremium(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should block non-premium users with 403', async () => {
      const { user } = await createTestUser();
      const req = { user: { _id: user._id, isPremium: false } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await requirePremium(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'PREMIUM_REQUIRED' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if no user', async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await requirePremium(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'AUTH_REQUIRED' })
      );
    });
  });

  describe('checkUsageLimit', () => {
    it('should allow unlimited features to pass through', async () => {
      const { user } = await createTestPremiumUser();
      const req = { user: { _id: user._id } };
      const res = {};
      const next = jest.fn();

      const middleware = checkUsageLimit('chat'); // Infinity limit
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should allow requests within limit', async () => {
      const { user } = await createTestPremiumUser();
      const req = { user: { _id: user._id } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = checkUsageLimit('summarize');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should block requests exceeding limit', async () => {
      const { user } = await createTestPremiumUser();
      const currentMonth = getCurrentMonth();
      
      // Set usage to exceed limit
      await User.findByIdAndUpdate(user._id, {
        'aiUsage.summarize.count': FEATURE_LIMITS.summarize,
        'aiUsage.summarize.month': currentMonth,
      });

      const req = { user: { _id: user._id } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = checkUsageLimit('summarize');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'USAGE_LIMIT_REACHED' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reset count when month changes', async () => {
      const { user } = await createTestPremiumUser();
      const oldMonth = '2023-01'; // Different month
      
      await User.findByIdAndUpdate(user._id, {
        'aiUsage.summarize.count': FEATURE_LIMITS.summarize,
        'aiUsage.summarize.month': oldMonth,
      });

      const req = { user: { _id: user._id } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = checkUsageLimit('summarize');
      await middleware(req, res, next);

      // Should pass through because month changed (auto-reset)
      expect(next).toHaveBeenCalled();
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage counter', async () => {
      const { user } = await createTestPremiumUser();
      const req = { user: { _id: user._id } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = incrementUsage('summarize');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.aiUsage.summarize.count).toBe(1);
      expect(updatedUser.aiUsage.summarize.month).toBe(getCurrentMonth());
    });

    it('should increment by custom credit amount', async () => {
      const { user } = await createTestPremiumUser();
      const req = { user: { _id: user._id } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = incrementUsage('summarize', 5);
      await middleware(req, res, next);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.aiUsage.summarize.count).toBe(5);
    });
  });

  describe('getUsageData', () => {
    it('should return usage data for all features', async () => {
      const { user } = await createTestPremiumUser();
      const currentMonth = getCurrentMonth();

      // Set some usage
      await User.findByIdAndUpdate(user._id, {
        'aiUsage.summarize.count': 10,
        'aiUsage.summarize.month': currentMonth,
        'aiUsage.chat.count': 5,
        'aiUsage.chat.month': currentMonth,
      });

      const usageData = await getUsageData(user._id);

      expect(usageData.summarize).toBeDefined();
      expect(usageData.summarize.used).toBe(10);
      expect(usageData.summarize.limit).toBe(FEATURE_LIMITS.summarize);

      expect(usageData.chat).toBeDefined();
      expect(usageData.chat.limit).toBe('Unlimited');
      expect(usageData.chat.remaining).toBe('Unlimited');
    });

    it('should return zero usage for new month', async () => {
      const { user } = await createTestPremiumUser();
      // Set usage with old month
      await User.findByIdAndUpdate(user._id, {
        'aiUsage.summarize.count': 50,
        'aiUsage.summarize.month': '2023-01',
      });

      const usageData = await getUsageData(user._id);
      expect(usageData.summarize.used).toBe(0);
    });
  });

  describe('Premium API integration', () => {
    it('should return premium status for authenticated user', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/ai/premium-status')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.isPremium).toBe(false);
      expect(res.body.data.aiUsage).toBeDefined();
    });

    it('should prevent non-premium user from accessing premium features', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/ai/summarize')
        .set(authHeader(token))
        .send({ text: 'Test text' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('PREMIUM_REQUIRED');
    });

    it('should allow premium user to access premium features', async () => {
      const { token } = await createTestPremiumUser();

      const res = await request(app)
        .post('/api/ai/summarize')
        .set(authHeader(token))
        .send({ text: 'Test text for summarization' });

      // The AI call might fail (no Groq key in test env), but should not be blocked by premium
      expect(res.status).not.toBe(403);
    });
  });
});
