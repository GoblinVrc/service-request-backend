# Service Request Portal - Full Stack Application

Complete Service Request Management System for Stryker ProCare, built according to URS requirements.

## 🏗️ Architecture

```
service-request-backend/
├── Backend (FastAPI)
│   ├── routers/           # API endpoints
│   ├── main.py            # FastAPI app
│   ├── auth.py            # OAuth/Entra ID
│   ├── database.py        # Database connection
│   └── requirements.txt   # Python dependencies
│
├── Frontend (React + TypeScript)
│   ├── src/pages/         # Login, Dashboard, IntakeForm
│   ├── src/services/      # API client
│   ├── src/config/        # MSAL & API config
│   └── package.json
│
├── database_schema.sql    # Complete DB schema
├── Dockerfile             # Backend container
└── README.md
```

## 🚀 Quick Start

### Backend
```bash
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Database
```bash
# Run schema on Azure SQL
sqlcmd -S your-server.database.windows.net -i database_schema.sql
```

## 📋 Environment Variables

### Backend (.env)
```
AZURE_SQL_SERVER=server.database.windows.net
AZURE_SQL_DATABASE=dbname
AZURE_CLIENT_ID=spn-client-id
AZURE_CLIENT_SECRET=spn-secret
AZURE_TENANT_ID=tenant-id
AZURE_BLOB_CONNECTION_STRING=...
ENTRA_CLIENT_ID=app-client-id
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_ENTRA_TENANT_ID=tenant-id
REACT_APP_ENTRA_CLIENT_ID=client-id
REACT_APP_API_URL=http://localhost:8000
```

## ✅ Features (URS Compliance)

- Multi-language support (11 languages)
- OAuth authentication (Microsoft Entra ID)
- Multi-step intake form
- Item validation & auto-fill
- File upload/download
- Role-based access control
- Country-based routing
- Real-time validation

## 🌍 Deployment

**Backend:** Render.com (Docker)
**Frontend:** Vercel/Netlify
**Database:** Azure SQL Server
**Storage:** Azure Blob Storage

## 📚 Documentation

See [database_schema.sql](database_schema.sql) for complete DB schema.
URS requirements: UR-028 through UR-052 implemented.

## 👥 User Roles

- **Customer**: Submit & view own requests
- **Sales Tech**: Manage territory requests
- **Admin**: Full access

---

Built with FastAPI, React, TypeScript, and Azure
© 2025 Stryker Corporation
