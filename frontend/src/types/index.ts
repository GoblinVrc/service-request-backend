// Type definitions for the application

export interface User {
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SALES_TECH' | 'ADMIN';
  customer_number?: string;
  territories?: string[];
}

export interface Country {
  country_code: string;
  country_name: string;
  default_language: string;
  supported_languages: string;
}

export interface Language {
  language_code: string;
  language_name: string;
}

export interface LegalDocument {
  DocumentType: string;
  DocumentURL: string;
  DocumentContent: string;
  Version: string;
  EffectiveDate: string;
}

export interface Item {
  ItemNumber: string;
  ItemDescription: string;
  SerialNumber: string;
  LotNumber: string;
  ProductFamily: string;
  ProductLine: string;
  IsServiceable: boolean;
  RepairabilityStatus: string;
  InstallBaseStatus: string;
  EligibilityCountries: string[];
}

export interface IssueReason {
  MainReason: string;
  SubReason: string;
  DisplayOrder: number;
}

export interface ServiceRequest {
  Id: number;
  RequestCode: string;
  RequestType: 'Serial' | 'Item' | 'General';
  CustomerNumber?: string;
  CustomerName?: string;
  ContactEmail: string;
  ContactPhone: string;
  ContactName: string;
  CountryCode: string;
  Territory?: string;
  SiteAddress?: string;
  SerialNumber?: string;
  ItemNumber?: string;
  LotNumber?: string;
  ItemDescription?: string;
  ProductFamily?: string;
  MainReason: string;
  SubReason?: string;
  IssueDescription?: string;
  RepairabilityStatus?: string;
  RequestedServiceDate?: string;
  UrgencyLevel: 'Normal' | 'Urgent' | 'Critical';
  LoanerRequired: boolean;
  LoanerDetails?: string;
  QuoteRequired: boolean;
  Status: 'Submitted' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled';
  SubmittedByEmail: string;
  SubmittedByName: string;
  SubmittedDate: string;
  LastModifiedDate: string;
  LanguageCode: string;
  CustomerNotes?: string;
  InternalNotes?: string;
}

export interface ServiceRequestCreate {
  request_type: 'Serial' | 'Item' | 'General';
  country_code: string;
  contact_email: string;
  contact_name: string;
  contact_phone: string;
  main_reason: string;
  customer_number?: string;
  customer_name?: string;
  site_address?: string;
  serial_number?: string;
  item_number?: string;
  lot_number?: string;
  item_description?: string;
  product_family?: string;
  sub_reason?: string;
  issue_description?: string;
  requested_service_date?: string;
  urgency_level?: 'Normal' | 'Urgent' | 'Critical';
  loaner_required?: boolean;
  loaner_details?: string;
  quote_required?: boolean;
  language_code?: string;
  customer_notes?: string;
}

export interface ValidationResponse {
  valid: boolean;
  item?: Item;
  message: string;
  error?: string;
}

export interface SubmitResponse {
  success: boolean;
  request_id: number;
  request_code: string;
  message: string;
  next_steps: string;
}

export interface Attachment {
  Id: number;
  RequestId: number;
  FileName: string;
  BlobPath: string;
  FileSize: number;
  ContentType: string;
  UploadedDate: string;
  UploadedBy: string;
  Description?: string;
}
