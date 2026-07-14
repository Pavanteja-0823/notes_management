import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import aiApi from '../api/aiApi';
import PREMIUM_FEATURES_DATA from '../data/premiumFeatures';

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumData, setPremiumData] = useState(null);
  const [featureUsage, setFeatureUsage] = useState({});
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fetchPremiumStatus = useCallback(async () => {
    try {
      const response = await aiApi.checkPremiumStatus();
      const data = response.data.data;
      setIsPremium(data.isPremium);
      setPremiumData(data);
      setFeatureUsage(data.aiUsage || {});
    } catch (error) {
      setIsPremium(false);
      setPremiumData(null);
      setFeatureUsage({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPremiumStatus();
  }, [fetchPremiumStatus]);

  /**
   * Check if user can access a premium feature
   * If not premium, shows upgrade modal
   * @returns {boolean} Whether user can proceed
   */
  const requirePremium = useCallback(() => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  }, [isPremium]);

  /**
   * Get usage info for a specific feature
   * @param {string} featureId - The feature ID
   * @returns {{ used: number, limit: number|string, remaining: number|string }}
   */
  const getFeatureUsage = useCallback((featureId) => {
    const usage = featureUsage[featureId];
    if (!usage) {
      const feature = PREMIUM_FEATURES_DATA.find(f => f.id === featureId);
      return { used: 0, limit: feature?.limit || 0, remaining: feature?.limit || 0 };
    }
    return usage;
  }, [featureUsage]);

  /**
   * Get usage progress percentage for a feature
   * @param {string} featureId
   * @returns {number} 0-100 percentage
   */
  const getUsagePercentage = useCallback((featureId) => {
    const usage = getFeatureUsage(featureId);
    if (usage.limit === 'Unlimited' || usage.limit === Infinity) return 0;
    return Math.min(100, Math.round((usage.used / usage.limit) * 100));
  }, [getFeatureUsage]);

  const openUpgradeModal = useCallback(() => setShowUpgradeModal(true), []);
  const closeUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);

  const value = {
    isPremium,
    premiumData,
    featureUsage,
    loading,
    showUpgradeModal,
    requirePremium,
    openUpgradeModal,
    closeUpgradeModal,
    getFeatureUsage,
    getUsagePercentage,
    refreshStatus: fetchPremiumStatus,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
