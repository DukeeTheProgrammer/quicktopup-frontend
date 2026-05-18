import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AirtimePage from './pages/services/AirtimePage';
import DataPage from './pages/services/DataPage';
import CablePage from './pages/services/CablePage';
import ElectricityPage from './pages/services/ElectricityPage';
import WalletPage from './pages/wallet/WalletPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage from './pages/profile/ProfilePage';
import Layout from './components/Layout';
import CustomerSupport from './components/CustomerSupport';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Landing — visible to everyone */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth — only for unauthenticated users */}
      <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"       element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

      {/* App — require login */}
      <Route path="/dashboard"    element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
      <Route path="/airtime"      element={<PrivateRoute><Layout><AirtimePage /></Layout></PrivateRoute>} />
      <Route path="/data"         element={<PrivateRoute><Layout><DataPage /></Layout></PrivateRoute>} />
      <Route path="/cable"        element={<PrivateRoute><Layout><CablePage /></Layout></PrivateRoute>} />
      <Route path="/electricity"  element={<PrivateRoute><Layout><ElectricityPage /></Layout></PrivateRoute>} />
      <Route path="/wallet"       element={<PrivateRoute><Layout><WalletPage /></Layout></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><Layout><TransactionsPage /></Layout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Layout><NotificationsPage /></Layout></PrivateRoute>} />
      <Route path="/profile"      element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <AppRoutes />
        {/* Customer support widget — global overlay, works on every page */}
        <CustomerSupport />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
