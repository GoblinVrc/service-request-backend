-- ============================================================================
-- INSPECT ACTUAL DATABASE SCHEMA
-- Run this in Supabase SQL Editor to see actual table structures
-- ============================================================================

-- 1. List all tables in regops_app schema
SELECT
    '=== TABLE: ' || table_name || ' ===' as info
FROM information_schema.tables
WHERE table_schema = 'regops_app'
ORDER BY table_name;

-- 2. Get detailed column information for each table
SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'regops_app'
ORDER BY table_name, ordinal_position;

-- 3. Specifically check the territory-related tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'regops_app'
AND (table_name LIKE '%territory%' OR table_name LIKE '%user%')
ORDER BY table_name, ordinal_position;

-- 4. Check customer table columns
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'regops_app'
AND table_name = 'tbl_globi_eu_am_99_customers'
ORDER BY ordinal_position;

-- 5. Check customer_territories table
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'regops_app'
AND table_name = 'tbl_globi_eu_am_99_customer_territories'
ORDER BY ordinal_position;
