import React, { useState, useEffect } from 'react';
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

interface IntakeFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

interface Item {
  item_number: string;
  item_description: string;
  serial_number?: string;
  product_family?: string;
  instance_count?: number;
}

interface Customer {
  customer_number: string;
  customer_name: string;
  territory_code: string;
  country_code: string;
}

// Multi-step form for service request intake (UR-048)
const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit: onSubmitCallback, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [issueReasons, setIssueReasons] = useState<Record<string, string[]>>({});
  const [validationMessage, setValidationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>('customer');

  // Form data - New structure per UR-1121517
  const [formData, setFormData] = useState<Partial<ServiceRequestCreate>>({
    request_type: 'Serial', // Default to Serial (primary input)
    country_code: 'US', // Default country (will be set by sidebar later)
    language_code: 'en',
    contact_email: '',
    contact_name: '',
    contact_phone: '',
    main_reason: '',
    urgency_level: 'Normal',
    loaner_required: false,
    quote_required: false,
    safety_patient_involved: false,
    pickup_date: '',
    pickup_time: '',
    po_reference_number: '',
    customer_ident_code: '',
  });

  // Auto-filled data from validation (UR-038)
  const [autoFilledData, setAutoFilledData] = useState<any>(null);

  // Address editing modal state
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Customer search state (for sales/tech/admin)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Item search/autocomplete state
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  useEffect(() => {
    loadInitialData();
    // Detect user role from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || 'customer');
      } catch (e) {
        setUserRole('customer');
      }
    }
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

  // Customer search handler (for sales/tech/admin)
  const handleCustomerSearch = async (searchTerm: string) => {
    setCustomerSearchTerm(searchTerm);

    if (searchTerm.length < 2) {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    try {
      const results = await apiService.get<Customer[]>(
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

  const handleSelectCustomer = (customer: Customer) => {
    setFormData({
      ...formData,
      customer_number: customer.customer_number,
      customer_name: customer.customer_name,
      territory_code: customer.territory_code,
      country_code: customer.country_code,
    });
    setCustomerSearchTerm(customer.customer_name);
    setShowCustomerDropdown(false);
  };

  // Item search handler (for Serial/Item lookup)
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
    setFormData({
      ...formData,
      item_number: item.item_number,
      serial_number: item.serial_number || '',
      item_description: item.item_description,
      product_family: item.product_family || '',
    });
    setItemSearchTerm(`${item.item_number} - ${item.item_description}`);
    setShowItemDropdown(false);
    setAutoFilledData({
      ItemDescription: item.item_description,
      ProductFamily: item.product_family,
      RepairabilityStatus: 'Available', // Default
    });
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
        // Step 1: Item Identification
        // Sales/tech/admin must select a customer first
        if (userRole !== 'customer' && !formData.customer_number) {
          return false;
        }

        if (formData.request_type === 'Serial') {
          return !!formData.serial_number;
        } else if (formData.request_type === 'Item') {
          return !!formData.item_number;
        } else if (formData.request_type === 'General') {
          return !!(formData.item_description && formData.customer_name);
        }
        return false;
      case 2:
        // Step 2: Issue Details (Main Reason and Safety/Patient are mandatory)
        return !!(formData.main_reason);
      case 3:
        // Step 3: Contact & Addresses (Contact info is mandatory)
        return !!(
          formData.contact_email &&
          formData.contact_name &&
          formData.contact_phone
        );
      case 4:
        // Step 4: Service Requirements (Loaner, Pickup Date/Time, PO Reference, Customer Ident Code are mandatory)
        return !!(
          formData.loaner_required !== undefined &&
          formData.pickup_date &&
          formData.pickup_time &&
          formData.po_reference_number &&
          formData.customer_ident_code
        );
      case 5:
        // Step 5: Attachments (optional)
        return true;
      case 6:
        // Step 6: Review & Submit
        return true;
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
    zip: string;
    country: string;
  }) => {
    setFormData({
      ...formData,
      ship_to_street: newAddress.address,
      ship_to_city: newAddress.city,
      ship_to_zip: newAddress.zip,
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

      // Call the callback to navigate back to dashboard
      if (onSubmitCallback) {
        onSubmitCallback();
      }
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

        {/* Progress Steps - 6 Steps per UR-1121517 */}
        <div className="steps-indicator">
          {[1, 2, 3, 4, 5, 6].map((step) => (
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
                {step === 1 && 'Item Identification'}
                {step === 2 && 'Issue Details'}
                {step === 3 && 'Contact & Addresses'}
                {step === 4 && 'Service Requirements'}
                {step === 5 && 'Attachments'}
                {step === 6 && 'Review & Submit'}
              </div>
            </div>
          ))}
        </div>

        <div className="form-content">
          {/* Step 1: Item Identification */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Item Identification</h2>

              {/* Customer search for sales/tech/admin users */}
              {userRole !== 'customer' && (
                <div className="form-group">
                  <label>Search Customer *</label>
                  <div className="autocomplete-wrapper">
                    <input
                      type="text"
                      className="form-control"
                      value={customerSearchTerm}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      onFocus={() => filteredCustomers.length > 0 && setShowCustomerDropdown(true)}
                      placeholder="Type to search by customer name or number..."
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
                            <div className="item-family">Country: {customer.country_code}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.customer_name && (
                    <div className="selected-item">
                      <h4>✓ Selected Customer</h4>
                      <div className="item-details">
                        <p><strong>Customer Number:</strong> {formData.customer_number}</p>
                        <p><strong>Customer Name:</strong> {formData.customer_name}</p>
                        <p><strong>Country:</strong> {formData.country_code}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

              {(formData.request_type === 'Serial' || formData.request_type === 'Item') && (
                <div className="form-group">
                  <label>Search Item/Serial *</label>
                  <div className="autocomplete-wrapper">
                    <input
                      type="text"
                      className="form-control"
                      value={itemSearchTerm}
                      onChange={(e) => handleItemSearch(e.target.value)}
                      onFocus={() => filteredItems.length > 0 && setShowItemDropdown(true)}
                      placeholder="Type to search by serial number or item number..."
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
                            {item.product_family && <div className="item-family">{item.product_family}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.item_number && (
                    <div className="selected-item">
                      <h4>✓ Selected Item</h4>
                      <div className="item-details">
                        <p><strong>Item Number:</strong> {formData.item_number}</p>
                        {formData.serial_number && <p><strong>Serial Number:</strong> {formData.serial_number}</p>}
                        <p><strong>Description:</strong> {formData.item_description}</p>
                        {formData.product_family && <p><strong>Product Family:</strong> {formData.product_family}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.request_type === 'General' && (
                <>
                  <div className="form-group">
                    <label>Search Customer *</label>
                    <div className="autocomplete-wrapper">
                      <input
                        type="text"
                        className="form-control"
                        value={customerSearchTerm}
                        onChange={(e) => handleCustomerSearch(e.target.value)}
                        onFocus={() => filteredCustomers.length > 0 && setShowCustomerDropdown(true)}
                        placeholder="Type to search by customer name or number..."
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
                              <div className="item-family">Country: {customer.country_code}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {formData.customer_name && (
                      <div className="selected-item">
                        <h4>✓ Selected Customer</h4>
                        <div className="item-details">
                          <p><strong>Customer Number:</strong> {formData.customer_number}</p>
                          <p><strong>Customer Name:</strong> {formData.customer_name}</p>
                          <p><strong>Country:</strong> {formData.country_code}</p>
                        </div>
                      </div>
                    )}
                  </div>

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

          {/* Step 2: Issue Details */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>Issue Details</h2>

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
                <label>Safety / Patient Involvement *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={formData.safety_patient_involved === true}
                      onChange={() =>
                        handleInputChange('safety_patient_involved', true)
                      }
                    />
                    Yes - Patient/Safety Issue
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={formData.safety_patient_involved === false}
                      onChange={() =>
                        handleInputChange('safety_patient_involved', false)
                      }
                    />
                    No - No Patient/Safety Involvement
                  </label>
                </div>
              </div>

              {formData.safety_patient_involved && (
                <div className="form-group">
                  <label>Safety / Patient Details *</label>
                  <textarea
                    className="form-control"
                    value={formData.safety_patient_details || ''}
                    onChange={(e) =>
                      handleInputChange('safety_patient_details', e.target.value)
                    }
                    placeholder="Please provide details about the patient/safety involvement..."
                    rows={3}
                  />
                </div>
              )}

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
            </div>
          )}

          {/* Step 3: Contact & Addresses */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>Contact Information & Addresses</h2>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Contact Details</h3>

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

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Addresses</h3>

              <div className="form-group">
                <label>Bill-To Address (from Customer Record)</label>
                <div className="address-display-section">
                  <div className="current-address">
                    <p>{formData.site_address || 'No billing address on file'}</p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Ship-To Address</label>
                <div className="address-display-section">
                  {formData.ship_to_street ? (
                    <div className="ship-to-address">
                      <p>
                        {formData.ship_to_street}
                        {formData.ship_to_zip && `, ${formData.ship_to_zip}`}
                        {formData.ship_to_city && ` ${formData.ship_to_city}`}
                        {formData.ship_to_country && `, ${formData.ship_to_country}`}
                      </p>
                    </div>
                  ) : (
                    <p>Using Bill-To address</p>
                  )}
                  <button
                    type="button"
                    className="btn-edit-address"
                    onClick={() => setShowAddressModal(true)}
                  >
                    {formData.ship_to_street ? 'Edit Ship-To Address' : 'Set Different Ship-To Address'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={!!formData.alternative_billing_street}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        // Clear alternative billing fields
                        setFormData({
                          ...formData,
                          alternative_billing_street: undefined,
                          alternative_billing_zip: undefined,
                          alternative_billing_city: undefined,
                          alternative_billing_country: undefined,
                        });
                      }
                    }}
                  />
                  Use Alternative Billing Address (Optional)
                </label>
              </div>

              {formData.alternative_billing_street !== undefined && (
                <div className="form-group" style={{ marginLeft: '1.5rem' }}>
                  <label>Alternative Billing Street</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.alternative_billing_street || ''}
                    onChange={(e) =>
                      handleInputChange('alternative_billing_street', e.target.value)
                    }
                    placeholder="Street address"
                  />
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.alternative_billing_zip || ''}
                      onChange={(e) =>
                        handleInputChange('alternative_billing_zip', e.target.value)
                      }
                      placeholder="Zip"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={formData.alternative_billing_city || ''}
                      onChange={(e) =>
                        handleInputChange('alternative_billing_city', e.target.value)
                      }
                      placeholder="City"
                      style={{ flex: 2 }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={formData.alternative_billing_country || ''}
                      onChange={(e) =>
                        handleInputChange('alternative_billing_country', e.target.value)
                      }
                      placeholder="Country"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Service Requirements */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>Service Requirements</h2>

              <div className="form-group">
                <label>Loaner Equipment Required? *</label>
                <div className="toggle-cards">
                  <div
                    className={`toggle-card ${formData.loaner_required === true ? 'selected' : ''}`}
                    onClick={() => handleInputChange('loaner_required', true)}
                  >
                    <div className="toggle-card-icon">✓</div>
                    <div className="toggle-card-title">Yes</div>
                    <div className="toggle-card-desc">Loaner equipment needed</div>
                  </div>
                  <div
                    className={`toggle-card ${formData.loaner_required === false ? 'selected' : ''}`}
                    onClick={() => handleInputChange('loaner_required', false)}
                  >
                    <div className="toggle-card-icon">✗</div>
                    <div className="toggle-card-title">No</div>
                    <div className="toggle-card-desc">No loaner needed</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Quote Required? *</label>
                <div className="toggle-cards">
                  <div
                    className={`toggle-card ${formData.quote_required === true ? 'selected' : ''}`}
                    onClick={() => handleInputChange('quote_required', true)}
                  >
                    <div className="toggle-card-icon">💰</div>
                    <div className="toggle-card-title">Yes</div>
                    <div className="toggle-card-desc">Request a quote</div>
                  </div>
                  <div
                    className={`toggle-card ${formData.quote_required === false ? 'selected' : ''}`}
                    onClick={() => handleInputChange('quote_required', false)}
                  >
                    <div className="toggle-card-icon">✗</div>
                    <div className="toggle-card-title">No</div>
                    <div className="toggle-card-desc">No quote needed</div>
                  </div>
                </div>
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Pickup Information</h3>

              <div className="form-group">
                <label>Pickup Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.pickup_date || ''}
                  onChange={(e) =>
                    handleInputChange('pickup_date', e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Pickup Time *</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.pickup_time || ''}
                  onChange={(e) =>
                    handleInputChange('pickup_time', e.target.value)
                  }
                />
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Reference Information</h3>

              <div className="form-group">
                <label>PO Reference Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.po_reference_number || ''}
                  onChange={(e) =>
                    handleInputChange('po_reference_number', e.target.value)
                  }
                  placeholder="Purchase Order number"
                />
              </div>

              <div className="form-group">
                <label>Customer Ident Code *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.customer_ident_code || ''}
                  onChange={(e) =>
                    handleInputChange('customer_ident_code', e.target.value)
                  }
                  placeholder="Customer identification code"
                />
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Additional Information</h3>

              <div className="form-group">
                <label>Preferred Contact Method</label>
                <select
                  className="form-control"
                  value={formData.preferred_contact_method || ''}
                  onChange={(e) =>
                    handleInputChange('preferred_contact_method', e.target.value)
                  }
                >
                  <option value="">-- Select Method --</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>

              <div className="form-group">
                <label>Contract Information</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contract_info || ''}
                  onChange={(e) =>
                    handleInputChange('contract_info', e.target.value)
                  }
                  placeholder="Contract number or details"
                />
              </div>

              <div className="form-group">
                <label>Additional Comments</label>
                <textarea
                  className="form-control"
                  value={formData.customer_notes || ''}
                  onChange={(e) =>
                    handleInputChange('customer_notes', e.target.value)
                  }
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 5: Attachments */}
          {currentStep === 5 && (
            <div className="form-step">
              <h2>Attachments (Optional)</h2>
              <p className="form-subtitle">Upload photos, documents, or other files related to your request</p>

              <div className="form-group">
                <label>File Upload</label>
                <input
                  type="file"
                  className="form-control"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                />
                <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Accepted formats: Images, PDF, Word documents. Max 10MB per file.
                </p>
              </div>

              <div className="form-group">
                <p style={{ fontStyle: 'italic', color: '#666' }}>
                  Note: File upload functionality will be fully implemented in the next phase.
                  You can skip this step for now.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="form-step">
              <h2>Review Your Request</h2>

              <div className="review-section">
                <h4>Item Information</h4>
                <p><strong>Request Type:</strong> {formData.request_type}</p>
                {formData.serial_number && <p><strong>Serial Number:</strong> {formData.serial_number}</p>}
                {formData.item_number && <p><strong>Item Number:</strong> {formData.item_number}</p>}
                {formData.item_description && <p><strong>Description:</strong> {formData.item_description}</p>}
                {formData.customer_name && <p><strong>Customer:</strong> {formData.customer_name}</p>}
              </div>

              <div className="review-section">
                <h4>Issue Details</h4>
                <p><strong>Main Reason:</strong> {formData.main_reason}</p>
                {formData.sub_reason && <p><strong>Sub Reason:</strong> {formData.sub_reason}</p>}
                {formData.issue_description && <p><strong>Details:</strong> {formData.issue_description}</p>}
                <p><strong>Safety/Patient Involved:</strong> {formData.safety_patient_involved ? 'Yes' : 'No'}</p>
                {formData.safety_patient_details && <p><strong>Safety Details:</strong> {formData.safety_patient_details}</p>}
                <p><strong>Urgency:</strong> {formData.urgency_level}</p>
              </div>

              <div className="review-section">
                <h4>Contact Information</h4>
                <p><strong>Name:</strong> {formData.contact_name}</p>
                <p><strong>Email:</strong> {formData.contact_email}</p>
                <p><strong>Phone:</strong> {formData.contact_phone}</p>
                {formData.preferred_contact_method && (
                  <p><strong>Preferred Contact:</strong> {formData.preferred_contact_method}</p>
                )}
              </div>

              <div className="review-section">
                <h4>Addresses</h4>
                <p><strong>Bill-To:</strong> {formData.site_address || 'Not specified'}</p>
                {formData.ship_to_street ? (
                  <p><strong>Ship-To:</strong> {formData.ship_to_street}, {formData.ship_to_zip} {formData.ship_to_city}, {formData.ship_to_country}</p>
                ) : (
                  <p><strong>Ship-To:</strong> Same as Bill-To</p>
                )}
                {formData.alternative_billing_street && (
                  <p><strong>Alt. Billing:</strong> {formData.alternative_billing_street}, {formData.alternative_billing_zip} {formData.alternative_billing_city}, {formData.alternative_billing_country}</p>
                )}
              </div>

              <div className="review-section">
                <h4>Service Requirements</h4>
                <p><strong>Loaner Required:</strong> {formData.loaner_required ? 'Yes' : 'No'}</p>
                <p><strong>Quote Required:</strong> {formData.quote_required ? 'Yes' : 'No'}</p>
                <p><strong>Pickup Date:</strong> {formData.pickup_date}</p>
                <p><strong>Pickup Time:</strong> {formData.pickup_time}</p>
                <p><strong>PO Reference:</strong> {formData.po_reference_number}</p>
                <p><strong>Customer Ident Code:</strong> {formData.customer_ident_code}</p>
                {formData.contract_info && <p><strong>Contract Info:</strong> {formData.contract_info}</p>}
                {formData.customer_notes && <p><strong>Comments:</strong> {formData.customer_notes}</p>}
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

            {currentStep < 6 ? (
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
