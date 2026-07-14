import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* Error illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center">
            <span className="text-6xl font-bold text-primary-500 dark:text-primary-400">404</span>
          </div>
          {/* Decorative dots */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary-300 dark:bg-primary-600 animate-pulse" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-amber-300 dark:bg-amber-600 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiHome size={16} />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FiArrowLeft size={16} />
            Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Try these instead:
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link
              to="/dashboard"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              My Notes
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link
              to="/profile"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Profile & Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
