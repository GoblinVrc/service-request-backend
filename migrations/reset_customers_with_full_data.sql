-- ============================================================================
-- RESET and REPOPULATE customers table with complete address data
-- This script truncates and reloads all customers with bill_to address fields
-- ============================================================================

-- STEP 1: Truncate existing customers
TRUNCATE TABLE regops_app.tbl_globi_eu_am_99_customers CASCADE;

-- STEP 2: Insert German customers with full data
INSERT INTO regops_app.tbl_globi_eu_am_99_customers
(customer_number, customer_name, territory_code, country_code, bill_to_street, bill_to_zip, bill_to_city, bill_to_country, bill_to_address)
VALUES
('CUST-BW-001', 'Klinikum Stuttgart', 'DE-BW', 'DE', 'Kriegsbergstraße 62', '70174', 'Stuttgart', 'Germany', 'Kriegsbergstraße 62, 70174 Stuttgart, Germany'),
('CUST-BY-001', 'Klinikum München', 'DE-BY', 'DE', 'Steinstraße 9-11', '80333', 'München', 'Germany', 'Steinstraße 9-11, 80333 München, Germany'),
('CUST-HE-001', 'Universitätsklinikum Frankfurt', 'DE-HE', 'DE', 'Theodor-Stern-Kai 7', '60596', 'Frankfurt am Main', 'Germany', 'Theodor-Stern-Kai 7, 60596 Frankfurt am Main, Germany'),
('CUST-NW-001', 'Universitätsklinikum Düsseldorf', 'DE-NW', 'DE', 'Universitätsstraße 1', '40225', 'Düsseldorf', 'Germany', 'Universitätsstraße 1, 40225 Düsseldorf, Germany'),
('CUST-RP-001', 'Universitätsmedizin Mainz', 'DE-RP', 'DE', 'Langenbeckstraße 1', '55131', 'Mainz', 'Germany', 'Langenbeckstraße 1, 55131 Mainz, Germany');

-- STEP 3: Insert French customers with full data
INSERT INTO regops_app.tbl_globi_eu_am_99_customers
(customer_number, customer_name, territory_code, country_code, bill_to_street, bill_to_zip, bill_to_city, bill_to_country, bill_to_address)
VALUES
('CUST-BOR-001', 'CHU de Bordeaux', 'FR-BOR', 'FR', '149 Avenue Maréchal Leclerc', '33000', 'Bordeaux', 'France', '149 Avenue Maréchal Leclerc, 33000 Bordeaux, France'),
('CUST-LY-001', 'Hospices Civils de Lyon', 'FR-LY', 'FR', '103 Grande Rue de la Guillotière', '69007', 'Lyon', 'France', '103 Grande Rue de la Guillotière, 69007 Lyon, France'),
('CUST-IDF-001', 'Hôtel-Dieu de Paris', 'FR-IDF', 'FR', '1 Place du Parvis Notre-Dame', '75004', 'Paris', 'France', '1 Place du Parvis Notre-Dame, 75004 Paris, France'),
('CUST-PDL-001', 'CHU d''Angers', 'FR-PDL', 'FR', '4 Rue Larrey', '49100', 'Angers', 'France', '4 Rue Larrey, 49100 Angers, France');

-- STEP 4: Insert Italian customers with full data
INSERT INTO regops_app.tbl_globi_eu_am_99_customers
(customer_number, customer_name, territory_code, country_code, bill_to_street, bill_to_zip, bill_to_city, bill_to_country, bill_to_address)
VALUES
('CUST-LOM-001', 'Ospedale Maggiore Policlinico', 'IT-LOM', 'IT', 'Via Francesco Sforza 35', '20122', 'Milano', 'Italy', 'Via Francesco Sforza 35, 20122 Milano, Italy'),
('CUST-LAZ-001', 'Policlinico Umberto I', 'IT-LAZ', 'IT', 'Viale del Policlinico 155', '00161', 'Roma', 'Italy', 'Viale del Policlinico 155, 00161 Roma, Italy'),
('CUST-CAM-001', 'Azienda Ospedaliera Universitaria Federico II', 'IT-CAM', 'IT', 'Via Pansini 5', '80131', 'Napoli', 'Italy', 'Via Pansini 5, 80131 Napoli, Italy');

-- STEP 5: Insert Spanish customers with full data
INSERT INTO regops_app.tbl_globi_eu_am_99_customers
(customer_number, customer_name, territory_code, country_code, bill_to_street, bill_to_zip, bill_to_city, bill_to_country, bill_to_address)
VALUES
('CUST-CAT-001', 'Hospital Clínic de Barcelona', 'ES-CAT', 'ES', 'Carrer del Rosselló 149', '08036', 'Barcelona', 'Spain', 'Carrer del Rosselló 149, 08036 Barcelona, Spain'),
('CUST-MAD-001', 'Hospital General Universitario Gregorio Marañón', 'ES-MAD', 'ES', 'Calle del Doctor Esquerdo 46', '28007', 'Madrid', 'Spain', 'Calle del Doctor Esquerdo 46, 28007 Madrid, Spain');

-- STEP 6: Insert US customers with full data
INSERT INTO regops_app.tbl_globi_eu_am_99_customers
(customer_number, customer_name, territory_code, country_code, bill_to_street, bill_to_zip, bill_to_city, bill_to_country, bill_to_address)
VALUES
('CUST-CA-001', 'Stanford Health Care', 'US-CA', 'US', '300 Pasteur Drive', '94305', 'Stanford, CA', 'USA', '300 Pasteur Drive, Stanford, CA 94305, USA'),
('CUST-NY-001', 'NYU Langone Health', 'US-NY', 'US', '550 First Avenue', '10016', 'New York, NY', 'USA', '550 First Avenue, New York, NY 10016, USA'),
('CUST-FL-001', 'Jackson Memorial Hospital', 'US-FL', 'US', '1611 NW 12th Avenue', '33136', 'Miami, FL', 'USA', '1611 NW 12th Avenue, Miami, FL 33136, USA'),
('CUST-WA-001', 'UW Medical Center', 'US-WA', 'US', '1959 NE Pacific Street', '98195', 'Seattle, WA', 'USA', '1959 NE Pacific Street, Seattle, WA 98195, USA');

-- STEP 7: Verification - Check all customers
SELECT
    customer_number,
    customer_name,
    territory_code,
    country_code,
    bill_to_street,
    bill_to_zip,
    bill_to_city,
    bill_to_country
FROM regops_app.tbl_globi_eu_am_99_customers
ORDER BY country_code, customer_number;
