import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://192.168.105.202:3001/api";   // <======= แก้ตรงนี้

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults and sync with localStorage
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // const response = await axios.get('http://localhost:3001/api/auth/verify');
          const response = await axios.get(`${API_BASE}/auth/verify`);
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    try {
      // const response = await axios.post('http://localhost:3001/api/auth/login', {
      // await axios.post(`${API_BASE}/auth/login`, {
      const response = await axios.post(`${API_BASE}/auth/login`, {
    username,
    password
});


      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // await axios.post('http://localhost:3001/api/auth/logout');
        // await axios.post(`${API_BASE}/auth/logout`);
        await axios.post(`${API_BASE}/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
