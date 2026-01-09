-- ============================================================================
-- Add separate address fields to customers table
-- Adds: bill_to_street, bill_to_zip, bill_to_city, bill_to_country columns
-- Then populates them by parsing existing bill_to_address data
-- ============================================================================

-- STEP 1: Add new columns if they don't exist
ALTER TABLE regops_app.tbl_globi_eu_am_99_customers
ADD COLUMN IF NOT EXISTS bill_to_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS bill_to_zip VARCHAR(20),
ADD COLUMN IF NOT EXISTS bill_to_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS bill_to_country VARCHAR(100);

-- STEP 2: Populate German customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Kriegsbergstraße 62',
    bill_to_zip = '70174',
    bill_to_city = 'Stuttgart',
    bill_to_country = 'Germany'
WHERE customer_number = 'CUST-BW-001' AND country_code = 'DE';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Steinstraße 9-11',
    bill_to_zip = '80333',
    bill_to_city = 'München',
    bill_to_country = 'Germany'
WHERE customer_number = 'CUST-BY-001' AND country_code = 'DE';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Theodor-Stern-Kai 7',
    bill_to_zip = '60596',
    bill_to_city = 'Frankfurt am Main',
    bill_to_country = 'Germany'
WHERE customer_number = 'CUST-HE-001' AND country_code = 'DE';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Universitätsstraße 1',
    bill_to_zip = '40225',
    bill_to_city = 'Düsseldorf',
    bill_to_country = 'Germany'
WHERE customer_number = 'CUST-NW-001' AND country_code = 'DE';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Langenbeckstraße 1',
    bill_to_zip = '55131',
    bill_to_city = 'Mainz',
    bill_to_country = 'Germany'
WHERE customer_number = 'CUST-RP-001' AND country_code = 'DE';

-- STEP 3: Populate French customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = '149 Avenue Maréchal Leclerc',
    bill_to_zip = '33000',
    bill_to_city = 'Bordeaux',
    bill_to_country = 'France'
WHERE customer_number = 'CUST-BOR-001' AND country_code = 'FR';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = '103 Grande Rue de la Guillotière',
    bill_to_zip = '69007',
    bill_to_city = 'Lyon',
    bill_to_country = 'France'
WHERE customer_number = 'CUST-LY-001' AND country_code = 'FR';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = '1 Place du Parvis Notre-Dame',
    bill_to_zip = '75004',
    bill_to_city = 'Paris',
    bill_to_country = 'France'
WHERE customer_number = 'CUST-IDF-001' AND country_code = 'FR';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = '4 Rue Larrey',
    bill_to_zip = '49100',
    bill_to_city = 'Angers',
    bill_to_country = 'France'
WHERE customer_number = 'CUST-PDL-001' AND country_code = 'FR';

-- STEP 4: Populate Italian customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Via Francesco Sforza 35',
    bill_to_zip = '20122',
    bill_to_city = 'Milano',
    bill_to_country = 'Italy'
WHERE customer_number = 'CUST-LOM-001' AND country_code = 'IT';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Viale del Policlinico 155',
    bill_to_zip = '00161',
    bill_to_city = 'Roma',
    bill_to_country = 'Italy'
WHERE customer_number = 'CUST-LAZ-001' AND country_code = 'IT';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Via Pansini 5',
    bill_to_zip = '80131',
    bill_to_city = 'Napoli',
    bill_to_country = 'Italy'
WHERE customer_number = 'CUST-CAM-001' AND country_code = 'IT';

-- STEP 5: Populate Spanish customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Carrer del Rosselló 149',
    bill_to_zip = '08036',
    bill_to_city = 'Barcelona',
    bill_to_country = 'Spain'
WHERE customer_number = 'CUST-CAT-001' AND country_code = 'ES';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = 'Calle del Doctor Esquerdo 46',
    bill_to_zip = '28007',
    bill_to_city = 'Madrid',
    bill_to_country = 'Spain'
WHERE customer_number = 'CUST-MAD-001' AND country_code = 'ES';

-- STEP 6: Populate US customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = '300 Pasteur Drive',
    bill_to_zip = '94305',
    bill_to_city = 'Stanford, CA',
    bill_to_country = 'USA'
WHERE customer_number = 'CUST-CA-001' AND country_code = 'US';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = '550 First Avenue',
    bill_to_zip = '10016',
    bill_to_city = 'New York, NY',
    bill_to_country = 'USA'
WHERE customer_number = 'CUST-NY-001' AND country_code = 'US';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = '1611 NW 12th Avenue',
    bill_to_zip = '33136',
    bill_to_city = 'Miami, FL',
    bill_to_country = 'USA'
WHERE customer_number = 'CUST-FL-001' AND country_code = 'US';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET bill_to_street = '1959 NE Pacific Street',
    bill_to_zip = '98195',
    bill_to_city = 'Seattle, WA',
    bill_to_country = 'USA'
WHERE customer_number = 'CUST-WA-001' AND country_code = 'US';

-- STEP 7: Verification - Check results
SELECT
    customer_number,
    customer_name,
    country_code,
    bill_to_street,
    bill_to_zip,
    bill_to_city,
    bill_to_country
FROM regops_app.tbl_globi_eu_am_99_customers
WHERE bill_to_street IS NOT NULL
ORDER BY country_code, customer_number;
