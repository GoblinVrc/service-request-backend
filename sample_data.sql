-- Sample data for testing the Service Request Portal
-- Run this after database_schema_postgresql.sql

-- ===================================
-- Sample Customers
-- ===================================
INSERT INTO regops_app.tbl_globi_eu_am_99_customers
(customer_number, customer_name, country_code, phone_number, email, bill_to_address, ship_to_address, has_pro_care_contract)
VALUES
('CUST001', 'Memorial Hospital', 'US', '+1-555-0100', 'contact@memorial.com', '123 Medical Center Dr, Boston, MA 02115', '123 Medical Center Dr, Boston, MA 02115', true),
('CUST002', 'City General Hospital', 'US', '+1-555-0200', 'info@citygeneral.com', '456 Healthcare Ave, New York, NY 10001', '456 Healthcare Ave, New York, NY 10001', true),
('CUST003', 'Regional Medical Center', 'US', '+1-555-0300', 'contact@regional.com', '789 Health Blvd, Chicago, IL 60601', '789 Health Blvd, Chicago, IL 60601', false),
('CUST004', 'University Hospital', 'CA', '+1-416-555-0400', 'info@university.ca', '100 Campus Dr, Toronto, ON M5S 1A1', '100 Campus Dr, Toronto, ON M5S 1A1', true),
('CUST005', 'Central Clinic', 'US', '+1-555-0500', 'contact@centralclinic.com', '321 Wellness Way, Los Angeles, CA 90001', '321 Wellness Way, Los Angeles, CA 90001', false)
ON CONFLICT (customer_number) DO NOTHING;

-- ===================================
-- Sample Customer Users
-- ===================================
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_users
(email, customer_number, first_name, last_name, phone_number, preferred_language, is_active)
VALUES
('john.smith@memorial.com', 'CUST001', 'John', 'Smith', '+1-555-0101', 'en', true),
('sarah.johnson@citygeneral.com', 'CUST002', 'Sarah', 'Johnson', '+1-555-0201', 'en', true),
('mike.davis@regional.com', 'CUST003', 'Mike', 'Davis', '+1-555-0301', 'en', true),
('emily.brown@university.ca', 'CUST004', 'Emily', 'Brown', '+1-416-555-0401', 'en', true),
('alex.wilson@centralclinic.com', 'CUST005', 'Alex', 'Wilson', '+1-555-0501', 'en', true)
ON CONFLICT (email) DO NOTHING;

-- ===================================
-- Sample Customer Territories
-- ===================================
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_territories
(customer_number, territory)
VALUES
('CUST001', 'US-EAST'),
('CUST002', 'US-EAST'),
('CUST003', 'US-CENTRAL'),
('CUST004', 'CA-CENTRAL'),
('CUST005', 'US-WEST')
ON CONFLICT DO NOTHING;

-- ===================================
-- Sample Items (Medical Equipment)
-- ===================================
INSERT INTO regops_app.tbl_globi_eu_am_99_items
(item_number, item_description, serial_number, lot_number, product_family, product_line, is_serviceable, repairability_status, install_base_status, eligibility_countries)
VALUES
-- Surgical Equipment
('ITEM-SUR-001', 'Advanced Surgical System Model X200', 'SN-2024-001', 'LOT-24A-100', 'Surgical Systems', 'OR Equipment', true, 'FIELD_REPAIR', 'ACTIVE', '["US","CA"]'::jsonb),
('ITEM-SUR-002', 'Minimally Invasive Surgical Tower', 'SN-2024-002', 'LOT-24A-101', 'Surgical Systems', 'OR Equipment', true, 'DEPOT_MEDSURG', 'ACTIVE', '["US","CA","DE","FR"]'::jsonb),
('ITEM-SUR-003', 'Robotic Surgical Assistant Pro', 'SN-2024-003', 'LOT-24A-102', 'Surgical Systems', 'Robotics', true, 'FIELD_REPAIR', 'ACTIVE', '["US","CA"]'::jsonb),
('ITEM-SUR-004', 'Laparoscopic Camera System HD', 'SN-2024-004', 'LOT-24A-103', 'Imaging', 'Visualization', true, 'DEPOT_MEDSURG', 'ACTIVE', '["US","CA","DE","FR","IT","ES"]'::jsonb),
('ITEM-SUR-005', 'Electrosurgical Generator Elite', 'SN-2024-005', 'LOT-24A-104', 'Surgical Systems', 'Energy Devices', true, 'EXCHANGE', 'ACTIVE', '["US","CA"]'::jsonb),

