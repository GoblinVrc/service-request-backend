-- ============================================================================
-- Service Request Portal - Territory-Based Schema Reset
-- Using German Federal States (Bundesländer) as Territory Examples
-- ============================================================================

-- Drop existing tables
DROP TABLE IF EXISTS regops_app.tbl_globi_eu_am_99_attachments CASCADE;
DROP TABLE IF EXISTS regops_app.tbl_globi_eu_am_99_service_requests CASCADE;
DROP TABLE IF EXISTS regops_app.tbl_globi_eu_am_99_user_territories CASCADE;
DROP TABLE IF EXISTS regops_app.tbl_globi_eu_am_99_customer_territories CASCADE;
DROP TABLE IF EXISTS regops_app.tbl_globi_eu_am_99_salestech_territories CASCADE;
DROP TABLE IF EXISTS regops_app.tbl_globi_eu_am_99_customer_users CASCADE;
DROP TABLE IF EXISTS regops_app.tbl_globi_eu_am_99_customers CASCADE;
DROP TABLE IF EXISTS regops_app.tbl_globi_eu_am_99_territories CASCADE;

-- ============================================================================
-- TERRITORY MANAGEMENT
-- ============================================================================

-- Master territories table (German Federal States)
CREATE TABLE regops_app.tbl_globi_eu_am_99_territories (
    territory_code VARCHAR(10) PRIMARY KEY,
    territory_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    parent_territory VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert German Federal States as territories
INSERT INTO regops_app.tbl_globi_eu_am_99_territories (territory_code, territory_name, country_code) VALUES
('DE-BW', 'Baden-Württemberg', 'DE'),
('DE-BY', 'Bayern (Bavaria)', 'DE'),
('DE-BE', 'Berlin', 'DE'),
('DE-BB', 'Brandenburg', 'DE'),
('DE-HB', 'Bremen', 'DE'),
('DE-HH', 'Hamburg', 'DE'),
('DE-HE', 'Hessen', 'DE'),
('DE-MV', 'Mecklenburg-Vorpommern', 'DE'),
('DE-NI', 'Niedersachsen (Lower Saxony)', 'DE'),
('DE-NW', 'Nordrhein-Westfalen (North Rhine-Westphalia)', 'DE'),
('DE-RP', 'Rheinland-Pfalz (Rhineland-Palatinate)', 'DE'),
('DE-SL', 'Saarland', 'DE'),
('DE-SN', 'Sachsen (Saxony)', 'DE'),
('DE-ST', 'Sachsen-Anhalt (Saxony-Anhalt)', 'DE'),
('DE-SH', 'Schleswig-Holstein', 'DE'),
('DE-TH', 'Thüringen (Thuringia)', 'DE');

-- ============================================================================
-- CUSTOMER MANAGEMENT
-- ============================================================================

-- Customers table
CREATE TABLE regops_app.tbl_globi_eu_am_99_customers (
    customer_number VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    territory_code VARCHAR(10) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country_code VARCHAR(10) DEFAULT 'DE',
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (territory_code) REFERENCES regops_app.tbl_globi_eu_am_99_territories(territory_code)
);

-- Insert sample customers across German territories
INSERT INTO regops_app.tbl_globi_eu_am_99_customers
(customer_number, customer_name, territory_code, city, postal_code) VALUES
('CUST-BW-001', 'Klinikum Stuttgart', 'DE-BW', 'Stuttgart', '70174'),
('CUST-BW-002', 'Universitätsklinikum Heidelberg', 'DE-BW', 'Heidelberg', '69120'),
('CUST-BY-001', 'Klinikum München', 'DE-BY', 'München', '80333'),
('CUST-BY-002', 'Universitätsklinikum Nürnberg', 'DE-BY', 'Nürnberg', '90419'),
('CUST-BE-001', 'Charité Berlin', 'DE-BE', 'Berlin', '10117'),
('CUST-HH-001', 'Universitätsklinikum Hamburg', 'DE-HH', 'Hamburg', '20246'),
('CUST-NW-001', 'Uniklinik Köln', 'DE-NW', 'Köln', '50937'),
('CUST-NW-002', 'Universitätsklinikum Düsseldorf', 'DE-NW', 'Düsseldorf', '40225'),
('CUST-HE-001', 'Universitätsklinikum Frankfurt', 'DE-HE', 'Frankfurt', '60590'),
('CUST-SN-001', 'Universitätsklinikum Dresden', 'DE-SN', 'Dresden', '01307');

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

-- Users table (all roles)
CREATE TABLE regops_app.tbl_globi_eu_am_99_customer_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL, -- 'Admin', 'SalesTech', 'Customer'
    customer_number VARCHAR(50), -- NULL for Admin/SalesTech, populated for Customer
    is_active BOOLEAN DEFAULT TRUE,
    last_login_date TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_number) REFERENCES regops_app.tbl_globi_eu_am_99_customers(customer_number)
);

