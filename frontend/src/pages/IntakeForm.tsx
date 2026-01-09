import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/apiConfig';
import {
  Country,
  Language,
  ServiceRequestCreate,
  ValidationResponse,
  SubmitResponse,
} from '../types';
import AddressEditModal from '../components/AddressEditModal';
import './IntakeForm.css';

// Multi-step form for service request intake (UR-048)
const IntakeForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [issueReasons, setIssueReasons] = useState<Record<string, string[]>>({});
  const [validationMessage, setValidationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form data (UR-037: Mandatory and optional fields)
  const [formData, setFormData] = useState<Partial<ServiceRequestCreate>>({
    request_type: 'Serial', // Default to Serial (primary input - UR-034)
    country_code: '',
    language_code: 'en',
    contact_email: '',
    contact_name: '',
    contact_phone: '',
    main_reason: '',
    urgency_level: 'Normal',
    loaner_required: false,
    quote_required: false,
  });

  // Auto-filled data from validation (UR-038)
  const [autoFilledData, setAutoFilledData] = useState<any>(null);

  // Address editing modal state
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.country_code) {
      loadCountryLanguages(formData.country_code);
    }
  }, [formData.country_code]);

  useEffect(() => {
    if (formData.language_code) {
      loadIssueReasons(formData.language_code);
    }
  }, [formData.language_code]);

  const loadInitialData = async () => {
    try {
      const countriesData = await apiService.get<Country[]>(
        API_ENDPOINTS.COUNTRIES
      );
      setCountries(countriesData);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const loadCountryLanguages = async (countryCode: string) => {
    try {
      const languagesData = await apiService.get<Language[]>(
        API_ENDPOINTS.COUNTRY_LANGUAGES(countryCode)
      );
      setLanguages(languagesData);
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const loadIssueReasons = async (languageCode: string) => {
    try {
      const params = { language_code: languageCode };
      const reasons = await apiService.get<Record<string, string[]>>(
        API_ENDPOINTS.ISSUE_REASONS,
        params
      );
      setIssueReasons(reasons);
    } catch (error) {
      console.error('Failed to load issue reasons:', error);
    }
  };

  // Validate item when serial/item number is entered (UR-032, UR-033, UR-035)
  const handleValidateItem = async () => {
    if (!formData.serial_number && !formData.item_number) {
      setValidationMessage('Please enter Serial Number or Item Number');
      return;
    }

    if (!formData.country_code) {
      setValidationMessage('Please select country first');
      return;
    }

    try {
      const response = await apiService.post<ValidationResponse>(
        API_ENDPOINTS.VALIDATE_ITEM,
        {
          serial_number: formData.serial_number,
          item_number: formData.item_number,
          country_code: formData.country_code,
        }
      );

      if (response.valid && response.item) {
        // Auto-fill fields (UR-038)
        setAutoFilledData(response.item);
        setFormData({
          ...formData,
          item_description: response.item.ItemDescription,
          product_family: response.item.ProductFamily,
          lot_number: response.item.LotNumber,
        });
        setValidationMessage('✓ Item validated successfully');
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        setValidationMessage(
          `❌ ${error.response.data.error || 'Item not eligible for service'}`
        );
      } else if (error.response?.status === 404) {
        setValidationMessage('❌ Item not found in system');
      } else {
        setValidationMessage('❌ Validation failed');
      }
    }
  };

  const handleInputChange = (
    field: keyof ServiceRequestCreate,
    value: any
  ) => {
    setFormData({ ...formData, [field]: value });
    setValidationMessage('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Country and language selection
        return !!(formData.country_code && formData.language_code);
      case 2:
        // Request type and item identification
        if (formData.request_type === 'Serial') {
          return !!formData.serial_number;
        } else if (formData.request_type === 'Item') {
          return !!formData.item_number;
        } else if (formData.request_type === 'General') {
          // General requests require manual entry (UR-039)
          return !!(formData.item_description && formData.customer_name);
        }
        return false;
      case 3:
        // Contact information (UR-037: Mandatory fields)
        return !!(
          formData.contact_email &&
          formData.contact_name &&
          formData.contact_phone
        );
      case 4:
        // Issue description (UR-040)
        return !!formData.main_reason;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setValidationMessage('Please fill in all required fields');
      return;
    }
    setCurrentStep(currentStep + 1);
    setValidationMessage('');
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setValidationMessage('');
  };

  const handleAddressSave = (newAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => {
    setFormData({
      ...formData,
      ship_to_address: newAddress.address,
      ship_to_city: newAddress.city,
      ship_to_state: newAddress.state,
      ship_to_postal_code: newAddress.postalCode,
      ship_to_country: newAddress.country,
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setValidationMessage('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiService.post<SubmitResponse>(
        API_ENDPOINTS.SUBMIT_REQUEST,
        formData
      );

      // Success - show confirmation (UR-045)
      alert(
        `✓ ${response.message}\n\nRequest Code: ${response.request_code}\n\n${response.next_steps}`
      );
      navigate('/dashboard');
    } catch (error: any) {
      setValidationMessage(
        `❌ ${error.response?.data?.detail || 'Submission failed'}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="intake-container">
      <div className="intake-card">
        <h1>Service Request Intake Form</h1>
        <p className="form-subtitle">ProCare Service Request</p>

        {/* Progress Steps (UR-048) */}
        <div className="steps-indicator">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`step ${
                currentStep === step
                  ? 'active'
                  : currentStep > step
                  ? 'completed'
                  : ''
              }`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Country & Language'}
                {step === 2 && 'Item Identification'}
                {step === 3 && 'Contact Information'}
                {step === 4 && 'Issue Description'}
                {step === 5 && 'Review & Submit'}
              </div>
            </div>
          ))}
        </div>

        <div className="form-content">
          {/* Step 1: Country & Language Selection (UR-029, UR-030) */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Select Country and Language</h2>

              <div className="form-group">
                <label>Country *</label>
                <select
                  value={formData.country_code}
                  onChange={(e) =>
                    handleInputChange('country_code', e.target.value)
                  }
                  className="form-control"
                >
                  <option value="">-- Select Country --</option>
                  {countries.map((country) => (
                    <option key={country.country_code} value={country.country_code}>
                      {country.country_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Language *</label>
                <select
                  value={formData.language_code}
                  onChange={(e) =>
                    handleInputChange('language_code', e.target.value)
                  }
                  className="form-control"
                  disabled={!formData.country_code}
                >
                  <option value="">-- Select Language --</option>
                  {languages.map((lang) => (
                    <option key={lang.language_code} value={lang.language_code}>
                      {lang.language_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Item Identification (UR-034, UR-036) */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>Item Identification</h2>

              <div className="form-group">
                <label>Request Type *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="Serial"
                      checked={formData.request_type === 'Serial'}
                      onChange={(e) =>
                        handleInputChange('request_type', e.target.value)
                      }
                    />
                    Serial Number (Primary)
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="Item"
                      checked={formData.request_type === 'Item'}
                      onChange={(e) =>
                        handleInputChange('request_type', e.target.value)
                      }
                    />
                    Item Number (Secondary)
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="General"
                      checked={formData.request_type === 'General'}
                      onChange={(e) =>
                        handleInputChange('request_type', e.target.value)
                      }
                    />
                    General Request
                  </label>
                </div>
              </div>

              {formData.request_type === 'Serial' && (
                <div className="form-group">
                  <label>Serial Number *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.serial_number || ''}
                      onChange={(e) =>
                        handleInputChange('serial_number', e.target.value)
                      }
                      placeholder="Enter serial number"
                    />
                    <button
                      type="button"
                      className="btn-validate"
                      onClick={handleValidateItem}
                    >
                      Validate
                    </button>
                  </div>
                </div>
              )}

              {formData.request_type === 'Item' && (
                <div className="form-group">
                  <label>Item Number *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.item_number || ''}
                      onChange={(e) =>
                        handleInputChange('item_number', e.target.value)
                      }
                      placeholder="Enter item number"
                    />
                    <button
                      type="button"
                      className="btn-validate"
                      onClick={handleValidateItem}
                    >
                      Validate
                    </button>
                  </div>
                </div>
              )}

              {formData.request_type === 'General' && (
                <>
                  <div className="form-group">
                    <label>Item Description *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.item_description || ''}
                      onChange={(e) =>
                        handleInputChange('item_description', e.target.value)
                      }
                      placeholder="Describe the equipment"
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.customer_name || ''}
                      onChange={(e) =>
                        handleInputChange('customer_name', e.target.value)
                      }
                      placeholder="Enter customer name"
                    />
                  </div>
                </>
              )}

              {autoFilledData && (
                <div className="autofill-info">
                  <h4>✓ Auto-filled Information</h4>
                  <p>Description: {autoFilledData.ItemDescription}</p>
                  <p>Product Family: {autoFilledData.ProductFamily}</p>
                  <p>Repairability: {autoFilledData.RepairabilityStatus}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Contact Information (UR-037) */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>Contact Information</h2>

              <div className="form-group">
                <label>Contact Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contact_name || ''}
                  onChange={(e) =>
                    handleInputChange('contact_name', e.target.value)
                  }
                  placeholder="Full name"
                />
              </div>

              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.contact_email || ''}
                  onChange={(e) =>
                    handleInputChange('contact_email', e.target.value)
                  }
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.contact_phone || ''}
                  onChange={(e) =>
                    handleInputChange('contact_phone', e.target.value)
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label>Site Address</label>
                <textarea
                  className="form-control"
                  value={formData.site_address || ''}
                  onChange={(e) =>
                    handleInputChange('site_address', e.target.value)
                  }
                  placeholder="Full address"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Issue Description (UR-040) */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>Issue Description</h2>

              <div className="form-group">
                <label>Main Reason *</label>
                <select
                  className="form-control"
                  value={formData.main_reason || ''}
                  onChange={(e) =>
                    handleInputChange('main_reason', e.target.value)
                  }
                >
                  <option value="">-- Select Issue --</option>
                  {Object.keys(issueReasons).map((main) => (
                    <option key={main} value={main}>
                      {main}
                    </option>
                  ))}
                </select>
              </div>

              {formData.main_reason && issueReasons[formData.main_reason]?.length > 0 && (
                <div className="form-group">
                  <label>Sub Reason</label>
                  <select
                    className="form-control"
                    value={formData.sub_reason || ''}
                    onChange={(e) =>
                      handleInputChange('sub_reason', e.target.value)
                    }
                  >
                    <option value="">-- Select Sub Reason --</option>
                    {issueReasons[formData.main_reason].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Detailed Description</label>
                <textarea
                  className="form-control"
                  value={formData.issue_description || ''}
                  onChange={(e) =>
                    handleInputChange('issue_description', e.target.value)
                  }
                  placeholder="Please provide details about the issue..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Urgency Level</label>
                <select
                  className="form-control"
                  value={formData.urgency_level || 'Normal'}
                  onChange={(e) =>
                    handleInputChange('urgency_level', e.target.value)
                  }
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Ship-To Address Section */}
              <div className="form-group">
                <label>Ship-To Address</label>
                <div className="address-display-section">
                  <div className="current-address">
                    <strong>Current Address:</strong>
                    <p>{formData.site_address || 'No address on file'}</p>
                  </div>
                  {formData.ship_to_address && (
                    <div className="ship-to-address">
                      <strong>Ship-To Address (Updated):</strong>
                      <p>
                        {formData.ship_to_address}
                        {formData.ship_to_city && `, ${formData.ship_to_city}`}
                        {formData.ship_to_state && `, ${formData.ship_to_state}`}
                        {formData.ship_to_postal_code && ` ${formData.ship_to_postal_code}`}
                        {formData.ship_to_country && `, ${formData.ship_to_country}`}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn-edit-address"
                    onClick={() => setShowAddressModal(true)}
                  >
                    {formData.ship_to_address ? 'Edit Ship-To Address' : 'Set Different Ship-To Address'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.loaner_required || false}
                    onChange={(e) =>
                      handleInputChange('loaner_required', e.target.checked)
                    }
                  />
                  Loaner Equipment Required
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.quote_required || false}
                    onChange={(e) =>
                      handleInputChange('quote_required', e.target.checked)
                    }
                  />
                  Quote Required
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="form-step">
              <h2>Review Your Request</h2>

              <div className="review-section">
                <h4>Country & Language</h4>
                <p>Country: {formData.country_code}</p>
                <p>Language: {formData.language_code}</p>
              </div>

              <div className="review-section">
                <h4>Item Information</h4>
                <p>Request Type: {formData.request_type}</p>
                {formData.serial_number && <p>Serial: {formData.serial_number}</p>}
                {formData.item_number && <p>Item: {formData.item_number}</p>}
                {formData.item_description && <p>Description: {formData.item_description}</p>}
              </div>

              <div className="review-section">
                <h4>Contact</h4>
                <p>Name: {formData.contact_name}</p>
                <p>Email: {formData.contact_email}</p>
                <p>Phone: {formData.contact_phone}</p>
              </div>

              <div className="review-section">
                <h4>Issue</h4>
                <p>Main Reason: {formData.main_reason}</p>
                {formData.sub_reason && <p>Sub Reason: {formData.sub_reason}</p>}
                {formData.issue_description && <p>Details: {formData.issue_description}</p>}
              </div>
            </div>
          )}

          {validationMessage && (
            <div className={`validation-message ${validationMessage.includes('✓') ? 'success' : 'error'}`}>
              {validationMessage}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
              >
                Back
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Address Edit Modal */}
      <AddressEditModal
        isVisible={showAddressModal}
        currentAddress={formData.site_address || ''}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
      />
    </div>
  );
};

export default IntakeForm;
