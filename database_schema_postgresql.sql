-- ============================================================================
-- Service Request Portal - PostgreSQL Database Schema
-- Schema: regops_app
-- Table naming: tbl_globi_eu_am_99_tablename
-- Converted from Azure SQL Server to PostgreSQL for Supabase
-- ============================================================================

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS regops_app;

-- ============================================================================
-- MASTER DATA TABLES
-- ============================================================================

-- Languages (create first as it's referenced by others)
CREATE TABLE regops_app.tbl_globi_eu_am_99_languages (
    language_code VARCHAR(10) PRIMARY KEY,
    language_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Countries and supported languages
CREATE TABLE regops_app.tbl_globi_eu_am_99_countries (
    country_code VARCHAR(10) PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    default_language VARCHAR(10),
    supported_languages VARCHAR(500), -- JSON array of language codes
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Terms & Conditions / Privacy Policy
CREATE TABLE regops_app.tbl_globi_eu_am_99_legal_documents (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(10) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'TermsAndConditions', 'PrivacyPolicy'
    language_code VARCHAR(10) NOT NULL,
    document_url VARCHAR(500),
    document_content TEXT,
    version VARCHAR(20),
    effective_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_code) REFERENCES regops_app.tbl_globi_eu_am_99_countries(country_code),
    FOREIGN KEY (language_code) REFERENCES regops_app.tbl_globi_eu_am_99_languages(language_code)
);

-- ============================================================================
-- PRODUCT / ITEM MASTER DATA
-- ============================================================================

-- Repairability Status Master
CREATE TABLE regops_app.tbl_globi_eu_am_99_repairability_statuses (
    status_code VARCHAR(50) PRIMARY KEY,
    status_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    allow_automation BOOLEAN DEFAULT true,
    repair_location VARCHAR(50), -- 'Depot', 'Field', 'Exchange', etc.
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items (Products/Equipment) - Extended
CREATE TABLE regops_app.tbl_globi_eu_am_99_items (
    item_number VARCHAR(50) PRIMARY KEY,
    item_description VARCHAR(500),
    serial_number VARCHAR(100),
    lot_number VARCHAR(100),
    product_family VARCHAR(100),
    product_line VARCHAR(100),
    is_serviceable BOOLEAN DEFAULT false,
    repairability_status VARCHAR(50),
    install_base_status VARCHAR(50),
    eligibility_countries TEXT, -- JSON array of country codes
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_serial_number ON regops_app.tbl_globi_eu_am_99_items(serial_number);
CREATE INDEX idx_items_lot_number ON regops_app.tbl_globi_eu_am_99_items(lot_number);
CREATE INDEX idx_items_is_serviceable ON regops_app.tbl_globi_eu_am_99_items(is_serviceable, repairability_status);

-- ============================================================================
-- CUSTOMER DATA
-- ============================================================================

-- Customers - Extended
-- ACTUAL SCHEMA: Contains territory_code directly in customers table
CREATE TABLE regops_app.tbl_globi_eu_am_99_customers (
    customer_number VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    territory_code VARCHAR(10) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bill_to_address VARCHAR(500),
    ship_to_address VARCHAR(500),
    FOREIGN KEY (country_code) REFERENCES regops_app.tbl_globi_eu_am_99_countries(country_code)
);

-- NOTE: tbl_globi_eu_am_99_customer_territories table DOES NOT EXIST in actual database
-- Territory information is stored directly in customers table via territory_code column

-- Customer Users (who can submit requests)
CREATE TABLE regops_app.tbl_globi_eu_am_99_customer_users (
    email VARCHAR(200) PRIMARY KEY,
    customer_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(50),
    preferred_language VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_date TIMESTAMP,
    FOREIGN KEY (customer_number) REFERENCES regops_app.tbl_globi_eu_am_99_customers(customer_number)
);

-- ============================================================================
-- ISSUE / ERROR CODES
-- ============================================================================

-- Main Issue Reasons
CREATE TABLE regops_app.tbl_globi_eu_am_99_issue_reasons (
    id SERIAL PRIMARY KEY,
    main_reason VARCHAR(200) NOT NULL,
    sub_reason VARCHAR(200),
    language_code VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (language_code) REFERENCES regops_app.tbl_globi_eu_am_99_languages(language_code)
);

CREATE INDEX idx_issue_main_reason ON regops_app.tbl_globi_eu_am_99_issue_reasons(main_reason, is_active);

-- ============================================================================
-- SERVICE REQUESTS - MAIN TABLE
-- ============================================================================

CREATE TABLE regops_app.tbl_globi_eu_am_99_service_requests (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE NOT NULL,

    -- Request Type
    request_type VARCHAR(50) NOT NULL, -- 'Serial', 'Item', 'General'

    -- Customer Information
    customer_number VARCHAR(50),
    customer_name VARCHAR(200),
    contact_email VARCHAR(200) NOT NULL,
    contact_phone VARCHAR(50),
    contact_name VARCHAR(200) NOT NULL,

    -- Location Information
    country_code VARCHAR(10) NOT NULL,
    territory VARCHAR(100),
    site_address VARCHAR(500),

    -- Product/Item Information
    serial_number VARCHAR(100),
    item_number VARCHAR(50),
    lot_number VARCHAR(100),
    item_description VARCHAR(500),
    product_family VARCHAR(100),

    -- Issue Details
    main_reason VARCHAR(200) NOT NULL,
    sub_reason VARCHAR(200),
    issue_description TEXT,

    -- Service Details
    repairability_status VARCHAR(50),
    requested_service_date TIMESTAMP,
    urgency_level VARCHAR(20), -- 'Normal', 'Urgent', 'Critical'

    -- Additional Services
    loaner_required BOOLEAN DEFAULT false,
    loaner_details TEXT,
    quote_required BOOLEAN DEFAULT false,

    -- Status & Workflow
    status VARCHAR(50) DEFAULT 'Submitted',
    assigned_to VARCHAR(200),
    priority INTEGER DEFAULT 2, -- 1=High, 2=Medium, 3=Low

    -- Metadata
    submitted_by_email VARCHAR(200) NOT NULL,
    submitted_by_name VARCHAR(200),
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(200),
    language_code VARCHAR(10) DEFAULT 'en',

    -- Notes & Comments
    internal_notes TEXT,
    customer_notes TEXT,

    -- Integration tracking
    oracle_repair_order_id VARCHAR(100),
    salesforce_work_order_id VARCHAR(100),

    FOREIGN KEY (customer_number) REFERENCES regops_app.tbl_globi_eu_am_99_customers(customer_number),
    FOREIGN KEY (country_code) REFERENCES regops_app.tbl_globi_eu_am_99_countries(country_code),
    FOREIGN KEY (repairability_status) REFERENCES regops_app.tbl_globi_eu_am_99_repairability_statuses(status_code)
);

CREATE INDEX idx_service_requests_status_date ON regops_app.tbl_globi_eu_am_99_service_requests(status, submitted_date DESC);
CREATE INDEX idx_service_requests_customer ON regops_app.tbl_globi_eu_am_99_service_requests(customer_number);
CREATE INDEX idx_service_requests_serial ON regops_app.tbl_globi_eu_am_99_service_requests(serial_number);
CREATE INDEX idx_service_requests_code ON regops_app.tbl_globi_eu_am_99_service_requests(request_code);

-- ============================================================================
-- ATTACHMENTS
-- ============================================================================

CREATE TABLE regops_app.tbl_globi_eu_am_99_attachments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    blob_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(200),
    description VARCHAR(500),
    FOREIGN KEY (request_id) REFERENCES regops_app.tbl_globi_eu_am_99_service_requests(id) ON DELETE CASCADE
);

CREATE INDEX idx_attachments_request ON regops_app.tbl_globi_eu_am_99_attachments(request_id);

-- ============================================================================
-- USER MANAGEMENT & ACCESS CONTROL
-- ============================================================================

-- User Territory Assignments (Sales Technicians)
-- ACTUAL TABLE NAME: user_territories (not territory_mappings)
CREATE TABLE regops_app.tbl_globi_eu_am_99_user_territories (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR NOT NULL,
    territory_code VARCHAR NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_territory_email ON regops_app.tbl_globi_eu_am_99_user_territories(user_email, territory_code);

-- Admin Users
CREATE TABLE regops_app.tbl_globi_eu_am_99_admin_users (
    email VARCHAR(200) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50), -- 'Admin', 'SuperAdmin', 'BusinessAdmin'
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_date TIMESTAMP
);

-- ============================================================================
-- ACTIVITY LOG (Audit trail)
-- ============================================================================

CREATE TABLE regops_app.tbl_globi_eu_am_99_activity_log (
    id SERIAL PRIMARY KEY,
    request_id INTEGER,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT,
    performed_by VARCHAR(200),
    performed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_value TEXT,
    new_value TEXT,
    FOREIGN KEY (request_id) REFERENCES regops_app.tbl_globi_eu_am_99_service_requests(id)
);

CREATE INDEX idx_activity_request_date ON regops_app.tbl_globi_eu_am_99_activity_log(request_id, performed_date DESC);

-- ============================================================================
-- DASHBOARD / METRICS VIEW
-- ============================================================================

CREATE VIEW regops_app.vw_request_metrics AS
SELECT
    country_code,
    status,
    repairability_status,
    DATE(submitted_date) AS submitted_date,
    COUNT(*) AS request_count,
    AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - submitted_date)) / 3600) AS avg_age_in_hours
