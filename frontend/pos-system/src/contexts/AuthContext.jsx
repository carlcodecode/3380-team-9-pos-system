import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../lib/mockData';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('bentoUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username, password) => {
    // Mock authentication - in production, this would call an API
    const foundUser = mockUsers.find(u => u.username === username);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('bentoUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bentoUser');
  };

  const register = (userData, password) => {
    // Mock registration
    const newUser = {
      id: String(mockUsers.length + 1),
      username: userData.username || '',
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      role: userData.role || 'customer',
      status: 'active',
      ...(userData.role === 'customer' && {
        loyaltyPoints: 0,
        totalSpent: 0,
        address: userData.address || '',
      }),
    };

    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('bentoUser', JSON.stringify(newUser));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
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