-- Diagnostic Equipment
('ITEM-DIA-001', 'Ultrasound System ProView 5000', 'SN-2024-006', 'LOT-24B-200', 'Diagnostic Imaging', 'Ultrasound', true, 'DEPOT_MEDICAL', 'ACTIVE', '["US","CA","DE","FR","IT"]'::jsonb),
('ITEM-DIA-002', 'Portable X-Ray Unit Mobile Max', 'SN-2024-007', 'LOT-24B-201', 'Diagnostic Imaging', 'Radiology', true, 'FIELD_REPAIR', 'ACTIVE', '["US","CA"]'::jsonb),
('ITEM-DIA-003', 'CT Scanner NextGen 128', 'SN-2024-008', 'LOT-24B-202', 'Diagnostic Imaging', 'CT Imaging', true, 'FIELD_REPAIR', 'ACTIVE', '["US","CA","DE","FR"]'::jsonb),
('ITEM-DIA-004', 'MRI System OptiScan 3.0T', 'SN-2024-009', 'LOT-24B-203', 'Diagnostic Imaging', 'MRI', true, 'FIELD_REPAIR', 'ACTIVE', '["US","CA"]'::jsonb),
('ITEM-DIA-005', 'Digital Mammography System', 'SN-2024-010', 'LOT-24B-204', 'Diagnostic Imaging', 'Mammography', true, 'DEPOT_MEDICAL', 'ACTIVE', '["US","CA","DE","FR","IT","ES"]'::jsonb),

-- Patient Monitoring
('ITEM-MON-001', 'Vital Signs Monitor ProLife 800', 'SN-2024-011', 'LOT-24C-300', 'Patient Monitoring', 'Vital Signs', true, 'EXCHANGE', 'ACTIVE', '["US","CA","DE","FR","IT","ES","NL"]'::jsonb),
('ITEM-MON-002', 'ECG Machine CardioView 12-Lead', 'SN-2024-012', 'LOT-24C-301', 'Patient Monitoring', 'Cardiac', true, 'DEPOT_MEDICAL', 'ACTIVE', '["US","CA"]'::jsonb),
('ITEM-MON-003', 'Blood Pressure Monitor Auto Plus', 'SN-2024-013', 'LOT-24C-302', 'Patient Monitoring', 'Vital Signs', true, 'EXCHANGE', 'ACTIVE', '["US","CA","DE","FR","IT","ES","NL","PT"]'::jsonb),
('ITEM-MON-004', 'Pulse Oximeter Wireless Pro', 'SN-2024-014', 'LOT-24C-303', 'Patient Monitoring', 'Vital Signs', true, 'EXCHANGE', 'ACTIVE', '["US","CA","DE","FR","IT","ES","NL","PT","SE"]'::jsonb),
('ITEM-MON-005', 'Temperature Management System', 'SN-2024-015', 'LOT-24C-304', 'Patient Monitoring', 'Thermal', true, 'DEPOT_MEDICAL', 'ACTIVE', '["US","CA"]'::jsonb),

-- Laboratory Equipment
('ITEM-LAB-001', 'Blood Analyzer Hema-Pro 500', 'SN-2024-016', 'LOT-24D-400', 'Laboratory', 'Hematology', true, 'DEPOT_MEDICAL', 'ACTIVE', '["US","CA","DE","FR"]'::jsonb),
('ITEM-LAB-002', 'Chemistry Analyzer BioScan Plus', 'SN-2024-017', 'LOT-24D-401', 'Laboratory', 'Chemistry', true, 'DEPOT_MEDICAL', 'ACTIVE', '["US","CA"]'::jsonb),
('ITEM-LAB-003', 'Centrifuge MultiSpeed 5000', 'SN-2024-018', 'LOT-24D-402', 'Laboratory', 'Sample Prep', true, 'EXCHANGE', 'ACTIVE', '["US","CA","DE","FR","IT","ES"]'::jsonb),
('ITEM-LAB-004', 'Microscope Digital ProView', 'SN-2024-019', 'LOT-24D-403', 'Laboratory', 'Microscopy', true, 'DEPOT_MEDICAL', 'ACTIVE', '["US","CA","DE","FR","IT"]'::jsonb),
('ITEM-LAB-005', 'PCR Thermal Cycler GenePro', 'SN-2024-020', 'LOT-24D-404', 'Laboratory', 'Molecular', true, 'DEPOT_MEDICAL', 'ACTIVE', '["US","CA"]'::jsonb),

