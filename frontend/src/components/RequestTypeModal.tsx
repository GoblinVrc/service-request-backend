import React from 'react';
import './RequestTypeModal.css';

interface RequestTypeModalProps {
  isVisible: boolean;
  onSelectType: (type: 'repair' | 'maintenance' | 'installation') => void;
}

const RequestTypeModal: React.FC<RequestTypeModalProps> = ({
  isVisible,
  onSelectType,
}) => {
  if (!isVisible) return null;

  return (
    <div className="request-type-modal-overlay">
      <div className="request-type-modal-content">
        <h2>Select Request Type</h2>
        <p className="request-type-subtitle">Choose the type of service you need</p>

        <div className="request-type-grid">
          <button
            className="request-type-card repair"
            onClick={() => onSelectType('repair')}
          >
            <div className="request-type-icon">🔧</div>
            <h3>Repair</h3>
            <p>Equipment malfunction or repair needed</p>
          </button>

          <button
            className="request-type-card maintenance"
            onClick={() => onSelectType('maintenance')}
          >
            <div className="request-type-icon">⚙️</div>
            <h3>Maintenance</h3>
            <p>Preventive maintenance or calibration</p>
          </button>

          <button
            className="request-type-card installation"
            onClick={() => onSelectType('installation')}
          >
            <div className="request-type-icon">📦</div>
            <h3>Installation</h3>
            <p>New equipment setup or relocation</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestTypeModal;
