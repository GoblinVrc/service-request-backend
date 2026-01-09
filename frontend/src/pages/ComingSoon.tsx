import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ComingSoon.css';

const ComingSoon: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the type from URL or state
  const type = new URLSearchParams(location.search).get('type') || 'feature';

  const getIcon = () => {
    switch (type) {
      case 'maintenance':
        return '⚙️';
      case 'installation':
        return '📦';
      default:
        return '🚧';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'maintenance':
        return 'Maintenance Request';
      case 'installation':
        return 'Installation Request';
      default:
        return 'Coming Soon';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'maintenance':
        return 'Preventive maintenance and calibration request form will be available here soon.';
      case 'installation':
        return 'New equipment installation and relocation request form will be available here soon.';
      default:
        return 'This feature is currently under development.';
    }
  };

  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">{getIcon()}</div>
        <h1 className="coming-soon-title">{getTitle()}</h1>
        <p className="coming-soon-description">{getDescription()}</p>
        <p className="coming-soon-note">
          For now, please use the <strong>Repair Request</strong> form for all service needs.
        </p>
        <button
          className="btn-back-to-dashboard"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
