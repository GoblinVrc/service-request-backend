import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSimple from './pages/LoginSimple';
import Dashboard from './pages/Dashboard';
import IntakeForm from './pages/IntakeForm';
import './App.css';

// Simplified App without MSAL for demo/PoC
function AppSimple() {
  // Initialize from localStorage immediately
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    console.log('App-Simple: Initial auth check =', authStatus);
    return authStatus === 'true';
  });

  useEffect(() => {
    // Listen for auth changes
    const handleStorageChange = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      console.log('App-Simple: Storage changed, isAuthenticated =', authStatus);
      setIsAuthenticated(authStatus === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginSimple />} />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intake"
            element={
              <ProtectedRoute>
                <IntakeForm />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default AppSimple;
