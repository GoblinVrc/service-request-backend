-- ============================================================================
-- Add address columns to customers table
-- Run this FIRST before updating addresses
-- ============================================================================

-- Add bill_to_address and ship_to_address columns if they don't exist
ALTER TABLE regops_app.tbl_globi_eu_am_99_customers
ADD COLUMN IF NOT EXISTS bill_to_address VARCHAR(500),
ADD COLUMN IF NOT EXISTS ship_to_address VARCHAR(500);
