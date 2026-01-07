-- Add password field to customer_users table for authentication
-- For PoC: storing plaintext passwords (NEVER do this in production!)
-- In production, use bcrypt or similar to hash passwords

ALTER TABLE regops_app.tbl_globi_eu_am_99_customer_users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add role field
ALTER TABLE regops_app.tbl_globi_eu_am_99_customer_users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Customer';

-- Create 3 demo users with different roles
-- First, ensure we have the customers for these users
INSERT INTO regops_app.tbl_globi_eu_am_99_customers
(customer_number, customer_name, country_code, phone_number, email, bill_to_address, ship_to_address, has_pro_care_contract)
VALUES
('ADMIN', 'Stryker Internal', 'US', '+1-555-0000', 'admin@stryker.com', 'Stryker HQ, Kalamazoo, MI', 'Stryker HQ, Kalamazoo, MI', true),
('SALES', 'Stryker Sales', 'US', '+1-555-0001', 'sales@stryker.com', 'Stryker HQ, Kalamazoo, MI', 'Stryker HQ, Kalamazoo, MI', true),
('COMPANY', 'Sample Company Inc', 'US', '+1-555-0002', 'customer@company.com', '123 Business St, Chicago, IL', '123 Business St, Chicago, IL', false)
ON CONFLICT (customer_number) DO NOTHING;

-- Insert the 3 demo users
INSERT INTO regops_app.tbl_globi_eu_am_99_customer_users
(email, customer_number, first_name, last_name, phone_number, preferred_language, is_active, password_hash, role)
VALUES
('admin@stryker.com', 'ADMIN', 'Admin', 'User', '+1-555-0000', 'en', true, 'admin', 'Admin'),
('sales@stryker.com', 'SALES', 'Sales', 'Tech', '+1-555-0001', 'en', true, 'sales', 'SalesTech'),
('customer@company.com', 'COMPANY', 'Customer', 'User', '+1-555-0002', 'en', true, 'customer', 'Customer')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- Set default password for any existing users
UPDATE regops_app.tbl_globi_eu_am_99_customer_users
SET password_hash = 'demo123'
WHERE password_hash IS NULL;
