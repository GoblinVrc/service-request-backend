-- ============================================================================
-- Migration: Add new fields for comprehensive repair form
-- Date: 2026-01-09
-- Description: Adds mandatory and optional fields based on UR-1121517
-- ============================================================================

BEGIN;

-- Add Ship-To Address fields (4-field structure per UR-1121517)
ALTER TABLE regops_app.tbl_globi_eu_am_99_service_requests
    ADD COLUMN IF NOT EXISTS ship_to_street VARCHAR(200),
    ADD COLUMN IF NOT EXISTS ship_to_zip VARCHAR(20),
    ADD COLUMN IF NOT EXISTS ship_to_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS ship_to_country VARCHAR(10);

-- Add Alternative Billing Address fields (optional)
ALTER TABLE regops_app.tbl_globi_eu_am_99_service_requests
    ADD COLUMN IF NOT EXISTS alternative_billing_street VARCHAR(200),
    ADD COLUMN IF NOT EXISTS alternative_billing_zip VARCHAR(20),
    ADD COLUMN IF NOT EXISTS alternative_billing_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS alternative_billing_country VARCHAR(10);

-- Add Safety/Patient Involvement fields (MANDATORY)
ALTER TABLE regops_app.tbl_globi_eu_am_99_service_requests
    ADD COLUMN IF NOT EXISTS safety_patient_involved BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS safety_patient_details TEXT;

-- Add Pickup Date/Time fields (MANDATORY)
ALTER TABLE regops_app.tbl_globi_eu_am_99_service_requests
    ADD COLUMN IF NOT EXISTS pickup_date DATE,
    ADD COLUMN IF NOT EXISTS pickup_time TIME;

-- Add PO Reference and Customer Ident Code (MANDATORY)
ALTER TABLE regops_app.tbl_globi_eu_am_99_service_requests
    ADD COLUMN IF NOT EXISTS po_reference_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS customer_ident_code VARCHAR(100);

-- Add Optional fields
ALTER TABLE regops_app.tbl_globi_eu_am_99_service_requests
    ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS contract_info VARCHAR(200),
    ADD COLUMN IF NOT EXISTS loaner_fee_approval BOOLEAN DEFAULT false;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_service_requests_po_reference
    ON regops_app.tbl_globi_eu_am_99_service_requests(po_reference_number);

CREATE INDEX IF NOT EXISTS idx_service_requests_customer_ident
    ON regops_app.tbl_globi_eu_am_99_service_requests(customer_ident_code);

CREATE INDEX IF NOT EXISTS idx_service_requests_pickup_date
    ON regops_app.tbl_globi_eu_am_99_service_requests(pickup_date);

-- Add comments for documentation
COMMENT ON COLUMN regops_app.tbl_globi_eu_am_99_service_requests.ship_to_street
    IS 'Ship-to address street and number';
COMMENT ON COLUMN regops_app.tbl_globi_eu_am_99_service_requests.safety_patient_involved
    IS 'MANDATORY: Indicates if safety or patient was involved in the issue';
COMMENT ON COLUMN regops_app.tbl_globi_eu_am_99_service_requests.pickup_date
    IS 'MANDATORY: Preferred date for equipment pickup';
COMMENT ON COLUMN regops_app.tbl_globi_eu_am_99_service_requests.pickup_time
    IS 'MANDATORY: Preferred time for equipment pickup';
COMMENT ON COLUMN regops_app.tbl_globi_eu_am_99_service_requests.po_reference_number
    IS 'MANDATORY: Customer Purchase Order reference number';
COMMENT ON COLUMN regops_app.tbl_globi_eu_am_99_service_requests.customer_ident_code
    IS 'MANDATORY: Customer identification code';

COMMIT;

-- ============================================================================
-- Rollback script (commented out - uncomment to rollback)
-- ============================================================================
/*
BEGIN;

ALTER TABLE regops_app.tbl_globi_eu_am_99_service_requests
    DROP COLUMN IF EXISTS ship_to_street,
    DROP COLUMN IF EXISTS ship_to_zip,
    DROP COLUMN IF EXISTS ship_to_city,
    DROP COLUMN IF EXISTS ship_to_country,
    DROP COLUMN IF EXISTS alternative_billing_street,
    DROP COLUMN IF EXISTS alternative_billing_zip,
    DROP COLUMN IF EXISTS alternative_billing_city,
    DROP COLUMN IF EXISTS alternative_billing_country,
    DROP COLUMN IF EXISTS safety_patient_involved,
    DROP COLUMN IF EXISTS safety_patient_details,
    DROP COLUMN IF EXISTS pickup_date,
    DROP COLUMN IF EXISTS pickup_time,
    DROP COLUMN IF EXISTS po_reference_number,
    DROP COLUMN IF EXISTS customer_ident_code,
    DROP COLUMN IF EXISTS preferred_contact_method,
    DROP COLUMN IF EXISTS contract_info,
    DROP COLUMN IF EXISTS loaner_fee_approval;

DROP INDEX IF EXISTS regops_app.idx_service_requests_po_reference;
DROP INDEX IF EXISTS regops_app.idx_service_requests_customer_ident;
DROP INDEX IF EXISTS regops_app.idx_service_requests_pickup_date;

COMMIT;
*/
