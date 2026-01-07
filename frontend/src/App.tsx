import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './config/authConfig';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewRequestForm from './pages/NewRequestForm';
import './App.css';

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <div className="App">
          <UnauthenticatedTemplate>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </UnauthenticatedTemplate>

          <AuthenticatedTemplate>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/request/new" element={<NewRequestForm />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthenticatedTemplate>
        </div>
      </Router>
    </MsalProvider>
  );
}

export default App;
