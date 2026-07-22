import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load user from token on mount
   */
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // If we have stored user data, use it immediately
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Verify token is still valid
        const response = await authApi.getMe();
        const userData = response.data.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (userData) => {
    const response = await authApi.register(userData);
    const resData = response.data?.data || response.data;
    const token = resData?.token;
    const userData_ = resData?.user;

    if (!token || !userData_) {
      throw { message: 'Registration failed. Please check your connection and try again.' };
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData_));
    setUser(userData_);

    return response.data;
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const resData = response.data?.data || response.data;
    const token = resData?.token;
    const userData = resData?.user;

    if (!token || !userData) {
      throw { message: 'Login failed. Please check your connection and try again.' };
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return response.data;
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (data) => {
    const response = await authApi.updateProfile(data);
    const updatedUser = response.data.data.user;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return response.data;
  }, []);

  /**
   * Change password
   */
  const changePassword = useCallback(async (data) => {
    const response = await authApi.changePassword(data);
    return response.data;
  }, []);

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
