import React, { useState, useEffect } from 'react';
import './AddressEditModal.css';

interface AddressEditModalProps {
  isVisible: boolean;
  currentAddress: string;
  onClose: () => void;
  onSave: (newAddress: {
    address: string;
    city: string;
    zip: string;
    country: string;
  }) => void;
}

const AddressEditModal: React.FC<AddressEditModalProps> = ({
  isVisible,
  currentAddress,
  onClose,
  onSave,
}) => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (currentAddress) {
      // Try to parse the current address
      setAddress(currentAddress);
    }
  }, [currentAddress]);

  const handleSave = () => {
    if (!address || !city || !country) {
      alert('Please fill in at least Address, City, and Country');
      return;
    }

    onSave({
      address,
      city,
      zip,
      country,
    });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-address" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-address">
          <h2>Edit Ship-To Address</h2>
          <button onClick={onClose} className="btn-close-modal">✕</button>
        </div>

        <div className="modal-body-address">
          <div className="form-group">
            <label>Street Address *</label>
            <input
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="form-group">
              <label>Postal/Zip Code</label>
              <input
                type="text"
                className="form-control"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="12345"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country *</label>
              <input
                type="text"
                className="form-control"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer-address">
          <button onClick={onClose} className="btn-modal-cancel">Cancel</button>
          <button onClick={handleSave} className="btn-modal-save">Save Address</button>
        </div>
      </div>
    </div>
  );
};

export default AddressEditModal;
