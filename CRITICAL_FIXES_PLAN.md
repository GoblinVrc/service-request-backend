# Critical Fixes Plan - Service Request Portal

## Status: 2026-01-09

This document tracks critical issues identified in comprehensive review and their resolution status.

---

## PHASE 1: CRITICAL ISSUES (DO NOW)

### ✅ 1. Customer Search Query Fix
**Status:** FIXED (commit 39d5a0f)
- Changed validation.py to JOIN with customer_territories table
- Fixed column references: territory_code → territory

### ⏳ 2. Territory Column Name Standardization
**Status:** IN PROGRESS
**Files to Update:**
- [ ] routers/requests.py (lines 36, 56, 178, 207, 216)
- [ ] routers/intake.py (lines 167, 177, 234)
**Change:** `territory_code` → `territory` everywhere

### ⏳ 3. User Territories Table Name Fix
**Status:** PENDING
**File:** routers/login.py (lines 79-86)
**Change:**
- Table name: `tbl_globi_eu_am_99_user_territories` → `tbl_globi_eu_am_99_territory_mappings`
- Column name: `user_email` → `email`
- Column name: `territory_code` → `territory`

### ⏳ 4. Add Missing Columns to customer_users Table
**Status:** PENDING - Migration needed
**Migration Required:**
```sql
ALTER TABLE regops_app.tbl_globi_eu_am_99_customer_users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Customer';
```

### ⏳ 5. Customer Territory Column Query Fix
**Status:** PENDING
**File:** routers/intake.py (lines 155-157)
**Current:** Queries `territory_code` from customers table
**Fix:** JOIN with customer_territories table to get territory

---

## PHASE 2: HIGH PRIORITY

### 6. TypeScript Interface Sync
**Status:** NEEDS REVIEW
- ServiceRequestCreate interface missing new UR-1121517 fields
- Role constants mismatch (backend: "Customer" vs frontend: 'CUSTOMER')

### 7. Status Values Standardization
**Frontend:** 'Submitted' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled'
**Backend:** "Open", "Received", "In Progress", "Repair Completed", "Shipped Back", "Resolved", "Closed"
**Action:** Sync status enums

### 8. Remove Backup Files
- [ ] frontend/src/components/SubmitRequest.old.tsx
- [ ] frontend/src/components/SubmitRequest.tsx.backup

### 9. Archive Legacy Schema Files
- [ ] database_schema.sql (Azure SQL - deprecated)
- [ ] database_schema_v2.sql
- [ ] Move to /archive/ folder

---

## SECURITY FIXES (DO BEFORE PRODUCTION)

### ⚠️ S1. Remove Anonymous User Fallback
**File:** auth.py (lines 28-35, 78-85)
**Action:** Return 401 Unauthorized instead of defaulting to anonymous

### ⚠️ S2. Implement Password Hashing
**File:** routers/login.py (line 62-67)
**Action:** Use bcrypt instead of plaintext comparison

### ⚠️ S3. Restrict CORS Origins
**File:** main.py (lines 15-24)
**Action:** Set specific allowed origins, never use "*" in production

---

## NOTES

### Column Name Standards
**DECISION:** Use `territory` (not `territory_code`) throughout entire codebase
- Database schema uses `territory`
- JOIN tables use `territory`
- Standardize all router code to match

### Role Constants Format
**DECISION:** Use "Customer", "SalesTech", "Admin" (backend format)
- Update frontend to match backend
- Simpler than converting SCREAMING_SNAKE_CASE

---

## Progress Tracker
- [x] Comprehensive review completed
- [x] Critical issues documented
- [ ] Phase 1 issues resolved
- [ ] Phase 2 issues resolved
- [ ] Security fixes implemented
- [ ] Migration scripts tested
- [ ] Deployment ready
