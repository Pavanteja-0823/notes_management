/**
 * Full page loading spinner component
 * Shown during initial auth check
 */
export default function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-3xl font-bold text-white">N</span>
          </div>
          {/* Spinning ring */}
          <div className="absolute -inset-2 border-2 border-primary-300 dark:border-primary-600 rounded-3xl animate-spin-slow border-t-primary-500" />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Smart Notes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Loading your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