-- User-Territory mapping (many-to-many)
-- Admins have ALL territories, SalesTech have assigned territories, Customers have their hospital's territory
CREATE TABLE regops_app.tbl_globi_eu_am_99_user_territories (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    territory_code VARCHAR(10) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES regops_app.tbl_globi_eu_am_99_customer_users(email) ON DELETE CASCADE,
    FOREIGN KEY (territory_code) REFERENCES regops_app.tbl_globi_eu_am_99_territories(territory_code),
    UNIQUE (user_email, territory_code)
);

-- Insert sample users
-- Admin user (has access to all territories)
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_users
(email, password_hash, first_name, last_name, role, customer_number) VALUES
('admin@stryker.com', 'admin123', 'System', 'Administrator', 'Admin', NULL);

-- Insert all territories for admin
INSERT INTO regops_app.tbl_globi_eu_am_99_user_territories (user_email, territory_code)
SELECT 'admin@stryker.com', territory_code
FROM regops_app.tbl_globi_eu_am_99_territories;

-- SalesTech users (regional coverage)
-- Sales rep for South Germany (Baden-Württemberg, Bayern, Hessen)
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_users
(email, password_hash, first_name, last_name, role, customer_number) VALUES
('sales.south@stryker.com', 'sales123', 'Hans', 'Müller', 'SalesTech', NULL);

INSERT INTO regops_app.tbl_globi_eu_am_99_user_territories (user_email, territory_code) VALUES
('sales.south@stryker.com', 'DE-BW'),
('sales.south@stryker.com', 'DE-BY'),
('sales.south@stryker.com', 'DE-HE');

-- Sales rep for West Germany (NRW, Rheinland-Pfalz, Saarland)
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_users
(email, password_hash, first_name, last_name, role, customer_number) VALUES
('sales.west@stryker.com', 'sales123', 'Anna', 'Schmidt', 'SalesTech', NULL);

INSERT INTO regops_app.tbl_globi_eu_am_99_user_territories (user_email, territory_code) VALUES
('sales.west@stryker.com', 'DE-NW'),
('sales.west@stryker.com', 'DE-RP'),
('sales.west@stryker.com', 'DE-SL');

-- Sales rep for North Germany (Berlin, Hamburg, Bremen, Schleswig-Holstein, Niedersachsen)
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_users
(email, password_hash, first_name, last_name, role, customer_number) VALUES
('sales.north@stryker.com', 'sales123', 'Peter', 'Weber', 'SalesTech', NULL);

INSERT INTO regops_app.tbl_globi_eu_am_99_user_territories (user_email, territory_code) VALUES
('sales.north@stryker.com', 'DE-BE'),
('sales.north@stryker.com', 'DE-HH'),
('sales.north@stryker.com', 'DE-HB'),
('sales.north@stryker.com', 'DE-SH'),
('sales.north@stryker.com', 'DE-NI');

-- Sales rep for East Germany (Sachsen, Brandenburg, Thüringen, Sachsen-Anhalt, Mecklenburg-Vorpommern)
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_users
(email, password_hash, first_name, last_name, role, customer_number) VALUES
('sales.east@stryker.com', 'sales123', 'Maria', 'Fischer', 'SalesTech', NULL);

