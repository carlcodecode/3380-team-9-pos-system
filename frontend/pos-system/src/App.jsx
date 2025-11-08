import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { LandingPage } from './components/shared/LandingPage';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // If user is logged in, show appropriate dashboard
  if (user) {
    switch (user.role) {
      case 'customer':
        return <CustomerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'staff':
        return <StaffDashboard />;
      default:
        return <Login onSwitchToRegister={() => setShowRegister(true)} />;
    }
  }

  // No user logged in - show landing, login, or register
  if (showLanding) {
    return (
      <LandingPage
        onLogin={() => {
          setShowLanding(false);
          setShowRegister(false);
        }}
        onRegister={() => {
          setShowLanding(false);
          setShowRegister(true);
        }}
      />
    );
  }

  return showRegister ? (
    <Register 
      onSwitchToLogin={() => setShowRegister(false)}
      onBackToHome={() => setShowLanding(true)}
    />
  ) : (
    <Login 
      onSwitchToRegister={() => setShowRegister(true)}
      onBackToHome={() => setShowLanding(true)}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
        <Toaster position="top-right" richColors />
      </CartProvider>
    </AuthProvider>
  );
}