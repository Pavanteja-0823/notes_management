import { usePremium } from '../context/PremiumContext';
import { FiLock, FiZap, FiAward } from 'react-icons/fi';

/**
 * PremiumGuard - Wraps premium features
 * Free users see a polished lock overlay with upgrade prompt
 * Premium users see the actual content
 */
export default function PremiumGuard({
  children,
  featureName = 'AI Feature',
  showLock = true,
  className = '',
}) {
  const { isPremium, openUpgradeModal } = usePremium();

  if (isPremium) {
    return <>{children}</>;
  }

  if (!showLock) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred children */}
      <div className="blur-[2px] pointer-events-none select-none opacity-30">
        {children}
      </div>

      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-50/40 via-transparent to-transparent dark:from-amber-900/10" />

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={openUpgradeModal}
          className="group relative flex flex-col items-center gap-3 px-8 py-6 rounded-2xl 
            bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
            shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
            border border-amber-200/60 dark:border-amber-700/40
            hover:shadow-[0_12px_40px_rgba(251,191,36,0.2)] dark:hover:shadow-[0_12px_40px_rgba(251,191,36,0.1)]
            transition-all duration-300 ease-out cursor-pointer
            hover:-translate-y-0.5"
        >
          {/* Subtle glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Icon container */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 
              flex items-center justify-center shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30
              group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
              <FiAward size={26} className="text-white drop-shadow-sm" />
            </div>
            {/* Small lock badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-900 dark:bg-gray-100 
              flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800">
              <FiLock size={9} className="text-white dark:text-gray-900" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Premium Feature
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] leading-relaxed">
              {featureName} is available with Premium
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full 
            bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-white text-xs font-bold
            group-hover:from-amber-500 group-hover:to-orange-600 
            shadow-lg shadow-amber-200/40 dark:shadow-amber-900/30
            transition-all duration-200 tracking-wide">
            <FiZap size={13} className="drop-shadow-sm" />
            Upgrade to Unlock
          </span>
        </button>
      </div>
    </div>
  );
}

/**
 * PremiumBadge - Professional premium/lock badge
 * Used on buttons, menu items, and feature cards
 */
export function PremiumBadge({ isPremium = false, size = 'sm' }) {
  const { openUpgradeModal } = usePremium();

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  if (isPremium) {
    return (
      <span className={`inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 
        text-white font-bold shadow-sm shadow-amber-200/30 ${sizeClasses}`}>
        <FiAward size={size === 'sm' ? 10 : 13} className="drop-shadow-sm" />
        PRO
      </span>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openUpgradeModal();
      }}
      className={`inline-flex items-center rounded-full bg-gray-200/80 dark:bg-gray-700/80 
        text-gray-500 dark:text-gray-400
        hover:bg-amber-50 dark:hover:bg-amber-900/20 
        hover:text-amber-600 dark:hover:text-amber-400
        hover:shadow-sm hover:shadow-amber-200/20
        border border-gray-300/60 dark:border-gray-600/60
        hover:border-amber-300/50 dark:hover:border-amber-700/40
        transition-all duration-200 font-medium ${sizeClasses}`}
    >
      <FiLock size={size === 'sm' ? 9 : 11} />
      PRO
    </button>
  );
}
