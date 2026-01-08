-- Update issue reasons with product-related categories

DELETE FROM regops_app.tbl_globi_eu_am_99_issue_reasons WHERE language_code = 'en';

INSERT INTO regops_app.tbl_globi_eu_am_99_issue_reasons (main_reason, sub_reason, language_code, display_order) VALUES
-- Product Performance Issues
('Product Performance Issue', 'Power/Battery Problems', 'en', 1),
('Product Performance Issue', 'Mechanical/Physical Malfunction', 'en', 2),
('Product Performance Issue', 'Software/Firmware Error', 'en', 3),
('Product Performance Issue', 'Display/Screen Issues', 'en', 4),
('Product Performance Issue', 'Audio/Sound Problems', 'en', 5),

-- Product Quality Concerns
('Product Quality Concern', 'Defective Component', 'en', 10),
('Product Quality Concern', 'Manufacturing Defect', 'en', 11),
('Product Quality Concern', 'Packaging Damage', 'en', 12),
('Product Quality Concern', 'Missing Parts/Accessories', 'en', 13),

-- Service & Maintenance
('Service & Maintenance Request', 'Scheduled Maintenance', 'en', 20),
('Service & Maintenance Request', 'Calibration Needed', 'en', 21),
('Service & Maintenance Request', 'Cleaning Required', 'en', 22),
('Service & Maintenance Request', 'Parts Replacement', 'en', 23),

-- Technical Support
('Technical Support', 'User Training Required', 'en', 30),
('Technical Support', 'Configuration Assistance', 'en', 31),
('Technical Support', 'Integration Issues', 'en', 32),
('Technical Support', 'Compatibility Questions', 'en', 33),

-- Product Documentation
('Product Documentation', 'Missing Documentation', 'en', 40),
('Product Documentation', 'Technical Specs Request', 'en', 41),
('Product Documentation', 'User Manual Clarification', 'en', 42),
('Product Documentation', 'Compliance Certificate Request', 'en', 43);
