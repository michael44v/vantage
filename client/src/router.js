import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TradingTerminal from './pages/TradingTerminal';
import CopyTrading from './pages/CopyTrading';
import Wallet from './pages/Wallet';
import KYC from './pages/KYC';
import AdminDashboard from './pages/AdminDashboard';

const AppRouter = () => {
  const isAuthenticated = () => !!localStorage.getItem('token');
  const isAdmin = () => JSON.parse(localStorage.getItem('user'))?.role === 'admin';

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    return isAuthenticated() && isAdmin() ? children : <Navigate to="/dashboard" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/terminal" element={<PrivateRoute><TradingTerminal /></PrivateRoute>} />
        <Route path="/copy-trading" element={<PrivateRoute><CopyTrading /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/kyc" element={<PrivateRoute><KYC /></PrivateRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
