# Service Request Portal - Stryker ProCare

Complete Service Request Management System built with FastAPI, React, TypeScript, PostgreSQL (Supabase), and Azure Blob Storage.

## 🏗️ Architecture Overview

```
service-request-backend/
├── Backend (FastAPI + Python)
│   ├── routers/
│   │   ├── auth.py              # Authentication & token management
│   │   ├── login.py             # Demo login endpoint
│   │   ├── requests.py          # Service request CRUD
│   │   ├── intake.py            # Request submission logic
│   │   ├── validation.py        # Item/customer validation & search
│   │   ├── lookups.py           # Serial/lot/item lookups
│   │   ├── countries.py         # Country/language support
│   │   └── upload.py            # File upload/download
│   ├── main.py                  # FastAPI app & CORS config
│   ├── auth.py                  # Token verification & role management
│   ├── database.py              # PostgreSQL connection & query execution
│   └── requirements.txt         # Python dependencies
│
├── Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx           # Service request list view
│   │   │   ├── TicketDetail.tsx        # Request detail view
│   │   │   ├── SubmitRequest.tsx       # Request submission form
│   │   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   │   ├── LoadingModal.tsx        # Global loading indicator
│   │   │   └── *.css                   # Component styles
│   │   ├── services/
│   │   │   └── apiService.ts           # HTTP client with auth
│   │   ├── config/
│   │   │   └── apiConfig.ts            # API endpoints configuration
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces
│   │   ├── TicketingApp.tsx            # Main app component
│   │   └── Login.tsx                   # Login page
│   └── package.json
│
├── database_schema.sql          # PostgreSQL schema (Supabase)
├── update_issue_reasons.sql     # Product-related issue types
├── Dockerfile                   # Backend Docker container
└── README.md
```

## 🚀 Deployment

**Live URLs:**
- **Frontend**: https://service-request-frontend-one.vercel.app
- **Backend**: https://service-request-backend-1.onrender.com
- **Database**: Supabase PostgreSQL
- **Storage**: Azure Blob Storage

## 📋 Environment Variables

### Backend (.env)
```bash
# Database (Supabase PostgreSQL)
SUPABASE_DB_URL=postgresql://user:password@host:port/database

# Azure Blob Storage (for file uploads)
AZURE_BLOB_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_BLOB_CONTAINER_NAME=service-request-attachments

# CORS Configuration
ALLOWED_ORIGINS=https://service-request-frontend-one.vercel.app
```

### Frontend (.env)
```bash
# Backend API URL
REACT_APP_API_URL=https://service-request-backend-1.onrender.com
```

## 🔑 Authentication System

### Demo Authentication (Current Implementation)
- **Token Format**: `demo-token-<base64_encoded_user_data>`
- **UTF-8 Support**: Uses `TextEncoder` for proper encoding of special characters (e.g., "ü" in "Müller")
- **Login Persistence**: Checks localStorage on mount to maintain session across page refreshes

### Demo Users
```javascript
// Admin User
{
  email: "admin@stryker.com",
  name: "Admin User",
  role: "Admin",
  territories: null  // Can see all requests
}

// Sales/Tech User (South Germany)
{
  email: "sales.south@stryker.com",
  name: "Hans Müller",
  role: "SalesTech",
  territories: ["DE-BY", "DE-HE", "DE-BW"]  // Can see requests in these territories
}

// Customer User
{
  email: "customer@hospital.com",
  name: "Customer User",
  role: "Customer",
  customer_number: "CUST001",
  territories: ["DE-BW"]
}
```

### Authentication Flow
1. User logs in with email (no password validation in demo mode)
2. Backend queries `tbl_globi_eu_am_99_customer_users` table
3. Returns user data with role and territories
4. Frontend stores user data in localStorage
5. All API requests include `Authorization: demo-token-<base64_user_data>` header
6. Backend decodes token and applies territory-based filtering

## 🎯 Key Features

### 1. Dashboard
- **Territory-Based Filtering**: Users see only requests in their territories
  - Admin: All requests
  - SalesTech: Requests in assigned territories
  - Customer: Own requests only
- **Sortable Columns**: Sort by date, priority, status
- **Search**: Filter requests by subject
- **Status Badges**: Visual indicators for request status
- **Priority Badges**: Color-coded priority levels
- **Loaner/Quote Icons**: 📦 and 💰 indicators in L/Q column

### 2. Request Submission Form
- **Customer Search** (Admin/SalesTech only):
  - Search by customer name or number
  - Territory filtering for SalesTech
  - Autocomplete dropdown with customer details
- **Item Search**:
  - Search by serial number or item number
  - Autocomplete with item details
  - Auto-population of item description and product family
- **Issue Type Selection**:
  - Product-related categories
  - Dynamic sub-reason dropdown based on main reason
- **Point of Contact**:
  - Name field (prepopulated for customers)
  - Phone number field
