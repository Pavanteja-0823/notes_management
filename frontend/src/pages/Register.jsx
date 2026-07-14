import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSun,
  FiMoon,
  FiCheck,
  FiX,
} from 'react-icons/fi';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Password requirements
  const passwordChecks = {
    length: formData.password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    match:
      formData.confirmPassword &&
      formData.password === formData.confirmPassword,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success(result.message || 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequirementCheck = ({ met, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <FiCheck className="text-green-500 shrink-0" size={14} />
      ) : (
        <FiX className="text-gray-400 shrink-0" size={14} />
      )}
      <span className={met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        <div className="w-full max-w-md animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create Account
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Start organizing your notes today
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="input pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className="input pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 space-y-1.5">
                <RequirementCheck met={passwordChecks.length} text="At least 6 characters" />
                <RequirementCheck met={passwordChecks.hasLetter} text="Contains a letter" />
                <RequirementCheck met={passwordChecks.hasNumber} text="Contains a number" />
                <RequirementCheck met={passwordChecks.match} text="Passwords match" />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 text-white text-center p-12">
          <h2 className="text-3xl font-bold mb-6">Join Smart Notes Today</h2>
          <div className="space-y-4 max-w-sm mx-auto">
            {[
              { icon: '🚀', text: 'Get started in seconds' },
              { icon: '📱', text: 'Access from any device' },
              { icon: '🔄', text: 'Auto-save keeps your work safe' },
              { icon: '🎯', text: 'Stay organized and productive' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