-- Sterilization Equipment
('ITEM-STE-001', 'Autoclave Steam Sterilizer 500L', 'SN-2024-021', 'LOT-24E-500', 'Sterilization', 'Steam', true, 'FIELD_REPAIR', 'ACTIVE', '["US","CA","DE","FR","IT","ES"]'::jsonb),
('ITEM-STE-002', 'Washer Disinfector Medical Grade', 'SN-2024-022', 'LOT-24E-501', 'Sterilization', 'Washing', true, 'FIELD_REPAIR', 'ACTIVE', '["US","CA"]'::jsonb),
('ITEM-STE-003', 'Ultrasonic Cleaner ProClean', 'SN-2024-023', 'LOT-24E-502', 'Sterilization', 'Cleaning', true, 'EXCHANGE', 'ACTIVE', '["US","CA","DE","FR","IT","ES","NL"]'::jsonb),
('ITEM-STE-004', 'Plasma Sterilizer Low Temp', 'SN-2024-024', 'LOT-24E-503', 'Sterilization', 'Plasma', true, 'FIELD_REPAIR', 'ACTIVE', '["US","CA"]'::jsonb),
('ITEM-STE-005', 'Indicator Test Pack System', 'SN-2024-025', 'LOT-24E-504', 'Sterilization', 'Testing', true, 'EXCHANGE', 'ACTIVE', '["US","CA","DE","FR","IT","ES"]'::jsonb)
ON CONFLICT (item_number) DO NOTHING;

-- ===================================
-- Sample Service Requests
-- ===================================

-- Generate request codes for existing country codes
DO $$
DECLARE
    req_id INTEGER;
