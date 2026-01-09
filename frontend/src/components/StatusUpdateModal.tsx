import React, { useState } from 'react';
import './StatusUpdateModal.css';

interface StatusUpdateModalProps {
  isVisible: boolean;
  currentStatus: string;
  onClose: () => void;
  onUpdateStatus: (newStatus: string) => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isVisible,
  currentStatus,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = [
    { value: 'Open', label: 'Open', color: '#1565c0' },
    { value: 'Received', label: 'Received', color: '#5e35b1' },
    { value: 'Repair Completed', label: 'Repair Completed', color: '#00897b' },
    { value: 'Shipped Back', label: 'Shipped Back', color: '#6a1b9a' },
    { value: 'Closed', label: 'Closed', color: '#616161' },
  ];

  const handleUpdate = () => {
    onUpdateStatus(selectedStatus);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="status-modal-overlay" onClick={onClose}>
      <div className="status-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="status-modal-header">
          <h2>Update Status</h2>
          <button onClick={onClose} className="status-modal-close">✕</button>
        </div>

        <div className="status-modal-body">
          <p className="status-modal-description">
            Select a new status for this request:
          </p>

          <div className="status-options-list">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className={`status-option ${
                  selectedStatus === option.value ? 'selected' : ''
                }`}
                onClick={() => setSelectedStatus(option.value)}
              >
                <div className="status-option-radio">
                  {selectedStatus === option.value && (
                    <div className="status-option-radio-dot"></div>
                  )}
                </div>
                <div className="status-option-label">{option.label}</div>
                {selectedStatus === option.value && (
                  <div className="status-option-checkmark">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="status-modal-footer">
          <button onClick={onClose} className="status-modal-btn-cancel">
            Cancel
          </button>
          <button onClick={handleUpdate} className="status-modal-btn-update">
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
