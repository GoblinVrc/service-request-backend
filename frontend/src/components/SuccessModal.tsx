import React, { useEffect } from 'react';
import './SuccessModal.css';

interface SuccessModalProps {
  isVisible: boolean;
  requestCode: string;
  nextSteps: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isVisible, requestCode, nextSteps, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <div className="success-icon">✓</div>
        <h2>Request Submitted Successfully!</h2>
        <div className="success-content">
          <p className="request-code">
            <strong>Request Code:</strong> {requestCode}
          </p>
          <p className="next-steps">{nextSteps}</p>
        </div>
        <button onClick={onClose} className="btn-close-success">
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