FROM regops_app.tbl_globi_eu_am_99_service_requests
GROUP BY country_code, status, repairability_status, DATE(submitted_date);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Insert default languages
INSERT INTO regops_app.tbl_globi_eu_am_99_languages (language_code, language_name, is_active) VALUES
('en', 'English', true),
('de', 'German', true),
('fr', 'French', true),
('it', 'Italian', true),
('es', 'Spanish', true),
('nl', 'Dutch', true),
('pt', 'Portuguese', true),
('sv', 'Swedish', true),
('da', 'Danish', true),
('no', 'Norwegian', true),
('fi', 'Finnish', true);

-- Insert default countries
INSERT INTO regops_app.tbl_globi_eu_am_99_countries (country_code, country_name, default_language, supported_languages) VALUES
('CA', 'Canada', 'en', '["en", "fr"]'),
('US', 'United States', 'en', '["en", "es"]'),
('DE', 'Germany', 'de', '["de", "en"]'),
('FR', 'France', 'fr', '["fr", "en"]'),
('IT', 'Italy', 'it', '["it", "en"]'),
('ES', 'Spain', 'es', '["es", "en"]'),
('NL', 'Netherlands', 'nl', '["nl", "en"]'),
('PT', 'Portugal', 'pt', '["pt", "en"]'),
('SE', 'Sweden', 'sv', '["sv", "en"]'),
('DK', 'Denmark', 'da', '["da", "en"]'),
('NO', 'Norway', 'no', '["no", "en"]'),
('FI', 'Finland', 'fi', '["fi", "en"]');

