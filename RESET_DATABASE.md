# Database Reset with German Territory Structure

## Overview

This reset script creates a proper territory-based structure using German Federal States (Bundesländer) as examples.

## New Structure

### Territories
- **16 German Federal States** (Baden-Württemberg, Bayern, Berlin, etc.)
- Identified by ISO codes (DE-BW, DE-BY, DE-BE, etc.)

### Users
**Admin (1):**
- Email: `admin@stryker.com` / Password: `admin123`
- Territories: ALL (has access to all 16 German states)

**SalesTech (4 regional reps):**
- **South Germany** - `sales.south@stryker.com` / `sales123`
  - Territories: Baden-Württemberg, Bayern, Hessen
- **West Germany** - `sales.west@stryker.com` / `sales123`
  - Territories: Nordrhein-Westfalen, Rheinland-Pfalz, Saarland
- **North Germany** - `sales.north@stryker.com` / `sales123`
  - Territories: Berlin, Hamburg, Bremen, Schleswig-Holstein, Niedersachsen
- **East Germany** - `sales.east@stryker.com` / `sales123`
  - Territories: Sachsen, Brandenburg, Thüringen, Sachsen-Anhalt, Mecklenburg-Vorpommern

**Customers (4 hospital staff):**
- `biomedtech@klinikum-stuttgart.de` / `customer123` (Klinikum Stuttgart - Baden-Württemberg)
- `biomed@uniklinik-muenchen.de` / `customer123` (Klinikum München - Bayern)
- `service@charite-berlin.de` / `customer123` (Charité Berlin - Berlin)
- `technik@uniklinik-koeln.de` / `customer123` (Uniklinik Köln - Nordrhein-Westfalen)

### Key Changes

1. **User-Territory Mapping (`tbl_globi_eu_am_99_user_territories`)**:
   - Many-to-many relationship
   - Admin has ALL territories
   - SalesTech have multiple regional territories
   - Customers have their hospital's territory

2. **Service Requests**:
   - Field changed from `territory` to `territory_code`
   - Links to the master territories table
   - 6 sample requests across different territories

3. **RBAC Logic**:
   - All users filter by their assigned territories
   - Customers additionally filter by their customer_number
   - Admin sees all because they have all territories assigned

## How to Run

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `reset_database_with_german_territories.sql`
4. Execute

### Option 2: Via psql Command Line
```bash
psql postgresql://postgres:[password]@[host]:6543/postgres -f reset_database_with_german_territories.sql
```

### Option 3: Via Python Script
```python
from database import get_db_connection

with open('reset_database_with_german_territories.sql', 'r') as f:
    sql = f.read()

with get_db_connection() as conn:
    cursor = conn.cursor()
    cursor.execute(sql)
    conn.commit()
```

## Testing After Reset

1. **Login as Admin**:
   - Should see ALL 6 service requests
   - Territories: All 16 German states

2. **Login as sales.south@stryker.com**:
   - Should see requests from Baden-Württemberg and Bayern territories (4 requests)
   - Territories: DE-BW, DE-BY, DE-HE

3. **Login as biomedtech@klinikum-stuttgart.de**:
   - Should see only Klinikum Stuttgart's request (1 request)
   - Territory: DE-BW only

## Submitting Requests as SalesTech/Admin

When a SalesTech or Admin user submits a request:
1. They need to select which customer they're submitting for
2. The request will be assigned to that customer's territory
3. The `submitted_by_email` will be the SalesTech/Admin's email
4. The customer contact information comes from the selected customer

This allows sales reps to submit requests on behalf of their customers during site visits or support calls.
