import React, { useState } from 'react';
import './Login.css';

// Add missing CSS class
const styles = `
  .demo-note {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
  }
  .form-group {
    margin-bottom: 20px;
    text-align: left;
  }
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }
  .form-control {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
  }
  .form-control:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  .error-message {
    background: #ffebee;
    color: #c62828;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 14px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Simplified login without OAuth - for demo/PoC
const LoginSimple: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Login attempt with email:', email);

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

      console.log('Setting user in localStorage:', mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('isAuthenticated', 'true');

      console.log('Navigating to dashboard...');
      // Small delay to ensure localStorage is set
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
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