-- Insert default repairability statuses
INSERT INTO regops_app.tbl_globi_eu_am_99_repairability_statuses (status_code, status_name, repair_location, is_active) VALUES
('DEPOT_MEDSURG', 'MedSurg Depot Repair', 'Depot', true),
('DEPOT_MEDICAL', 'Medical Depot Repair', 'Depot', true),
('FIELD_REPAIR', 'Field Repair', 'Field', true),
('EXCHANGE', 'Exchange', 'Depot', true),
('NON_REPAIRABLE', 'Non-Repairable', NULL, false);

-- Insert sample issue reasons
INSERT INTO regops_app.tbl_globi_eu_am_99_issue_reasons (main_reason, sub_reason, language_code, display_order) VALUES
('Equipment Malfunction', 'Power Issue', 'en', 1),
('Equipment Malfunction', 'Mechanical Failure', 'en', 2),
('Equipment Malfunction', 'Software/Firmware Issue', 'en', 3),
('Preventive Maintenance', 'Scheduled PM', 'en', 4),
('Preventive Maintenance', 'Calibration Required', 'en', 5),
('Installation Required', 'New Equipment Setup', 'en', 6),
('Installation Required', 'Relocation', 'en', 7),
('Other', 'General Inquiry', 'en', 8);

-- ============================================================================
-- FUNCTIONS (PostgreSQL equivalent of stored procedures)
-- ============================================================================

-- Generate unique request code
CREATE OR REPLACE FUNCTION regops_app.generate_request_code(p_country_code VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_sequence INTEGER;
    v_year VARCHAR(4);
    v_month VARCHAR(2);
    v_request_code VARCHAR(50);
BEGIN
    v_year := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
    v_month := TO_CHAR(CURRENT_TIMESTAMP, 'MM');

    SELECT COALESCE(MAX(CAST(SUBSTRING(request_code FROM POSITION('-' IN SUBSTRING(request_code FROM 9)) + 9) AS INTEGER)), 0) + 1
    INTO v_sequence
    FROM regops_app.tbl_globi_eu_am_99_service_requests
    WHERE request_code LIKE p_country_code || '-' || v_year || v_month || '-%';

    v_request_code := p_country_code || '-' || v_year || v_month || '-' || LPAD(v_sequence::TEXT, 6, '0');

    RETURN v_request_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER for auto-updating modified_date
-- ============================================================================

CREATE OR REPLACE FUNCTION regops_app.update_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_modified_date
    BEFORE UPDATE ON regops_app.tbl_globi_eu_am_99_countries
    FOR EACH ROW
    EXECUTE FUNCTION regops_app.update_modified_date();

CREATE TRIGGER update_customers_modified_date
    BEFORE UPDATE ON regops_app.tbl_globi_eu_am_99_customers
    FOR EACH ROW
    EXECUTE FUNCTION regops_app.update_modified_date();

CREATE TRIGGER update_items_modified_date
    BEFORE UPDATE ON regops_app.tbl_globi_eu_am_99_items
    FOR EACH ROW
    EXECUTE FUNCTION regops_app.update_modified_date();
