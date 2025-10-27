import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for saved session on mount
    const initAuth = async () => {
      const token = api.getToken();
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);

          // Connect to WebSocket for real-time notifications
          api.connectSocket(userData.id);

          // Set up notification listeners
          const cleanupNotification = api.onNotification((notification) => {
            console.log('📢 Received notification:', notification);
            // Handle staff/admin notifications
            if (notification.type === 'INVENTORY_RESTOCK_NEEDED') {
              toast.warning(`Low stock alert: ${notification.data.meal_name || 'Unknown meal'} (${notification.data.quantity_in_stock} remaining)`);
            } else if (notification.type === 'ALERT_RESOLVED') {
              toast.success('Alert resolved');
            }
          });

          const cleanupOrderNotification = api.onOrderNotification((notification) => {
            console.log('📦 Received order notification:', notification);
            // Handle customer order notifications
            if (notification.type === 'ORDER_SHIPPED') {
              toast.success('Your order has been shipped! 🎉');
            } else if (notification.type === 'ORDER_DELIVERED') {
              toast.success('Your order has been delivered! ✅');
            } else if (notification.type === 'ORDER_TRACKING_ASSIGNED') {
              toast.info('Tracking number assigned to your order');
            }
          });

          // Store cleanup functions for later cleanup
          window.notificationCleanup = cleanupNotification;
          window.orderNotificationCleanup = cleanupOrderNotification;

        } catch (err) {
          console.error('Auth init error:', err);
          api.removeToken();
        }
      }

      setLoading(false);
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      if (window.notificationCleanup) window.notificationCleanup();
      if (window.orderNotificationCleanup) window.orderNotificationCleanup();
      api.disconnectSocket();
    };
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const data = await api.register(userData);
      
      // Save token and user to localStorage (same as login)
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await api.login(credentials);

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      // Cleanup WebSocket connections
      if (window.notificationCleanup) window.notificationCleanup();
      if (window.orderNotificationCleanup) window.orderNotificationCleanup();
      api.disconnectSocket();

      setUser(null);
      setError(null);
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};