import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiArrowLeft,
  FiSun,
  FiMoon,
  FiDroplet,
  FiTrash2,
  FiLogOut,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi';
import authApi from '../api/authApi';

const NOTE_COLORS = [
  { value: '#ffffff', label: 'White' },
  { value: '#f28b82', label: 'Red' },
  { value: '#fbbc04', label: 'Yellow' },
  { value: '#fff475', label: 'Light Yellow' },
  { value: '#ccff90', label: 'Green' },
  { value: '#a7ffeb', label: 'Teal' },
  { value: '#cbf0f8', label: 'Blue' },
  { value: '#aecbfa', label: 'Light Blue' },
  { value: '#d7aefb', label: 'Purple' },
  { value: '#fdcfe8', label: 'Pink' },
];

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // ─── Profile Info State ────────────────────────────────────────
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // ─── Password State ────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ─── Preferences State ─────────────────────────────────────────
  const [defaultColor, setDefaultColor] = useState(
    user?.preferences?.defaultNoteColor || '#ffffff'
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  // ─── Delete Account State ──────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // ─── Handle Profile Save ───────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Handle Password Change ────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // ─── Handle Preferences Save ───────────────────────────────────
  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await updateProfile({
        preferences: {
          theme: isDark ? 'dark' : 'light',
          defaultNoteColor: defaultColor,
        },
      });
      toast.success('Preferences saved');
    } catch (error) {
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  // ─── Handle Delete Account ─────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await authApi.deleteAccount();
      toast.success('Account deactivated');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  // ─── Handle Logout ─────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              title="Back to dashboard"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Profile & Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your account and preferences
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400
              bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <FiLogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ─── Profile Info Card ────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FiUser className="text-primary-600 dark:text-primary-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profile Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your display name and contact details
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="input pl-10 w-full bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary flex items-center gap-2"
            >
              {savingProfile ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave size={16} />
              )}
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ─── Password Card ────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FiLock className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Keep your account secure
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              {showPasswordForm ? 'Cancel' : 'Change password'}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input w-full"
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input w-full"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input w-full"
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-primary flex items-center gap-2"
              >
                {changingPassword ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSave size={16} />
                )}
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        {/* ─── Preferences Card ─────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiSun className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Preferences
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize your experience
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <FiMoon className="text-indigo-500" size={20} />
                ) : (
                  <FiSun className="text-amber-500" size={20} />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </p>
                  <p className="text-xs text-gray-400">
                    {isDark ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  isDark ? 'bg-primary-500' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={isDark}
                aria-label="Toggle theme"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                    isDark ? 'left-[26px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Default Note Color */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiDroplet size={16} className="text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Note Color
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {NOTE_COLORS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDefaultColor(value)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                      defaultColor === value
                        ? 'border-primary-500 scale-110 ring-2 ring-primary-200 dark:ring-primary-800'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: value }}
                    title={label}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={savingPrefs}
              className="btn-primary flex items-center gap-2"
            >
              {savingPrefs ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave size={16} />
              )}
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* ─── Danger Zone ──────────────────────────────────────── */}
        <div className="card p-6 border-2 border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiAlertTriangle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Irreversible actions for your account
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400
                bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <FiTrash2 size={16} />
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4 animate-slide-up p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    This action cannot be undone!
                  </p>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                    Your account and all associated data will be permanently deactivated.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-1.5">
                  Type <span className="font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="input w-full bg-white dark:bg-gray-800 border-red-300 dark:border-red-700
                    focus:border-red-500 focus:ring-red-500"
                  placeholder="Type DELETE to confirm"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                    bg-red-600 rounded-xl hover:bg-red-700 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 size={16} />
                  Deactivate Account
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400
                    bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiX size={16} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-6">
          Memora v1.0 &middot; All your data is securely stored
        </p>
      </div>
    </div>
  );
}