- **Loaner/Quote Toggle Cards**:
  - White default state
  - Gold active state with checkmark
  - Visual feedback on click
- **Urgency Levels**: Normal, Urgent, Critical
- **Global Loading Modal**: Semi-transparent overlay during submission

### 3. Request Detail View
- **Header**: Request code, subject, date, PoC name, PoC phone
- **Tabs**: Details, History, Comments
- **Details Tab**:
  - Status and Priority badges
  - Category and Assignee
  - Loaner Required badge (📦 Yes or No)
  - Quote Required badge (💰 Yes or No)
  - Additional Comments section
- **Real-time Data**: Fetches from API instead of mock data
- **Attachments Sidebar**: List of uploaded files

### 4. Sidebar Navigation
- **User Profile**: Shows logged-in user with avatar initial
- **User Data Display**: Name, role, territories
- **Logout Functionality**: Clears localStorage and redirects
- **Mobile Responsive**: Collapses to icons only on screens < 768px
- **Active Indicator**: Shows current selected view

## 📊 Database Schema

### Main Tables

#### `tbl_globi_eu_am_99_service_requests`
Stores all service requests with territory-based routing.
```sql
- id (serial, PK)
- request_code (varchar, unique)
- request_type ('Serial', 'Item', 'General')
- customer_number, customer_name
- contact_email, contact_phone, contact_name
- territory_code (for routing)
- item_number, serial_number, item_description
- main_reason, sub_reason, issue_description
- urgency_level ('Normal', 'Urgent', 'Critical')
- loaner_required (boolean)
- quote_required (boolean)
- status ('Submitted', 'In Progress', 'Resolved', 'Closed', 'Cancelled')
- submitted_by_email, submitted_by_name
- submitted_date, last_modified_date
```

#### `tbl_globi_eu_am_99_customers`
Customer master data with territory assignments.
```sql
- customer_number (varchar, PK)
- customer_name (varchar)
- territory_code (varchar)
- country_code (varchar)
- city (varchar)
- address_line1, address_line2 (varchar)
- postal_code (varchar)
- is_active (boolean)
- created_date (timestamp)
```

#### `tbl_globi_eu_am_99_customer_users`
User accounts with role-based access.
```sql
- id (serial, PK)
- email (varchar, unique)
- customer_number (varchar, FK)
- password_hash (varchar)
- role ('Customer', 'SalesTech', 'Admin')
- is_active (boolean)
- created_date (timestamp)
```

#### `tbl_globi_eu_am_99_user_territories`
Territory assignments for SalesTech users.
```sql
- id (serial, PK)
- user_id (int, FK)
- territory_code (varchar)
- is_active (boolean)
```

#### `tbl_globi_eu_am_99_issue_reasons`
Product-related issue types.
```sql
- id (serial, PK)
- main_reason (varchar)
- sub_reason (varchar)
- language_code (varchar)
- display_order (int)
```

### Issue Types (Product-Related)
1. **Product Performance Issue**
   - Power/Battery Problems
   - Mechanical/Physical Malfunction
   - Software/Firmware Error
   - Display/Screen Issues
   - Audio/Sound Problems

2. **Product Quality Concern**
   - Defective Component
   - Manufacturing Defect
   - Packaging Damage
   - Missing Parts/Accessories

3. **Service & Maintenance Request**
   - Scheduled Maintenance
   - Calibration Needed
   - Cleaning Required
   - Parts Replacement

4. **Technical Support**
   - User Training Required
   - Configuration Assistance
   - Integration Issues
   - Compatibility Questions

5. **Product Documentation**
   - Missing Documentation
   - Technical Specs Request
   - User Manual Clarification
   - Compliance Certificate Request

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - Demo login with email lookup

### Requests
- `GET /api/requests` - List requests (territory-filtered)
- `POST /api/intake/submit` - Submit new request
- `GET /api/intake/issue-reasons` - Get issue types by language

### Validation & Search
- `POST /api/validate/item` - Validate item by serial/item number
- `GET /api/validate/customer` - Validate customer number
- `GET /api/customers/search?query=<term>` - Search customers (Admin/SalesTech)

### Lookups
- `GET /api/lookups/serial?serial=<number>` - Lookup by serial
- `GET /api/lookups/lot?lot=<number>` - Lookup by lot
- `GET /api/lookups/item?item=<number>` - Lookup by item

### Countries & Languages
- `GET /api/countries` - List supported countries
- `GET /api/countries/<code>/languages` - Get country languages

### File Upload/Download
- `POST /api/upload` - Upload attachment
- `GET /api/download/<request_id>/<filename>` - Download attachment

## 🐛 Known Issues & Fixes

### UTF-8 Encoding Issue (RESOLVED)
**Problem**: Users with special characters in names (e.g., "Hans Müller") couldn't see requests.
**Root Cause**: JavaScript's `btoa()` doesn't handle UTF-8 characters properly.
**Solution**:
```typescript
const utf8Bytes = new TextEncoder().encode(user);
const base64 = btoa(String.fromCharCode.apply(null, Array.from(utf8Bytes)));
```