INSERT INTO regops_app.tbl_globi_eu_am_99_user_territories (user_email, territory_code) VALUES
('sales.east@stryker.com', 'DE-SN'),
('sales.east@stryker.com', 'DE-BB'),
('sales.east@stryker.com', 'DE-TH'),
('sales.east@stryker.com', 'DE-ST'),
('sales.east@stryker.com', 'DE-MV');

-- Customer users (one per hospital)
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_users
(email, password_hash, first_name, last_name, role, customer_number) VALUES
('biomedtech@klinikum-stuttgart.de', 'customer123', 'Thomas', 'Bauer', 'Customer', 'CUST-BW-001'),
('biomed@uniklinik-muenchen.de', 'customer123', 'Klaus', 'Wagner', 'Customer', 'CUST-BY-001'),
('service@charite-berlin.de', 'customer123', 'Sabine', 'Hoffmann', 'Customer', 'CUST-BE-001'),
('technik@uniklinik-koeln.de', 'customer123', 'Michael', 'Schulz', 'Customer', 'CUST-NW-001');

-- Insert territories for customer users (based on their hospital location)
INSERT INTO regops_app.tbl_globi_eu_am_99_user_territories (user_email, territory_code)
SELECT cu.email, c.territory_code
FROM regops_app.tbl_globi_eu_am_99_customer_users cu
JOIN regops_app.tbl_globi_eu_am_99_customers c ON cu.customer_number = c.customer_number
WHERE cu.role = 'Customer';

-- ============================================================================
-- SERVICE REQUESTS
-- ============================================================================

CREATE TABLE regops_app.tbl_globi_eu_am_99_service_requests (
    id SERIAL PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE,
    request_type VARCHAR(20) NOT NULL, -- 'Serial', 'Item', 'General'

    -- Customer information
    customer_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    territory_code VARCHAR(10) NOT NULL,

    -- Contact information
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),

    -- Location
    country_code VARCHAR(10) DEFAULT 'DE',
    site_address TEXT,

    -- Equipment information
    serial_number VARCHAR(100),
    lot_number VARCHAR(100),
    item_number VARCHAR(100),
    item_description TEXT,
    product_family VARCHAR(100),

    -- Issue details
    main_reason VARCHAR(255) NOT NULL,
    sub_reason VARCHAR(255),
    issue_description TEXT,

    -- Service details
    requested_service_date DATE,
    urgency_level VARCHAR(20) DEFAULT 'Normal', -- 'Normal', 'Urgent', 'Critical'
    repairability_status VARCHAR(50),
    loaner_required BOOLEAN DEFAULT FALSE,
    loaner_details TEXT,
    quote_required BOOLEAN DEFAULT FALSE,

    -- Status tracking
    status VARCHAR(50) DEFAULT 'Submitted', -- 'Submitted', 'In Progress', 'Resolved', 'Closed', 'Cancelled'
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_by_email VARCHAR(255) NOT NULL,
    submitted_by_name VARCHAR(255),
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Additional information
    language_code VARCHAR(10) DEFAULT 'de',
    customer_notes TEXT,
    internal_notes TEXT,

    FOREIGN KEY (customer_number) REFERENCES regops_app.tbl_globi_eu_am_99_customers(customer_number),
    FOREIGN KEY (territory_code) REFERENCES regops_app.tbl_globi_eu_am_99_territories(territory_code)
);

-- Attachments table
CREATE TABLE regops_app.tbl_globi_eu_am_99_attachments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    blob_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255),
    description TEXT,
    FOREIGN KEY (request_id) REFERENCES regops_app.tbl_globi_eu_am_99_service_requests(id) ON DELETE CASCADE
);

-- ============================================================================
-- SAMPLE SERVICE REQUESTS
-- ============================================================================

