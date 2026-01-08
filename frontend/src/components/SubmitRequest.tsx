import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/apiConfig';
import { SubmitResponse } from '../types';
import LoadingModal from './LoadingModal';
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
  instance_count?: number;
}

const SubmitRequest: React.FC<SubmitRequestProps> = ({ onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form data
  const [formData, setFormData] = useState({
    // Customer (for sales/tech/admin)
    customer_number: '',
    customer_name: '',

    // Item
    item_number: '',
    serial_number: '',
    item_description: '',
    product_family: '',

    // Issue type
    main_reason: '',
    sub_reason: '',

    // Details
    issue_description: '',
    contact_phone: '',
    urgency_level: 'Normal' as 'Normal' | 'Urgent' | 'Critical',
    loaner_required: false,
    quote_required: false,
    requested_service_date: '',

    // Contact (from localStorage)
    contact_name: '',
    contact_email: '',
  });

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Customer search (for sales/tech/admin)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Item search/autocomplete
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

  const shouldShowCustomerSearch = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      const role = user.role;
      return role === 'Admin' || role === 'SalesTech';
    } catch {
      return false;
    }
  };

  const loadIssueReasons = async () => {
    try {
      const reasons = await apiService.get<Record<string, string[]>>(
        API_ENDPOINTS.ISSUE_REASONS,
        { language: 'en' }
      );
      setIssueReasons(reasons);
    } catch (error) {
      console.error('Failed to load issue reasons:', error);
    }
  };

  // Customer search handler
  const handleCustomerSearch = async (searchTerm: string) => {
    setCustomerSearchTerm(searchTerm);

    if (searchTerm.length < 2) {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    try {
      const results = await apiService.get<any[]>(
        API_ENDPOINTS.SEARCH_CUSTOMERS,
        { query: searchTerm }
      );
      setFilteredCustomers(results);
      setShowCustomerDropdown(results.length > 0);
    } catch (error) {
      console.error('Failed to search customers:', error);
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectCustomer = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customer_number: customer.customer_number,
      customer_name: customer.customer_name,
    }));
    setCustomerSearchTerm(customer.customer_name);
    setShowCustomerDropdown(false);
  };

  // Item search handler
  const handleItemSearch = async (searchTerm: string) => {
    setItemSearchTerm(searchTerm);

    if (searchTerm.length < 2) {
      setFilteredItems([]);
      setShowItemDropdown(false);
      return;
    }

    try {
      const results = await apiService.get<Item[]>(
        API_ENDPOINTS.LOOKUP_ITEM,
        { q: searchTerm }
      );
      setFilteredItems(results);
      setShowItemDropdown(results.length > 0);
    } catch (error) {
      console.error('Failed to search items:', error);
      setFilteredItems([]);
      setShowItemDropdown(false);
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
    setItemSearchTerm(`${item.item_number} - ${item.item_description}`);
    setShowItemDropdown(false);
  };

  const handleMainReasonChange = (mainReason: string) => {
    setFormData(prev => ({
      ...prev,
      main_reason: mainReason,
      sub_reason: '', // Reset sub reason
    }));
    setAvailableSubReasons(issueReasons[mainReason] || []);
  };

  // Step validation
  const validateStep1 = (): boolean => {
    setValidationMessage('');

    // For Admin/SalesTech, require customer selection
    if (shouldShowCustomerSearch() && !formData.customer_number) {
      setValidationMessage('Please select a customer');
      return false;
    }

    if (!formData.item_number && !formData.serial_number) {
      setValidationMessage('Please select an item');
      return false;
    }

    if (!formData.main_reason) {
      setValidationMessage('Please select an issue type');
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    setValidationMessage('');

    if (!formData.contact_name) {
      setValidationMessage('Please provide a point of contact name');
      return false;
    }

    if (!formData.contact_phone) {
      setValidationMessage('Please provide a contact phone number');
      return false;
    }

    if (!formData.issue_description || formData.issue_description.trim().length < 10) {
      setValidationMessage('Please provide a detailed description (at least 10 characters)');
      return false;
    }

    return true;
  };

  const validateStep3 = (): boolean => {
    // File upload is optional
    return true;
  };

  // Navigation handlers
  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setValidationMessage('');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Final submission
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      // Use selected customer if admin/sales chose one, otherwise use logged-in user's customer
      const customerNumber = formData.customer_number || user?.customer_number || 'GUEST';
      const customerName = formData.customer_name || user?.customer_name || 'Guest Customer';

      const submitData = {
        request_type: formData.serial_number ? 'Serial' : 'Item',
        country_code: 'US',
        language_code: 'en',
        customer_number: customerNumber,
        customer_name: customerName,
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
        quote_required: formData.quote_required,
        requested_service_date: formData.requested_service_date || undefined,
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

  // Render progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      { number: 1, label: 'Basic Info' },
      { number: 2, label: 'Details' },
      { number: 3, label: 'Attachments' },
      { number: 4, label: 'Review' },
    ];

    return (
      <div className="progress-indicator">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}>
              <div className="step-number">{step.number}</div>
              <div className="step-label">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`progress-line ${currentStep > step.number ? 'active' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render Step 1: Basic Information
  const renderStep1 = () => {
    return (
      <div className="form-step">
        <h2 className="step-title">Basic Information</h2>

        <div className={shouldShowCustomerSearch() ? "step-1-columns" : ""}>
          {/* Customer Search (for Admin/SalesTech only) */}
          {shouldShowCustomerSearch() && (
            <div className="form-section">
              <h3>Customer</h3>
            <div className="form-field">
              <label>Search Customer *</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  onFocus={() => filteredCustomers.length > 0 && setShowCustomerDropdown(true)}
                  placeholder="Enter customer name or number..."
                  className="form-input"
                />

                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="autocomplete-results">
                    {filteredCustomers.map((customer, index) => (
                      <div
                        key={index}
                        className="autocomplete-result-item"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="item-info">
                          <span className="item-badge">Customer: {customer.customer_number}</span>
                          <span className="item-badge">Territory: {customer.territory_code}</span>
                        </div>
                        <div className="item-desc">{customer.customer_name}</div>
                        <div className="item-family">{customer.city}, {customer.country_code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {formData.customer_number && (
              <div className="selected-item">
                <h4>Selected Customer</h4>
                <div className="item-details">
                  <p><strong>Customer Number:</strong> {formData.customer_number}</p>
                  <p><strong>Customer Name:</strong> {formData.customer_name}</p>
                </div>
              </div>
            )}
            </div>
          )}

          {/* Item Selection */}
        <div className="form-section">
          <h3>Item Information</h3>
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
                        <span className="item-badge">Item: {item.item_number}</span>
                        {item.serial_number && <span className="item-badge">Serial: {item.serial_number}</span>}
                      </div>
                      <div className="item-desc">{item.item_description}</div>
                      <div className="item-family">{item.product_family}</div>
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
                <p><strong>Item Number:</strong> {formData.item_number}</p>
                <p><strong>Description:</strong> {formData.item_description}</p>
                {formData.product_family && <p><strong>Product Family:</strong> {formData.product_family}</p>}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Issue Type */}
        <div className="form-section">
          <h3>Issue Type</h3>
          <div className="form-field">
            <label>Main Issue Type *</label>
            <select
              value={formData.main_reason}
              onChange={(e) => handleMainReasonChange(e.target.value)}
              className="form-input"
            >
              <option value="">Select main issue type...</option>
              {Object.keys(issueReasons).map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {availableSubReasons.length > 0 && (
            <div className="form-field">
              <label>Sub Issue Type</label>
              <select
                value={formData.sub_reason}
                onChange={(e) => setFormData(prev => ({ ...prev, sub_reason: e.target.value }))}
                className="form-input"
              >
                <option value="">Select sub issue type...</option>
                {availableSubReasons.map((subReason) => (
                  <option key={subReason} value={subReason}>
                    {subReason}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Step 2: Additional Details
  const renderStep2 = () => {
    return (
      <div className="form-step">
        <h2 className="step-title">Additional Details</h2>

        {/* Point of Contact & Urgency */}
        <div className="form-section">
          <h3>Point of Contact & Urgency</h3>
          <div className="poc-columns">
            <div className="form-field">
              <label>Name *</label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                placeholder="Contact person name"
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="+1 234 567 8900"
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label>Urgency Level *</label>
              <select
                value={formData.urgency_level}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency_level: e.target.value as any }))}
                className="form-input"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <h3>Issue Description</h3>
          <div className="form-field">
            <label>Additional Comments *</label>
            <textarea
              value={formData.issue_description}
              onChange={(e) => setFormData(prev => ({ ...prev, issue_description: e.target.value }))}
              placeholder="Provide detailed information about the issue..."
              rows={6}
              className="form-input"
            />
          </div>
        </div>

        {/* Loaner/Quote Toggle Cards */}
        <div className="form-section">
          <h3>Service Options</h3>
          <div className="toggle-cards">
            <div
              className={`toggle-card ${formData.loaner_required ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, loaner_required: !prev.loaner_required }))}
            >
              <div className="toggle-icon">{formData.loaner_required ? '✓' : ''}</div>
              <div className="toggle-label">Loaner Required</div>
            </div>
            <div
              className={`toggle-card ${formData.quote_required ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, quote_required: !prev.quote_required }))}
            >
              <div className="toggle-icon">{formData.quote_required ? '✓' : ''}</div>
              <div className="toggle-label">Quote Required</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Step 3: File Upload
  const renderStep3 = () => {
    return (
      <div className="form-step">
        <h2 className="step-title">Attachments</h2>

        <div className="form-section">
          <h3>Upload Supporting Documents</h3>
          <p className="section-description">Add photos, PDFs, or other relevant files (optional)</p>

          <div className="form-field">
            <label htmlFor="file-upload" className="file-upload-label">
              <span className="upload-icon">📎</span>
              <span>Choose Files</span>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="file-input-hidden"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-list">
              <h4>Uploaded Files ({uploadedFiles.length})</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="uploaded-file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="btn-remove-file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Step 4: Summary & Review
  const renderStep4 = () => {
    return (
      <div className="form-step">
        <h2 className="step-title">Review & Submit</h2>

        <div className="summary-section">
          {shouldShowCustomerSearch() && formData.customer_number && (
            <div className="summary-block">
              <h3>Customer Information</h3>
              <div className="summary-content">
                <p><strong>Customer:</strong> {formData.customer_name} ({formData.customer_number})</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-edit-section"
              >
                Edit
              </button>
            </div>
          )}

          <div className="summary-block">
            <h3>Item Information</h3>
            <div className="summary-content">
              <p><strong>Item Number:</strong> {formData.item_number}</p>
              <p><strong>Description:</strong> {formData.item_description}</p>
              {formData.serial_number && <p><strong>Serial Number:</strong> {formData.serial_number}</p>}
              {formData.product_family && <p><strong>Product Family:</strong> {formData.product_family}</p>}
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-edit-section"
            >
              Edit
            </button>
          </div>

          <div className="summary-block">
            <h3>Issue Type</h3>
            <div className="summary-content">
              <p><strong>Main Issue:</strong> {formData.main_reason}</p>
              {formData.sub_reason && <p><strong>Sub Issue:</strong> {formData.sub_reason}</p>}
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-edit-section"
            >
              Edit
            </button>
          </div>

          <div className="summary-block">
            <h3>Point of Contact</h3>
            <div className="summary-content">
              <p><strong>Name:</strong> {formData.contact_name}</p>
              <p><strong>Phone:</strong> {formData.contact_phone}</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-edit-section"
            >
              Edit
            </button>
          </div>

          <div className="summary-block full-width">
            <h3>Details</h3>
            <div className="summary-content">
              <p><strong>Urgency:</strong> {formData.urgency_level}</p>
              <p><strong>Loaner Required:</strong> {formData.loaner_required ? 'Yes' : 'No'}</p>
              <p><strong>Quote Required:</strong> {formData.quote_required ? 'Yes' : 'No'}</p>
              <p><strong>Additional Comments:</strong></p>
              <p className="summary-description">{formData.issue_description}</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-edit-section"
            >
              Edit
            </button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="summary-block">
              <h3>Attachments</h3>
              <div className="summary-content">
                <p><strong>{uploadedFiles.length} file(s) attached</strong></p>
                <ul className="summary-files-list">
                  {uploadedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-edit-section"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <LoadingModal isVisible={loading} message="Submitting request..." />
      <div className="submit-request">
        <div className="submit-header">
          <div>
            <h1>New Service Request</h1>
            <p>Fill in the details below to create a new service request</p>
          </div>
          <button onClick={onCancel} className="btn-close">✕</button>
        </div>

        {/* Progress Indicator */}
        {renderProgressIndicator()}

        {/* Form Steps */}
        <div className="form-container">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Validation Message */}
          {validationMessage && (
            <div className="validation-error">
              {validationMessage}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            <button
              type="button"
              onClick={handleBack}
              className="btn-navigation btn-back"
              disabled={currentStep === 1}
            >
              ← Back
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-navigation btn-next"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="btn-navigation btn-submit"
              >
                Submit Request
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitRequest;
