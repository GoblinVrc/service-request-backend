import React from 'react';
import './LoadingModal.css';

interface LoadingModalProps {
  isVisible: boolean;
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
