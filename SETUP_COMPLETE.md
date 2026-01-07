# Service Request Portal - Setup Complete

## Changes Made

### 1. Database Integration ✅

**Dashboard** now fetches real service requests from PostgreSQL:
- Modified `frontend/src/pages/Dashboard.tsx` to call `/api/requests` endpoint
- Removed dummy data placeholders
- Added proper error handling for API failures

### 2. New Multi-Step Request Form ✅

Created a streamlined **4-step service request form** as requested:

**Location**: `frontend/src/pages/NewRequestForm.tsx`

#### Step 1: Choose Item
- **Autocomplete search** by serial number or item number
- Real-time search using `/api/lookups/serial` and `/api/lookups/item` endpoints
- **Expandable dropdown** showing matching items with details
- Auto-fills item description and product family when selected
- Visual display of selected item information

#### Step 2: Choose Issue Type and Subtype
- Dropdown for main issue type (Equipment Malfunction, Preventive Maintenance, etc.)
- Dynamic sub-issue dropdown that appears based on main selection
- Fetches issue reasons from `/api/intake/issue-reasons`

#### Step 3: Additional Details
- **Issue description** textarea (free text, minimum 10 characters)
- Contact phone number (required)
- Urgency level selector (Normal, Urgent, Critical)
- Requested service date picker
- Checkbox for loaner equipment requirement

#### Step 4: Summary and Submission
- **Review page** showing all entered information organized by section:
  - Item Information
  - Issue Details
  - Contact Information
- Visual urgency badges
- Submit button with loading state
- Success confirmation with request code

### 3. Key Features

✅ **Step-by-step progress indicator** showing current step
✅ **Form validation** at each step before proceeding
✅ **Back/Next navigation** with state preservation
✅ **Item autocomplete** with expandable results list
✅ **Dynamic issue type dropdowns** with hierarchical selection
✅ **Comprehensive review page** before submission
✅ **Real API integration** with PostgreSQL backend
✅ **Professional Stryker-branded styling** with responsive design

### 4. Sample Data

Created `sample_data.sql` with:
- **5 sample customers** (hospitals and clinics)
- **5 customer users** with different contacts
- **25 medical equipment items** across categories:
  - Surgical Systems (5 items)
  - Diagnostic Imaging (5 items)
  - Patient Monitoring (5 items)
  - Laboratory Equipment (5 items)
  - Sterilization Equipment (5 items)
- **5 sample service requests** in various statuses:
  - Equipment malfunction (Submitted, Urgent)
  - Preventive maintenance (In Progress, Normal)
  - Calibration required (Submitted, Urgent, with loaner)
  - Display issue (Resolved, Critical)
  - New installation (Submitted, Normal)

### 5. Routes Updated

- `/dashboard` - Shows all service requests from database
- `/request/new` - New 4-step form (replaced `/intake`)
- Updated navigation in `App.tsx`

## How to Test

### 1. Load Sample Data

```bash
# If you have psql installed
psql $SUPABASE_DB_URL -f sample_data.sql

# Or use Python
python3 -c "
from database import execute_query
with open('sample_data.sql', 'r') as f:
    sql = f.read()
    execute_query(sql)
"
```

### 2. Start Backend

```bash
python3 main.py
# or
uvicorn main:app --reload --port 8000
```

### 3. Start Frontend

```bash
cd frontend
npm install  # if not already installed
npm start
```

### 4. Test the Flow

1. **Login** as a demo user (the app will create a demo session)
2. **Dashboard** should show 5 sample service requests
3. Click **"+ New Service Request"**
4. **Step 1**: Search for "SN-2024" or "ITEM-" to see autocomplete
5. **Step 2**: Select issue type, watch sub-types populate
6. **Step 3**: Fill in details, set urgency, add notes
7. **Step 4**: Review everything, then submit
8. **Success**: Get request code and return to dashboard

## API Endpoints Used

The new form integrates with these backend endpoints:

- `GET /api/lookups/serial?q={term}` - Search by serial number
- `GET /api/lookups/item?q={term}` - Search by item number
- `GET /api/intake/issue-reasons?language_code=en` - Get issue types
- `POST /api/intake/submit` - Submit service request
- `GET /api/requests` - List all requests (Dashboard)

## File Changes Summary

### Modified Files:
- ✏️ `frontend/src/pages/Dashboard.tsx` - Added API call for real data
- ✏️ `frontend/src/App.tsx` - Updated routes to use new form

### New Files:
- ➕ `frontend/src/pages/NewRequestForm.tsx` - 4-step form component
- ➕ `frontend/src/pages/NewRequestForm.css` - Form styling
- ➕ `sample_data.sql` - Sample data for testing

## Database Status

Your PostgreSQL database should now have:
- ✅ Complete schema (countries, languages, customers, items, requests)
- ✅ Master data (11 languages, 12 countries, 5 repairability statuses)
- ✅ Sample operational data (after running `sample_data.sql`)

## Next Steps

1. **Load sample data** using the SQL script
2. **Test the full flow** end-to-end
3. **Customize styling** if needed (colors, fonts, layout)
4. **Add file upload** to Step 3 if required
5. **Connect to real Salesforce/Oracle** data when ready

## Notes

- The form auto-fills contact info from localStorage (demo mode)
- All API calls include proper error handling
- Form validates required fields at each step
- The autocomplete searches both serial numbers and item numbers
- Request codes are generated automatically by PostgreSQL function
- Activity log is maintained for audit trail

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify database connection in `.env`
4. Ensure sample data is loaded properly