-- Requests from customers
INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests
(request_code, request_type, customer_number, customer_name, territory_code,
 contact_name, contact_email, contact_phone, serial_number, item_number,
 main_reason, issue_description, status, submitted_by_email, submitted_by_name)
VALUES
('SR-000001', 'Serial', 'CUST-BW-001', 'Klinikum Stuttgart', 'DE-BW',
 'Thomas Bauer', 'biomedtech@klinikum-stuttgart.de', '+49 711 278 0',
 'SN-2024-BW-001', 'ITEM-12345', 'Equipment Malfunction',
 'Power button not responding', 'Submitted',
 'biomedtech@klinikum-stuttgart.de', 'Thomas Bauer'),

('SR-000002', 'Serial', 'CUST-BY-001', 'Klinikum München', 'DE-BY',
 'Klaus Wagner', 'biomed@uniklinik-muenchen.de', '+49 89 4400 0',
 'SN-2024-BY-001', 'ITEM-12346', 'Preventive Maintenance',
 'Annual calibration due', 'In Progress',
 'biomed@uniklinik-muenchen.de', 'Klaus Wagner'),

('SR-000003', 'Serial', 'CUST-BE-001', 'Charité Berlin', 'DE-BE',
 'Sabine Hoffmann', 'service@charite-berlin.de', '+49 30 450 0',
 'SN-2024-BE-001', 'ITEM-12347', 'Equipment Malfunction',
 'Display showing error code E-402', 'Submitted',
 'service@charite-berlin.de', 'Sabine Hoffmann'),

('SR-000004', 'Serial', 'CUST-NW-001', 'Uniklinik Köln', 'DE-NW',
 'Michael Schulz', 'technik@uniklinik-koeln.de', '+49 221 478 0',
 'SN-2024-NW-001', 'ITEM-12348', 'Parts Request',
 'Need replacement battery pack', 'Submitted',
 'technik@uniklinik-koeln.de', 'Michael Schulz');

-- Requests submitted by SalesTech on behalf of customers
INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests
(request_code, request_type, customer_number, customer_name, territory_code,
 contact_name, contact_email, contact_phone, serial_number, item_number,
 main_reason, issue_description, status, submitted_by_email, submitted_by_name)
VALUES
('SR-000005', 'Serial', 'CUST-BW-002', 'Universitätsklinikum Heidelberg', 'DE-BW',
 'Dr. Schneider', 'service@uniklinik-heidelberg.de', '+49 6221 56 0',
 'SN-2024-BW-002', 'ITEM-12349', 'Installation Support',
 'New equipment installation needed', 'Submitted',
 'sales.south@stryker.com', 'Hans Müller'),

('SR-000006', 'Serial', 'CUST-BY-002', 'Universitätsklinikum Nürnberg', 'DE-BY',
 'Dr. Klein', 'technik@uniklinik-nuernberg.de', '+49 911 398 0',
 'SN-2024-BY-002', 'ITEM-12350', 'Training Request',
 'Staff training for new system', 'In Progress',
 'sales.south@stryker.com', 'Hans Müller');

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_service_requests_customer ON regops_app.tbl_globi_eu_am_99_service_requests(customer_number);
CREATE INDEX idx_service_requests_territory ON regops_app.tbl_globi_eu_am_99_service_requests(territory_code);
CREATE INDEX idx_service_requests_status ON regops_app.tbl_globi_eu_am_99_service_requests(status);
CREATE INDEX idx_service_requests_submitted_date ON regops_app.tbl_globi_eu_am_99_service_requests(submitted_date);
CREATE INDEX idx_user_territories_email ON regops_app.tbl_globi_eu_am_99_user_territories(user_email);
CREATE INDEX idx_user_territories_territory ON regops_app.tbl_globi_eu_am_99_user_territories(territory_code);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Territories: 16 German Federal States
-- Customers: 10 sample hospitals across Germany
-- Users:
--   - 1 Admin (all territories)
--   - 4 SalesTech (regional: South, West, North, East)
--   - 4 Customer users (hospital staff)
-- Sample Requests: 6 service requests
