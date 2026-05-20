import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';
import { useError } from './ErrorContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const { addError } = useError();

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      const { user: userData, token: authToken } = response.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(authToken);

      return userData;
    } catch (error) {
      addError({
        type: 'error',
        message: error.message || 'Login failed',
        details: error.details,
        status: error.status,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addError]);

  const register = useCallback(async (name, email, password, password_confirmation) => {
    setLoading(true);
    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      const { user: userData, token: authToken } = response.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(authToken);

      return userData;
    } catch (error) {
      addError({
        type: 'error',
        message: error.message || 'Registration failed',
        details: error.details,
        status: error.status,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addError]);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Still logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  }, []);

  // Listen for logout events (e.g., from API interceptor when 401 occurs)
  React.useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};