### Customer Search Column Names (RESOLVED)
**Problem**: Endpoint crashed with "column c.phone_number does not exist"
**Root Cause**: Assumed column names didn't match actual database schema
**Solution**: Used correct columns: `city`, `address_line1` (not `phone_number`)

### Login Persistence (RESOLVED)
**Problem**: Page refresh required re-login
**Solution**: Changed `useState(false)` to check localStorage on mount:
```typescript
const [isLoggedIn, setIsLoggedIn] = useState(() => {
  const user = localStorage.getItem('user');
  return !!user;
});
```

## 🚧 Planned Features

### Multi-Step Request Form (IN PROGRESS)
Breaking down submission into 4 steps:

**Step 1: Basic Information**
- For External Customer: Item selection + Issue type
- For Sales/Tech/Admin: Customer selection + Item selection + Issue type

**Step 2: Additional Details**
- Point of Contact (name + phone)
- Urgency level
- Loaner/Quote toggle cards
- Additional comments

**Step 3: File Upload**
- Attach supporting documents
- Multiple file support
- Preview uploaded files

**Step 4: Summary & Confirmation**
- Review all entered data
- Edit capability for each section
- Final submission

**Navigation**:
- Progress indicator at top showing current step
- Back button to return to previous step
- Next button (disabled if current step is invalid)
- Cannot skip steps forward

## 📱 Mobile Responsiveness

- **Sidebar**: Collapses to icon-only view on screens < 768px
- **Dashboard**: Horizontal scroll for table on mobile
- **Forms**: Stack inputs vertically on small screens
- **Modals**: Full-screen on mobile devices

## 🔒 Security Notes

**IMPORTANT**: Current implementation uses demo authentication for PoC purposes.

**Production Requirements**:
- Implement proper OAuth 2.0 / OpenID Connect
- Use Microsoft Entra ID (Azure AD) for authentication
- Hash passwords with bcrypt (minimum 12 rounds)
- Implement CSRF protection
- Add rate limiting on API endpoints
- Validate all inputs server-side
- Implement SQL injection prevention (already using parameterized queries)
- Add XSS protection headers
- Enable HTTPS only
- Implement session management with secure cookies

## 🧪 Testing

### Backend
```bash
# Run backend tests (when implemented)
pytest
```

### Frontend
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] Login as Admin - verify all requests visible
- [ ] Login as SalesTech - verify territory filtering
- [ ] Login as Customer - verify only own requests visible
- [ ] Submit request with special characters (e.g., "Müller")
- [ ] Search customers by name and number
- [ ] Search items by serial and item number
- [ ] Test loaner/quote toggle cards
- [ ] Upload and download attachments
- [ ] Test mobile responsive layout
- [ ] Test page refresh persistence

## 📝 Development Workflow

### Local Development
```bash
# Backend
python main.py  # Runs on http://localhost:8000

# Frontend
cd frontend
npm start  # Runs on http://localhost:3000
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build  # Creates optimized build in build/

# Backend
# Deployed via Docker on Render (automatic from git push)
```

### Git Workflow
```bash
# All changes committed with co-author
git commit -m "Description

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## 👥 User Roles & Permissions

| Feature | Customer | SalesTech | Admin |
|---------|----------|-----------|-------|
| Submit Request | ✅ Own only | ✅ For any customer | ✅ For any customer |
| View Requests | ✅ Own only | ✅ Territory-based | ✅ All requests |
| Search Customers | ❌ | ✅ Territory-based | ✅ All customers |
| Edit Request | ❌ | ✅ Territory-based | ✅ All requests |
| Manage Users | ❌ | ❌ | ✅ |

## 🔄 Recent Changes

### 2025-01-08
- ✅ Fixed customer search endpoint (correct column names)
- ✅ Added loaner/quote icons in Dashboard
- ✅ Enhanced TicketDetail with PoC info and requirement badges
- ✅ Replaced "Description" with "Additional Comments"
- ✅ Integrated real API data in TicketDetail

### 2025-01-07
- ✅ Added customer search for Admin/SalesTech users
- ✅ Fixed UTF-8 encoding for tokens (special characters)
- ✅ Added Point of Contact field to submission form
- ✅ Redesigned loaner/quote as toggle cards
- ✅ Updated issue types to be product-related
- ✅ Added global loading modal with semi-transparent overlay
- ✅ Fixed login persistence across page refreshes
- ✅ Improved sidebar with real user data and logout
- ✅ Made sidebar mobile responsive

## 📧 Support

For questions or issues, contact the development team.

---

**Built with**: FastAPI • React • TypeScript • PostgreSQL (Supabase) • Azure Blob Storage
**Deployed on**: Render (Backend) • Vercel (Frontend)
**© 2025 Stryker Corporation**
