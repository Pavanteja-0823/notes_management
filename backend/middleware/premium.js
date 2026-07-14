/**
 * Premium Access Middleware
 * Restricts access to premium features for non-premium users
 * Tracks per-feature monthly usage limits
 */

/** Feature usage limits */
const FEATURE_LIMITS = {
  summarize: 500,
  rewrite: 300,
  'continue-writing': 300,
  'grammar-check': 500,
  'improve-writing': 300,
  translate: 300,
  explain: 300,
  'smart-tags': Infinity,
  'smart-search': Infinity,
  flashcards: 200,
  quiz: 200,
  'mind-map': 100,
  'meeting-notes': 150,
  'action-items': 200,
  chat: Infinity,
  'pdf-summarizer': 200,
  ocr: 200,
  'voice-to-notes': 600,
  'email-generator': 200,
  'blog-generator': 100,
  'study-notes': 300,
  'interview-questions': 200,
  'todo-generator': 200,
  'presentation-generator': 100,
  'timeline-generator': 100,
  'table-generator': 200,
  'code-explanation': Infinity,
  'code-generator': 200,
  'daily-recap': Infinity,
  'weekly-insights': Infinity,
};

/**
 * Get the current month key (YYYY-MM)
 */
function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Require premium subscription to access route
 */
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
      code: 'AUTH_REQUIRED',
    });
  }

  if (!req.user.isPremium) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required. Please upgrade to access this feature.',
      code: 'PREMIUM_REQUIRED',
    });
  }

  next();
};

/**
 * Check if user has enough usage credits for a specific feature
 * @param {string} featureId - The feature ID to check
 */
const checkUsageLimit = (featureId) => async (req, res, next) => {
  try {
    const limit = FEATURE_LIMITS[featureId];
    
    // No limit or unlimited feature
    if (limit === undefined || limit === Infinity) {
      return next();
    }

    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const currentMonth = getCurrentMonth();
    
    const usage = user.aiUsage?.[featureId];
    const usageCount = usage?.count || 0;
    const usageMonth = usage?.month || '';

    // Reset count if month changed
    if (usageMonth !== currentMonth) {
      await User.findByIdAndUpdate(req.user._id, {
        [`aiUsage.${featureId}.count`]: 0,
        [`aiUsage.${featureId}.month`]: currentMonth,
      });
    }

    // Check if limit reached
    if (usageCount >= limit && usageMonth === currentMonth) {
      return res.status(429).json({
        success: false,
        message: `Monthly limit reached. You've used ${usageCount}/${limit} this month. Upgrade or wait until next month.`,
        code: 'USAGE_LIMIT_REACHED',
        data: { used: usageCount, limit, featureId },
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Increment usage counter for a feature
 * @param {string} featureId - The feature ID
 * @param {number} credits - Credits to increment (default 1)
 */
const incrementUsage = (featureId, credits = 1) => async (req, res, next) => {
  try {
    const User = require('../models/User');
    const currentMonth = getCurrentMonth();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { [`aiUsage.${featureId}.count`]: credits },
      $set: { [`aiUsage.${featureId}.month`]: currentMonth },
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Get usage data for all features
 */
const getUsageData = async (userId) => {
  const User = require('../models/User');
  const user = await User.findById(userId);
  const currentMonth = getCurrentMonth();
  const usageData = {};

  for (const [featureId, limit] of Object.entries(FEATURE_LIMITS)) {
    const usage = user.aiUsage?.[featureId] || { count: 0, month: '' };
    const count = usage.month === currentMonth ? (usage.count || 0) : 0;
    usageData[featureId] = {
      used: count,
      limit: limit === Infinity ? 'Unlimited' : limit,
      remaining: limit === Infinity ? 'Unlimited' : Math.max(0, limit - count),
    };
  }

  return usageData;
};

module.exports = { 
  requirePremium, 
  checkUsageLimit, 
  incrementUsage, 
  getUsageData,
  FEATURE_LIMITS,
  getCurrentMonth,
};