BEGIN
    -- Request 1: Equipment Malfunction
    INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests (
        request_code, request_type, customer_number, customer_name,
        contact_email, contact_phone, contact_name,
        country_code, territory, serial_number, item_number,
        item_description, product_family, main_reason, sub_reason,
        issue_description, urgency_level, repairability_status,
        status, submitted_by_email, submitted_by_name, submitted_date, language_code
    ) VALUES (
        regops_app.generate_request_code('US'), 'Serial', 'CUST001', 'Memorial Hospital',
        'john.smith@memorial.com', '+1-555-0101', 'John Smith',
        'US', 'US-EAST', 'SN-2024-001', 'ITEM-SUR-001',
        'Advanced Surgical System Model X200', 'Surgical Systems',
        'Equipment Malfunction', 'Equipment Not Responding',
        'The surgical system is not powering on. Checked all connections and power supply, but no response from the unit.',
        'Urgent', 'FIELD_REPAIR',
        'Submitted', 'john.smith@memorial.com', 'John Smith', NOW() - INTERVAL '2 days', 'en'
    ) RETURNING id INTO req_id;

    INSERT INTO regops_app.tbl_globi_eu_am_99_activity_log (request_id, activity_type, activity_description, performed_by)
    VALUES (req_id, 'CREATED', 'Service request created', 'john.smith@memorial.com');

    -- Request 2: Preventive Maintenance
    INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests (
        request_code, request_type, customer_number, customer_name,
        contact_email, contact_phone, contact_name,
        country_code, territory, serial_number, item_number,
        item_description, product_family, main_reason, sub_reason,
        issue_description, urgency_level, repairability_status,
        status, submitted_by_email, submitted_by_name, submitted_date, language_code
    ) VALUES (
        regops_app.generate_request_code('US'), 'Serial', 'CUST002', 'City General Hospital',
        'sarah.johnson@citygeneral.com', '+1-555-0201', 'Sarah Johnson',
        'US', 'US-EAST', 'SN-2024-006', 'ITEM-DIA-001',
        'Ultrasound System ProView 5000', 'Diagnostic Imaging',
        'Preventive Maintenance', 'Scheduled Maintenance Due',
        'Annual preventive maintenance is due for our ultrasound system. Please schedule a service visit.',
        'Normal', 'DEPOT_MEDICAL',
        'In Progress', 'sarah.johnson@citygeneral.com', 'Sarah Johnson', NOW() - INTERVAL '5 days', 'en'
    ) RETURNING id INTO req_id;

    INSERT INTO regops_app.tbl_globi_eu_am_99_activity_log (request_id, activity_type, activity_description, performed_by)
    VALUES
        (req_id, 'CREATED', 'Service request created', 'sarah.johnson@citygeneral.com'),
        (req_id, 'STATUS_CHANGE', 'Status changed from Submitted to In Progress', 'service.tech@stryker.com');

    -- Request 3: Calibration Required
    INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests (
        request_code, request_type, customer_number, customer_name,
        contact_email, contact_phone, contact_name,
        country_code, territory, serial_number, item_number,
        item_description, product_family, main_reason, sub_reason,
        issue_description, urgency_level, repairability_status,
        loaner_required, status, submitted_by_email, submitted_by_name, submitted_date, language_code
    ) VALUES (
        regops_app.generate_request_code('US'), 'Serial', 'CUST003', 'Regional Medical Center',
        'mike.davis@regional.com', '+1-555-0301', 'Mike Davis',
        'US', 'US-CENTRAL', 'SN-2024-011', 'ITEM-MON-001',
        'Vital Signs Monitor ProLife 800', 'Patient Monitoring',
        'Preventive Maintenance', 'Calibration Required',
        'The vital signs monitor needs calibration. Readings seem slightly off compared to our backup unit. Need loaner during service.',
        'Urgent', 'EXCHANGE',
        true, 'Submitted', 'mike.davis@regional.com', 'Mike Davis', NOW() - INTERVAL '1 day', 'en'
    ) RETURNING id INTO req_id;

    INSERT INTO regops_app.tbl_globi_eu_am_99_activity_log (request_id, activity_type, activity_description, performed_by)
    VALUES (req_id, 'CREATED', 'Service request created', 'mike.davis@regional.com');

    -- Request 4: Resolved
    INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests (
        request_code, request_type, customer_number, customer_name,
        contact_email, contact_phone, contact_name,
        country_code, territory, serial_number, item_number,
        item_description, product_family, main_reason, sub_reason,
        issue_description, urgency_level, repairability_status,
        status, submitted_by_email, submitted_by_name, submitted_date, language_code
    ) VALUES (
        regops_app.generate_request_code('CA'), 'Serial', 'CUST004', 'University Hospital',
        'emily.brown@university.ca', '+1-416-555-0401', 'Emily Brown',
        'CA', 'CA-CENTRAL', 'SN-2024-002', 'ITEM-SUR-002',
        'Minimally Invasive Surgical Tower', 'Surgical Systems',
        'Equipment Malfunction', 'Display Issue',
        'Display screen flickering intermittently during procedures.',
        'Critical', 'DEPOT_MEDSURG',
        'Resolved', 'emily.brown@university.ca', 'Emily Brown', NOW() - INTERVAL '10 days', 'en'
    ) RETURNING id INTO req_id;

    INSERT INTO regops_app.tbl_globi_eu_am_99_activity_log (request_id, activity_type, activity_description, performed_by)
    VALUES
        (req_id, 'CREATED', 'Service request created', 'emily.brown@university.ca'),
        (req_id, 'STATUS_CHANGE', 'Status changed from Submitted to In Progress', 'service.tech@stryker.com'),
        (req_id, 'STATUS_CHANGE', 'Status changed from In Progress to Resolved. Display unit replaced.', 'service.tech@stryker.com');

    -- Request 5: Installation
    INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests (
        request_code, request_type, customer_number, customer_name,
        contact_email, contact_phone, contact_name,
        country_code, territory, serial_number, item_number,
        item_description, product_family, main_reason,
        issue_description, urgency_level, repairability_status,
        status, submitted_by_email, submitted_by_name, submitted_date, language_code
    ) VALUES (
        regops_app.generate_request_code('US'), 'Serial', 'CUST005', 'Central Clinic',
        'alex.wilson@centralclinic.com', '+1-555-0501', 'Alex Wilson',
        'US', 'US-WEST', 'SN-2024-021', 'ITEM-STE-001',
        'Autoclave Steam Sterilizer 500L', 'Sterilization',
        'Installation Required',
        'New autoclave delivered. Need installation and staff training.',
        'Normal', 'FIELD_REPAIR',
        'Submitted', 'alex.wilson@centralclinic.com', 'Alex Wilson', NOW(), 'en'
    ) RETURNING id INTO req_id;

    INSERT INTO regops_app.tbl_globi_eu_am_99_activity_log (request_id, activity_type, activity_description, performed_by)
    VALUES (req_id, 'CREATED', 'Service request created', 'alex.wilson@centralclinic.com');

END $$;

-- Display summary
SELECT
    'Data Load Complete' as status,
    (SELECT COUNT(*) FROM regops_app.tbl_globi_eu_am_99_customers) as customers,
    (SELECT COUNT(*) FROM regops_app.tbl_globi_eu_am_99_customer_users) as users,
    (SELECT COUNT(*) FROM regops_app.tbl_globi_eu_am_99_items) as items,
    (SELECT COUNT(*) FROM regops_app.tbl_globi_eu_am_99_service_requests) as requests;
