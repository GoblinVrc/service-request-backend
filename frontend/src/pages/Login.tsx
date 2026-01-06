import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';
import './Login.css';

const Login: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
      // Redirect will be handled by MSAL
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src="/stryker-logo.png"
            alt="Stryker Logo"
            className="company-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-size="24" fill="%23333">STRYKER</text></svg>';
            }}
          />
          <h1>Service Request Portal</h1>
          <p className="subtitle">ProCare Service Request Management</p>
        </div>

        <div className="login-content">
          <h2>Welcome</h2>
          <p>Please sign in with your Microsoft account to continue</p>

          <button
            className="login-button"
            onClick={handleLogin}
          >
            <svg className="microsoft-icon" viewBox="0 0 23 23">
              <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
              <rect x="12" y="1" width="10" height="10" fill="#00a4ef"/>
              <rect x="1" y="12" width="10" height="10" fill="#7fba00"/>
              <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
            </svg>
            Sign in with Microsoft
          </button>

          <div className="login-info">
            <p className="info-text">
              🔒 Secure authentication via Microsoft Entra ID
            </p>
            <p className="info-text">
              📱 Accessible on mobile and desktop
            </p>
            <p className="info-text">
              🌍 Multi-language support available
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

export default Login;
