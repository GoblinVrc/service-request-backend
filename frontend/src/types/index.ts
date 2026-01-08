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
  id: number;
  request_code: string;
  request_type: 'Serial' | 'Item' | 'General';
  customer_number?: string;
  customer_name?: string;
  contact_email: string;
  contact_phone: string;
  contact_name: string;
  country_code: string;
  territory?: string;
  site_address?: string;
  serial_number?: string;
  item_number?: string;
  lot_number?: string;
  item_description?: string;
  product_family?: string;
  main_reason: string;
  sub_reason?: string;
  issue_description?: string;
  repairability_status?: string;
  requested_service_date?: string;
  urgency_level: 'Normal' | 'Urgent' | 'Critical';
  loaner_required: boolean;
  loaner_details?: string;
  quote_required: boolean;
  status: 'Submitted' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled';
  submitted_by_email: string;
  submitted_by_name: string;
  submitted_date: string;
  last_modified_date: string;
  language_code: string;
  customer_notes?: string;
  internal_notes?: string;
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
