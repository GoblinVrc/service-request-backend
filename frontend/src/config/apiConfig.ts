// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/login',
  AUTH_ME: '/api/auth/me',

  // Countries & Languages
  COUNTRIES: '/api/countries',
  COUNTRY_LANGUAGES: (countryCode: string) => `/api/countries/${countryCode}/languages`,
  COUNTRY_LEGAL: (countryCode: string) => `/api/countries/${countryCode}/legal`,

  // Validation
  VALIDATE_ITEM: '/api/validate/item',
  VALIDATE_CUSTOMER: '/api/validate/customer',

  // Intake
  SUBMIT_REQUEST: '/api/intake/submit',
  ISSUE_REASONS: '/api/intake/issue-reasons',
  REPAIRABILITY_STATUSES: '/api/intake/repairability-statuses',

  // Requests
  REQUESTS: '/api/requests',
  REQUEST_DETAIL: (id: number) => `/api/requests/${id}`,
  REQUEST_STATUS: (id: number) => `/api/requests/${id}/status`,

  // Upload
  UPLOAD: '/api/upload',
  DOWNLOAD: (requestId: number, filename: string) => `/api/download/${requestId}/${filename}`,

  // Lookups
  LOOKUP_SERIAL: '/api/lookups/serial',
  LOOKUP_LOT: '/api/lookups/lot',
  LOOKUP_ITEM: '/api/lookups/item',
  LOOKUP_REASONS: '/api/lookups/reasons',
};
