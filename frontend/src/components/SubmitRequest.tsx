import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/apiConfig';
import { SubmitResponse } from '../types';
import './SubmitRequest.css';

interface SubmitRequestProps {
  onSubmit: () => void;
  onCancel: () => void;
}

interface Item {
  item_number: string;
  item_description: string;
  serial_number?: string;
  product_family?: string;
}

const SubmitRequest: React.FC<SubmitRequestProps> = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Item
    item_number: '',
    serial_number: '',
    item_description: '',
    product_family: '',

    // Step 2: Issue type
    main_reason: '',
    sub_reason: '',

    // Step 3: Details
    issue_description: '',
    contact_phone: '',
    urgency_level: 'Normal',
    loaner_required: false,
    requested_service_date: '',

    // Contact (from localStorage)
    contact_name: '',
    contact_email: '',
  });

  // Search/autocomplete
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  // Issue reasons
  const [issueReasons, setIssueReasons] = useState<Record<string, string[]>>({});
  const [availableSubReasons, setAvailableSubReasons] = useState<string[]>([]);

  useEffect(() => {
    loadUserData();
    loadIssueReasons();
  }, []);

  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData(prev => ({
        ...prev,
        contact_name: user.name || '',
        contact_email: user.email || '',
      }));
    }
  };

  const loadIssueReasons = async () => {
    try {
      const reasons = await apiService.get<Record<string, string[]>>(
        API_ENDPOINTS.ISSUE_REASONS,
        { language_code: 'en' }
      );
      setIssueReasons(reasons);
    } catch (error) {
      console.error('Failed to load issue reasons, using dummy data:', error);
      // Fallback: Dummy data
      setIssueReasons({
        'Equipment Malfunction': ['Equipment Not Responding', 'Display Issue', 'Mechanical Failure', 'Error Messages'],
        'Preventive Maintenance': ['Scheduled Maintenance Due', 'Calibration Required', 'Software Update'],
        'Installation Required': [],
        'Other': [],
      });
    }
  };

  const handleItemSearch = async (searchTerm: string) => {
    setItemSearchTerm(searchTerm);

    if (searchTerm.length < 2) {
      setFilteredItems([]);
      setShowItemDropdown(false);
      return;
    }

    try {
      // Try API first, fall back to dummy data
      try {
        const serialResults = await apiService.get<any[]>(
          API_ENDPOINTS.LOOKUP_SERIAL,
          { q: searchTerm }
        );

        const itemResults = await apiService.get<any[]>(
          API_ENDPOINTS.LOOKUP_ITEM,
          { q: searchTerm }
        );

        const combined = [...serialResults, ...itemResults];
        if (combined.length > 0) {
          setFilteredItems(combined);
          setShowItemDropdown(true);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using dummy data');
      }

      // Fallback: Dummy data for demo
      const dummyItems: Item[] = [
        { item_number: 'ITEM-SUR-001', serial_number: 'SN-2024-001', item_description: 'Advanced Surgical System Model X200', product_family: 'Surgical Systems' },
        { item_number: 'ITEM-SUR-002', serial_number: 'SN-2024-002', item_description: 'Minimally Invasive Surgical Tower', product_family: 'Surgical Systems' },
        { item_number: 'ITEM-DIA-001', serial_number: 'SN-2024-006', item_description: 'Ultrasound System ProView 5000', product_family: 'Diagnostic Imaging' },
        { item_number: 'ITEM-DIA-002', serial_number: 'SN-2024-007', item_description: 'Portable X-Ray Unit Mobile Max', product_family: 'Diagnostic Imaging' },
        { item_number: 'ITEM-MON-001', serial_number: 'SN-2024-011', item_description: 'Vital Signs Monitor ProLife 800', product_family: 'Patient Monitoring' },
        { item_number: 'ITEM-MON-002', serial_number: 'SN-2024-012', item_description: 'ECG Machine CardioView 12-Lead', product_family: 'Patient Monitoring' },
        { item_number: 'ITEM-LAB-001', serial_number: 'SN-2024-016', item_description: 'Blood Analyzer Hema-Pro 500', product_family: 'Laboratory' },
        { item_number: 'ITEM-STE-001', serial_number: 'SN-2024-021', item_description: 'Autoclave Steam Sterilizer 500L', product_family: 'Sterilization' },
      ];

      const searchLower = searchTerm.toLowerCase();
      const filtered = dummyItems.filter(item =>
        (item.serial_number && item.serial_number.toLowerCase().includes(searchLower)) ||
        item.item_number.toLowerCase().includes(searchLower) ||
        item.item_description.toLowerCase().includes(searchLower)
      );

      setFilteredItems(filtered);
      setShowItemDropdown(filtered.length > 0);
    } catch (error) {
      console.error('Failed to search items:', error);
    }
  };

  const handleSelectItem = (item: Item) => {
    setFormData(prev => ({
      ...prev,
      item_number: item.item_number,
      serial_number: item.serial_number || '',
      item_description: item.item_description,
      product_family: item.product_family || '',
    }));
    setItemSearchTerm(item.serial_number || item.item_number);
    setShowItemDropdown(false);
    setValidationMessage('');
  };

  const handleMainReasonChange = (mainReason: string) => {
    setFormData(prev => ({
      ...prev,
      main_reason: mainReason,
      sub_reason: '',
    }));
    setAvailableSubReasons(issueReasons[mainReason] || []);
  };

  const validateStep = () => {
    setValidationMessage('');

    if (currentStep === 1) {
      if (!formData.item_number && !formData.serial_number) {
        setValidationMessage('Please select an item');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.main_reason) {
        setValidationMessage('Please select an issue type');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.issue_description || formData.issue_description.trim().length < 10) {
        setValidationMessage('Please provide a detailed description (at least 10 characters)');
        return false;
      }
      if (!formData.contact_phone) {
        setValidationMessage('Please provide a contact phone number');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setValidationMessage('');
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const submitData = {
        request_type: formData.serial_number ? 'Serial' : 'Item',
        country_code: 'US',
        language_code: 'en',
        customer_number: user?.customer_number || 'GUEST',
        customer_name: user?.name || 'Guest Customer',
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        serial_number: formData.serial_number || undefined,
        item_number: formData.item_number || undefined,
        item_description: formData.item_description,
        product_family: formData.product_family,
        main_reason: formData.main_reason,
        sub_reason: formData.sub_reason || undefined,
        issue_description: formData.issue_description,
        urgency_level: formData.urgency_level,
        loaner_required: formData.loaner_required,
        requested_service_date: formData.requested_service_date || undefined,
        submitted_by_email: formData.contact_email,
        submitted_by_name: formData.contact_name,
      };

      const response = (await apiService.post(API_ENDPOINTS.SUBMIT_REQUEST, submitData)) as SubmitResponse;

      alert(`Request submitted successfully!\nRequest Code: ${response.request_code}\n\n${response.next_steps}`);
      onSubmit();
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      setValidationMessage(error.response?.data?.detail || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>Step 1: Select Item</h3>
      <p className="step-desc">Search for the item by serial number or item number</p>

      <div className="form-field">
        <label>Search Item *</label>
        <div className="autocomplete-wrapper">
          <input
            type="text"
            value={itemSearchTerm}
            onChange={(e) => handleItemSearch(e.target.value)}
            onFocus={() => filteredItems.length > 0 && setShowItemDropdown(true)}
            placeholder="Enter serial number or item number..."
            className="form-input"
          />

          {showItemDropdown && filteredItems.length > 0 && (
            <div className="autocomplete-results">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="autocomplete-result-item"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="item-info">
                    {item.serial_number && <span className="item-badge">SN: {item.serial_number}</span>}
                    <span className="item-badge">Item: {item.item_number}</span>
                  </div>
                  <div className="item-desc">{item.item_description}</div>
                  {item.product_family && <div className="item-family">{item.product_family}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {formData.item_number && (
        <div className="selected-item">
          <h4>Selected Item</h4>
          <div className="item-details">
            {formData.serial_number && <p><strong>Serial Number:</strong> {formData.serial_number}</p>}
            <p><strong>Item Number:</strong> {formData.item_number}</p>
            <p><strong>Description:</strong> {formData.item_description}</p>
            {formData.product_family && <p><strong>Product Family:</strong> {formData.product_family}</p>}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Step 2: Issue Type</h3>
      <p className="step-desc">Select the type of issue you're experiencing</p>

      <div className="form-field">
        <label>Main Issue Type *</label>
        <select
          value={formData.main_reason}
          onChange={(e) => handleMainReasonChange(e.target.value)}
          className="form-input"
        >
          <option value="">Select main issue type...</option>
          {Object.keys(issueReasons).map(reason => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </div>

      {availableSubReasons.length > 0 && (
        <div className="form-field">
          <label>Sub-Issue Type</label>
          <select
            value={formData.sub_reason}
            onChange={(e) => setFormData(prev => ({ ...prev, sub_reason: e.target.value }))}
            className="form-input"
          >
            <option value="">Select sub-issue type (optional)...</option>
            {availableSubReasons.map(subReason => (
              <option key={subReason} value={subReason}>{subReason}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>Step 3: Additional Details</h3>
      <p className="step-desc">Provide more information about your service request</p>

      <div className="form-field">
        <label>Issue Description *</label>
        <textarea
          value={formData.issue_description}
          onChange={(e) => setFormData(prev => ({ ...prev, issue_description: e.target.value }))}
          placeholder="Please describe the issue in detail..."
          rows={5}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Contact Phone *</label>
          <input
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
            placeholder="e.g., +1-555-123-4567"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label>Urgency Level *</label>
          <select
            value={formData.urgency_level}
            onChange={(e) => setFormData(prev => ({ ...prev, urgency_level: e.target.value }))}
            className="form-input"
          >
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="form-field">
        <label>Requested Service Date</label>
        <input
          type="date"
          value={formData.requested_service_date}
          onChange={(e) => setFormData(prev => ({ ...prev, requested_service_date: e.target.value }))}
          className="form-input"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="form-field">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={formData.loaner_required}
            onChange={(e) => setFormData(prev => ({ ...prev, loaner_required: e.target.checked }))}
          />
          <span>Loaner equipment required</span>
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3>Step 4: Review & Submit</h3>
      <p className="step-desc">Please review your information before submitting</p>

      <div className="review-section">
        <h4>Item Information</h4>
        <div className="review-content">
          {formData.serial_number && <p><strong>Serial Number:</strong> {formData.serial_number}</p>}
          <p><strong>Item Number:</strong> {formData.item_number}</p>
          <p><strong>Description:</strong> {formData.item_description}</p>
          {formData.product_family && <p><strong>Product Family:</strong> {formData.product_family}</p>}
        </div>
      </div>

      <div className="review-section">
        <h4>Issue Details</h4>
        <div className="review-content">
          <p><strong>Main Issue:</strong> {formData.main_reason}</p>
          {formData.sub_reason && <p><strong>Sub-Issue:</strong> {formData.sub_reason}</p>}
          <p><strong>Description:</strong> {formData.issue_description}</p>
          <p><strong>Urgency:</strong> <span className={`urgency-badge urgency-${formData.urgency_level.toLowerCase()}`}>{formData.urgency_level}</span></p>
          {formData.loaner_required && <p><strong>Loaner Required:</strong> Yes</p>}
        </div>
      </div>

      <div className="review-section">
        <h4>Contact Information</h4>
        <div className="review-content">
          <p><strong>Name:</strong> {formData.contact_name}</p>
          <p><strong>Email:</strong> {formData.contact_email}</p>
          <p><strong>Phone:</strong> {formData.contact_phone}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="submit-request">
      <div className="submit-header">
        <div>
          <h1>New Service Request</h1>
          <p>Fill in the details below to create a new service request</p>
        </div>
        <button onClick={onCancel} className="btn-close">✕</button>
      </div>

      {/* Step indicator */}
      <div className="step-progress">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
            <div className="step-circle">{step}</div>
            <div className="step-title">
              {step === 1 && 'Item'}
              {step === 2 && 'Issue Type'}
              {step === 3 && 'Details'}
              {step === 4 && 'Review'}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleFinalSubmit} className="submit-form">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {validationMessage && (
          <div className="validation-error">
            {validationMessage}
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>

          <div className="nav-buttons">
            {currentStep > 1 && (
              <button type="button" onClick={handleBack} className="btn-back" disabled={loading}>
                ← Back
              </button>
            )}

            {currentStep < 4 ? (
              <button type="button" onClick={handleNext} className="btn-next">
                Next →
              </button>
            ) : (
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitRequest;
