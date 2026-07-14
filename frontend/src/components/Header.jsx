import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiSearch,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiBell,
} from 'react-icons/fi';

export default function Header({ searchQuery, onSearchChange }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700/50 
                rounded-xl text-sm text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                border border-transparent focus:border-primary-500
                focus:ring-1 focus:ring-primary-500
                transition-all duration-200 outline-none"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 
              dark:hover:bg-gray-700 transition-all"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Notifications placeholder */}
          <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 
            dark:hover:bg-gray-700 transition-all relative">
            <FiBell size={18} />
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl 
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'User'}
              </span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 card py-1 shadow-lg z-50 animate-scale-in">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm 
                    text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <FiUser size={16} />
                  Profile
                </button>

                <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm 
                      text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiLogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
