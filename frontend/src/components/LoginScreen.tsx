import React, { useState } from 'react';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/apiConfig';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.post(API_ENDPOINTS.LOGIN, {
        email,
        password
      });

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response));

      setIsLoading(false);
      onLogin();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      {/* Hero Background Image */}
      <div className="hero-background">
        <div className="hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&q=80"
          alt="Technician at work"
          className="hero-image"
        />
      </div>

      {/* Transparent Header */}
      <header className="login-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-text">STRYKER</div>
            <div className="logo-subtitle">Service Request Portal</div>
          </div>
        </div>
      </header>

      {/* Login Form Overlay */}
      <div className="login-overlay">
        <div className="login-card">
          <div className="login-card-header">
            <h1>Welcome Back</h1>
            <p>Sign in to manage service requests</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="login-hint">
              <small>Demo users: admin@stryker.com / admin, sales@stryker.com / sales, customer@company.com / customer</small>
            </div>

            <div className="login-footer">
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">🔧</div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock assistance</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Fast Response</h3>
            <p>Quick turnaround times</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Real-time status updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
