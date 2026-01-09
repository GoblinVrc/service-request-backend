-- ============================================================================
-- Migration: Add addresses to existing customers
-- Date: 2026-01-09
-- Description: Update customer data with bill-to and ship-to addresses
-- ============================================================================

BEGIN;

-- Update German customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Kriegsbergstraße 62, 70174 Stuttgart, Germany',
    ship_to_address = 'Kriegsbergstraße 62, 70174 Stuttgart, Germany'
WHERE customer_number = 'CUST-BW-001' AND country_code = 'DE';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Steinstraße 9-11, 80333 München, Germany',
    ship_to_address = 'Steinstraße 9-11, 80333 München, Germany'
WHERE customer_number = 'CUST-BY-001' AND country_code = 'DE';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Theodor-Stern-Kai 7, 60596 Frankfurt am Main, Germany',
    ship_to_address = 'Theodor-Stern-Kai 7, 60596 Frankfurt am Main, Germany'
WHERE customer_number = 'CUST-HE-001' AND country_code = 'DE';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Universitätsstraße 1, 40225 Düsseldorf, Germany',
    ship_to_address = 'Universitätsstraße 1, 40225 Düsseldorf, Germany'
WHERE customer_number = 'CUST-NW-001' AND country_code = 'DE';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Langenbeckstraße 1, 55131 Mainz, Germany',
    ship_to_address = 'Langenbeckstraße 1, 55131 Mainz, Germany'
WHERE customer_number = 'CUST-RP-001' AND country_code = 'DE';

-- Update French customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = '149 Avenue Maréchal Leclerc, 33000 Bordeaux, France',
    ship_to_address = '149 Avenue Maréchal Leclerc, 33000 Bordeaux, France'
WHERE customer_number = 'CUST-BOR-001' AND country_code = 'FR';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = '103 Grande Rue de la Guillotière, 69007 Lyon, France',
    ship_to_address = '103 Grande Rue de la Guillotière, 69007 Lyon, France'
WHERE customer_number = 'CUST-LY-001' AND country_code = 'FR';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = '1 Place du Parvis Notre-Dame, 75004 Paris, France',
    ship_to_address = '1 Place du Parvis Notre-Dame, 75004 Paris, France'
WHERE customer_number = 'CUST-IDF-001' AND country_code = 'FR';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = '4 Rue Larrey, 49100 Angers, France',
    ship_to_address = '4 Rue Larrey, 49100 Angers, France'
WHERE customer_number = 'CUST-PDL-001' AND country_code = 'FR';

-- Update Italian customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Via Francesco Sforza 35, 20122 Milano, Italy',
    ship_to_address = 'Via Francesco Sforza 35, 20122 Milano, Italy'
WHERE customer_number = 'CUST-LOM-001' AND country_code = 'IT';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Viale del Policlinico 155, 00161 Roma, Italy',
    ship_to_address = 'Viale del Policlinico 155, 00161 Roma, Italy'
WHERE customer_number = 'CUST-LAZ-001' AND country_code = 'IT';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Via Pansini 5, 80131 Napoli, Italy',
    ship_to_address = 'Via Pansini 5, 80131 Napoli, Italy'
WHERE customer_number = 'CUST-CAM-001' AND country_code = 'IT';

-- Update Spanish customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Carrer del Rosselló 149, 08036 Barcelona, Spain',
    ship_to_address = 'Carrer del Rosselló 149, 08036 Barcelona, Spain'
WHERE customer_number = 'CUST-CAT-001' AND country_code = 'ES';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = 'Calle del Doctor Esquerdo 46, 28007 Madrid, Spain',
    ship_to_address = 'Calle del Doctor Esquerdo 46, 28007 Madrid, Spain'
WHERE customer_number = 'CUST-MAD-001' AND country_code = 'ES';

-- Update US customers
UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = '300 Pasteur Drive, Stanford, CA 94305, USA',
    ship_to_address = '300 Pasteur Drive, Stanford, CA 94305, USA'
WHERE customer_number = 'CUST-CA-001' AND country_code = 'US';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = '550 First Avenue, New York, NY 10016, USA',
    ship_to_address = '550 First Avenue, New York, NY 10016, USA'
WHERE customer_number = 'CUST-NY-001' AND country_code = 'US';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = '1611 NW 12th Avenue, Miami, FL 33136, USA',
    ship_to_address = '1611 NW 12th Avenue, Miami, FL 33136, USA'
WHERE customer_number = 'CUST-FL-001' AND country_code = 'US';

UPDATE regops_app.tbl_globi_eu_am_99_customers
SET
    bill_to_address = '1959 NE Pacific Street, Seattle, WA 98195, USA',
    ship_to_address = '1959 NE Pacific Street, Seattle, WA 98195, USA'
WHERE customer_number = 'CUST-WA-001' AND country_code = 'US';

COMMIT;

-- ============================================================================
-- Verification query
-- ============================================================================
-- SELECT customer_number, customer_name, country_code, bill_to_address
-- FROM regops_app.tbl_globi_eu_am_99_customers
-- WHERE bill_to_address IS NOT NULL
-- ORDER BY country_code, customer_number;
