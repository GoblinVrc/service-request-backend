import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/apiConfig';
import { SubmitResponse } from '../types';
import './NewRequestForm.css';

interface Item {
  item_number: string;
  item_description: string;
  serial_number?: string;
  product_family?: string;
}

interface IssueType {
  main_reason: string;
  sub_reasons: string[];
}

interface NewRequestFormProps {
  onBackToDashboard?: () => void;
}

const NewRequestForm: React.FC<NewRequestFormProps> = ({ onBackToDashboard }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Item selection
    item_number: '',
    serial_number: '',
    item_description: '',
    product_family: '',

    // Step 2: Issue type
    main_reason: '',
    sub_reason: '',

    // Step 3: Additional details
    issue_description: '',
    urgency_level: 'Normal',
    loaner_required: false,
    requested_service_date: '',

    // Contact info (from localStorage)
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  // Available items for autocomplete
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');

  // Issue types
  const [issueReasons, setIssueReasons] = useState<Record<string, string[]>>({});
  const [availableSubReasons, setAvailableSubReasons] = useState<string[]>([]);

  // Validation messages
  const [validationMessage, setValidationMessage] = useState('');

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
      console.error('Failed to load issue reasons:', error);
    }
  };

  // Step 1: Item search with autocomplete
  const handleItemSearch = async (searchTerm: string) => {
    setItemSearchTerm(searchTerm);

    if (searchTerm.length < 2) {
      setFilteredItems([]);
      setShowItemDropdown(false);
      return;
    }

    try {
      // Search by serial number or item number
      const serialResults = await apiService.get<any[]>(
        API_ENDPOINTS.LOOKUP_SERIAL,
        { q: searchTerm }
      );

      const itemResults = await apiService.get<any[]>(
        API_ENDPOINTS.LOOKUP_ITEM,
        { q: searchTerm }
      );

      const combined = [...serialResults, ...itemResults];
      setFilteredItems(combined);
      setShowItemDropdown(combined.length > 0);
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

  // Step 2: Issue type selection
  const handleMainReasonChange = (mainReason: string) => {
    setFormData(prev => ({
      ...prev,
      main_reason: mainReason,
      sub_reason: '', // Reset sub reason when main reason changes
    }));
    setAvailableSubReasons(issueReasons[mainReason] || []);
  };

  // Validation
  const validateStep = () => {
    setValidationMessage('');

    if (currentStep === 1) {
      if (!formData.item_number && !formData.serial_number) {
        setValidationMessage('Please select an item or enter item details');
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

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const submitData = {
        request_type: formData.serial_number ? 'Serial' : 'Item',
        country_code: 'US', // Default for now
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

      if (onBackToDashboard) {
        onBackToDashboard();
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      setValidationMessage(error.response?.data?.detail || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map(step => (
        <div
          key={step}
          className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
        >
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Item'}
            {step === 2 && 'Issue Type'}
            {step === 3 && 'Details'}
            {step === 4 && 'Review'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h2>Step 1: Select Item</h2>
      <p className="step-description">Search for the item by serial number or item number</p>

      <div className="form-field">
        <label>Search Item *</label>
        <div className="autocomplete-container">
          <input
            type="text"
            value={itemSearchTerm}
            onChange={(e) => handleItemSearch(e.target.value)}
            onFocus={() => filteredItems.length > 0 && setShowItemDropdown(true)}
            placeholder="Enter serial number or item number..."
            className="form-input"
          />

          {showItemDropdown && filteredItems.length > 0 && (
            <div className="autocomplete-dropdown">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="autocomplete-item"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="item-code">
                    {item.serial_number && <span className="badge">SN: {item.serial_number}</span>}
                    <span className="badge">Item: {item.item_number}</span>
                  </div>
                  <div className="item-description">{item.item_description}</div>
                  {item.product_family && (
                    <div className="item-family">{item.product_family}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {formData.item_number && (
        <div className="selected-item-info">
          <h3>Selected Item</h3>
          <div className="info-grid">
            {formData.serial_number && (
              <div className="info-item">
                <label>Serial Number:</label>
                <span>{formData.serial_number}</span>
              </div>
            )}
            <div className="info-item">
              <label>Item Number:</label>
              <span>{formData.item_number}</span>
            </div>
            <div className="info-item">
              <label>Description:</label>
              <span>{formData.item_description}</span>
            </div>
            {formData.product_family && (
              <div className="info-item">
                <label>Product Family:</label>
                <span>{formData.product_family}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2>Step 2: Issue Type</h2>
      <p className="step-description">Select the type of issue you're experiencing</p>

      <div className="form-field">
        <label>Main Issue Type *</label>
        <select
          value={formData.main_reason}
          onChange={(e) => handleMainReasonChange(e.target.value)}
          className="form-select"
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
            className="form-select"
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
      <h2>Step 3: Additional Details</h2>
      <p className="step-description">Provide more information about your service request</p>

      <div className="form-field">
        <label>Issue Description *</label>
        <textarea
          value={formData.issue_description}
          onChange={(e) => setFormData(prev => ({ ...prev, issue_description: e.target.value }))}
          placeholder="Please describe the issue in detail..."
          rows={6}
          className="form-textarea"
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
            className="form-select"
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
        <label className="checkbox-label">
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
      <h2>Step 4: Review & Submit</h2>
      <p className="step-description">Please review your information before submitting</p>

      <div className="review-section">
        <h3>Item Information</h3>
        <div className="review-grid">
          {formData.serial_number && (
            <div className="review-item">
              <label>Serial Number:</label>
              <span>{formData.serial_number}</span>
            </div>
          )}
          <div className="review-item">
            <label>Item Number:</label>
            <span>{formData.item_number}</span>
          </div>
          <div className="review-item">
            <label>Description:</label>
            <span>{formData.item_description}</span>
          </div>
          {formData.product_family && (
            <div className="review-item">
              <label>Product Family:</label>
              <span>{formData.product_family}</span>
            </div>
          )}
        </div>
      </div>

      <div className="review-section">
        <h3>Issue Details</h3>
        <div className="review-grid">
          <div className="review-item">
            <label>Main Issue:</label>
            <span>{formData.main_reason}</span>
          </div>
          {formData.sub_reason && (
            <div className="review-item">
              <label>Sub-Issue:</label>
              <span>{formData.sub_reason}</span>
            </div>
          )}
          <div className="review-item full-width">
            <label>Description:</label>
            <span>{formData.issue_description}</span>
          </div>
          <div className="review-item">
            <label>Urgency:</label>
            <span className={`urgency-badge urgency-${formData.urgency_level.toLowerCase()}`}>
              {formData.urgency_level}
            </span>
          </div>
          {formData.loaner_required && (
            <div className="review-item">
              <label>Loaner Required:</label>
              <span>Yes</span>
            </div>
          )}
        </div>
      </div>

      <div className="review-section">
        <h3>Contact Information</h3>
        <div className="review-grid">
          <div className="review-item">
            <label>Name:</label>
            <span>{formData.contact_name}</span>
          </div>
          <div className="review-item">
            <label>Email:</label>
            <span>{formData.contact_email}</span>
          </div>
          <div className="review-item">
            <label>Phone:</label>
            <span>{formData.contact_phone}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="new-request-container">
      <div className="form-header">
        <button
          onClick={() => onBackToDashboard ? onBackToDashboard() : navigate('/dashboard')}
          className="btn-back"
        >
          ← Back to Dashboard
        </button>
        <h1>New Service Request</h1>
      </div>

      {renderStepIndicator()}

      <div className="form-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {validationMessage && (
          <div className="validation-message error">
            {validationMessage}
          </div>
        )}

        <div className="form-actions">
          {currentStep > 1 && (
            <button onClick={handleBack} className="btn-secondary" disabled={loading}>
              Back
            </button>
          )}

          {currentStep < 4 ? (
            <button onClick={handleNext} className="btn-primary">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewRequestForm;
