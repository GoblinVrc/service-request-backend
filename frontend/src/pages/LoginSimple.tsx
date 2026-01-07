import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// Simplified login without OAuth - for demo/PoC
const LoginSimple: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);

    // Simple demo authentication - store email in localStorage
    // In production, this would call your backend API
    try {
      // Mock user data based on email domain
      const mockUser = {
        email: email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'ADMIN' : 'CUSTOMER',
        customer_number: 'CUST001',
        territories: ['CA-WEST']
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('isAuthenticated', 'true');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Service Request Portal</h1>
          <p className="subtitle">ProCare Service Request Management</p>
          <p className="demo-note">PoC Demo Version</p>
        </div>

        <div className="login-content">
          <h2>Welcome</h2>
          <p>Please enter your email to continue</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-info">
            <p className="info-text">
              📋 Demo credentials - use any email
            </p>
            <p className="info-text">
              🔹 admin@stryker.com → Admin access
            </p>
            <p className="info-text">
              🔹 user@company.com → Customer access
            </p>
          </div>
        </div>

        <div className="login-footer">
          <p>
            Need help? <a href="/help">Contact Support</a>
          </p>
          <p className="copyright">
            © 2025 Stryker Corporation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSimple;
