import { useState, useEffect, useRef } from 'react';
import {
  FiX, FiZap, FiCheck, FiStar, FiArrowRight, FiAward, FiShield,
  FiGrid, FiLock, FiUnlock,
} from 'react-icons/fi';
import { usePremium } from '../context/PremiumContext';
import { PREMIUM_FEATURES_DATA, FEATURE_CATEGORIES } from '../data/premiumFeatures';
import toast from 'react-hot-toast';

const BENEFITS = [
  { title: '30+ AI Features', desc: 'From summarization to code generation, all in one place.', icon: FiZap },
  { title: 'Save Hours of Work', desc: 'AI does the heavy lifting — you focus on what matters.', icon: FiStar },
  { title: 'Your Data Stays Private', desc: 'All AI processing is secure and your notes remain yours.', icon: FiShield },
  { title: 'Multiple AI Providers', desc: 'Works with Groq, OpenAI, Gemini, Claude, and more.', icon: FiAward },
  { title: 'Access Anywhere', desc: 'Use AI features on desktop, tablet, and mobile.', icon: FiGrid },
  { title: 'Priority Support', desc: 'Get help when you need it with priority response times.', icon: FiStar },
];

export default function UpgradeModal() {
  const { showUpgradeModal, closeUpgradeModal, isPremium, getUsagePercentage, getFeatureUsage } = usePremium();
  const [activeTab, setActiveTab] = useState('features');
  const [isYearly, setIsYearly] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCards, setVisibleCards] = useState([]);
  const cardsRef = useRef(null);

  useEffect(() => {
    if (!showUpgradeModal) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeUpgradeModal(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showUpgradeModal, closeUpgradeModal]);

  // Staggered card entrance animation
  useEffect(() => {
    if (showUpgradeModal && activeTab === 'features') {
      setVisibleCards([]);
      const filtered = activeCategory === 'all'
        ? PREMIUM_FEATURES_DATA
        : PREMIUM_FEATURES_DATA.filter(f => f.category === activeCategory);
      
      filtered.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, 60 * index);
      });
    }
  }, [showUpgradeModal, activeTab, activeCategory]);

  if (!showUpgradeModal) return null;

  const filteredFeatures = activeCategory === 'all'
    ? PREMIUM_FEATURES_DATA
    : PREMIUM_FEATURES_DATA.filter(f => f.category === activeCategory);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && closeUpgradeModal()}
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl 
        bg-white dark:bg-gray-800 animate-scale-in flex flex-col">
        
        {/* Premium Header */}
        <div className="relative px-8 py-6 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FiAward size={26} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-sm">
                  {isPremium ? 'Premium Features' : 'Upgrade to Premium'}
                </h2>
                <p className="text-sm text-white/85">
                  {isPremium 
                    ? 'Your premium features and monthly usage limits'
                    : 'Unlock all 22 AI features for your notes'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={closeUpgradeModal}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Pricing Toggle - only for non-premium users */}
          {!isPremium && (
            <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-6 py-3 rounded-xl text-center transition-all duration-200 ${
                    !isYearly
                      ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-200 dark:ring-amber-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <p className={`text-2xl font-bold ${!isYearly ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    ₹99<span className="text-sm font-normal text-gray-400">/mo</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Billed monthly</p>
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-6 py-3 rounded-xl text-center transition-all duration-200 relative ${
                    isYearly
                      ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-200 dark:ring-amber-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 
                    bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm whitespace-nowrap">
                    BEST VALUE
                  </span>
                  <p className={`text-2xl font-bold ${isYearly ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    ₹899<span className="text-sm font-normal text-gray-400">/yr</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ₹75/mo · <span className="text-green-600 dark:text-green-400 font-medium">Save 24%</span>
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Tab buttons */}
          <div className="px-8 pt-5 pb-3">
            <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'features'
                    ? 'bg-white dark:bg-gray-600 text-amber-700 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiZap size={14} />
                  Features
                </div>
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'benefits'
                    ? 'bg-white dark:bg-gray-600 text-amber-700 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiStar size={14} />
                  Benefits
                </div>
              </button>
            </div>
          </div>

          {activeTab === 'features' ? (
            <div ref={cardsRef} className="px-8 pb-6">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeCategory === 'all'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-700'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Features
                </button>
                {FEATURE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      activeCategory === cat.id
                        ? `${cat.color} ring-1 ring-current`
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Animated Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  const isVisible = visibleCards.includes(index);
                  const usage = getFeatureUsage(feature.id);
                  const usagePct = getUsagePercentage(feature.id);
                  const isUnlimited = feature.limit === Infinity;
                  const cat = FEATURE_CATEGORIES.find(c => c.id === feature.category);

                  return (
                    <div
                      key={feature.id}
                      className={`group relative overflow-hidden rounded-xl border transition-all duration-500 ease-out
                        ${isVisible 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-4'
                        }
                        ${isPremium
                          ? 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700/50'
                          : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700/50'
                        }
                        hover:-translate-y-0.5 cursor-default`}
                      style={{ 
                        transitionDelay: isVisible ? `${index * 60}ms` : '0ms',
                        transitionProperty: 'all',
                      }}
                    >
                      {/* Premium gradient accent line on top */}
                      {isPremium && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
                      )}

                      <div className="p-4">
                        {/* Top row: Icon + Badge */}
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                            ${isPremium 
                              ? 'bg-amber-100 dark:bg-amber-900/30' 
                              : 'bg-gray-100 dark:bg-gray-600'
                            }`}>
                            <Icon size={18} className={isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            {/* Category badge */}
                            {cat && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${cat.color}`}>
                                {cat.id}
                              </span>
                            )}
                            {/* Lock/Unlock badge */}
                            {!isPremium && (
                              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center">
                                <FiLock size={10} className="text-gray-500 dark:text-gray-300" />
                              </div>
                            )}
                            {isPremium && !isUnlimited && (
                              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <FiUnlock size={10} className="text-green-600 dark:text-green-400" />
                              </div>
                            )}
                            {isPremium && isUnlimited && (
                              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <FiAward size={10} className="text-amber-600 dark:text-amber-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Feature name & description */}
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                          {feature.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">
                          {feature.desc}
                        </p>

                        {/* Usage limit display */}
                        <div className="flex items-center justify-between text-xs">
                          {!isPremium ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md 
                              bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 font-medium">
                              <FiLock size={10} />
                              Locked
                            </span>
                          ) : isUnlimited ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md 
                              bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-semibold">
                              <FiAward size={10} />
                              Unlimited
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md 
                              bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                              {usage.used}/{usage.limit}
                              <span className="text-blue-400 dark:text-blue-500">used</span>
                            </span>
                          )}
                          
                          {!isPremium && (
                            <span className="text-gray-400 dark:text-gray-500 font-medium">
                              {feature.limitLabel}
                            </span>
                          )}
                          {isPremium && !isUnlimited && (
                            <span className="text-gray-400 dark:text-gray-500">
                              {feature.limitLabel}
                            </span>
                          )}
                        </div>

                        {/* Usage progress bar (premium only) */}
                        {isPremium && !isUnlimited && usagePct > 0 && (
                          <div className="mt-2.5">
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                  usagePct > 80
                                    ? 'bg-red-400'
                                    : usagePct > 50
                                      ? 'bg-amber-400'
                                      : 'bg-green-400'
                                }`}
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary badge */}
              <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-amber-50/50 to-transparent 
                dark:from-amber-900/5 dark:to-transparent border border-amber-100/50 dark:border-amber-800/20
                flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {filteredFeatures.length} features · {
                    filteredFeatures.filter(f => f.limit === Infinity).length
                  } unlimited
                </span>
                {!isPremium && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    All locked · Upgrade to unlock
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Benefits Tab */
            <div className="px-8 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BENEFITS.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={benefit.title}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/80 dark:bg-gray-700/20 
                        border border-gray-100 dark:border-gray-700/30
                        hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-300
                        animate-slide-up"
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/60 
                        dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{benefit.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CTA Footer */}
        {!isPremium && (
          <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/30 shrink-0">
            <button
              onClick={() => toast.success('Premium upgrade coming soon! 🚀')}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white tracking-wide
                bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 
                hover:from-amber-600 hover:to-orange-600
                shadow-lg shadow-amber-200/40 dark:shadow-amber-900/20
                hover:shadow-xl hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30
                transition-all duration-200 flex items-center justify-center gap-2.5
                active:scale-[0.98]"
            >
              <FiAward size={16} />
              Upgrade Now — {isYearly ? '₹899/year' : '₹99/month'}
              <FiArrowRight size={16} />
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2.5 flex items-center justify-center gap-1.5">
              <FiShield size={11} />
              Cancel anytime. 30-day money-back guarantee.
            </p>
          </div>
        )}

        {/* Premium footer indicator */}
        {isPremium && (
          <div className="px-8 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-amber-50/30 dark:bg-amber-900/5 shrink-0">
            <p className="text-center text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
              <FiCheck size={12} />
              You're on Premium — enjoy all features
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
