# Deployment Guide

## Current Setup

- **Frontend**: Vercel (https://service-request-backend-three.vercel.app)
- **Backend**: Render (your-backend-url.onrender.com)
- **Database**: Supabase PostgreSQL

## Required Environment Variables

### Backend (Render)

Set these in Render Dashboard → Environment:

```
SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:6543/postgres
DEMO_MODE=true
```

### Frontend (Vercel)

Set these in Vercel Dashboard → Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

**IMPORTANT**: After adding `REACT_APP_API_URL` in Vercel, you need to:
1. Go to Vercel Dashboard
2. Deployments → Select latest deployment
3. Click "Redeploy" button
4. This will rebuild frontend with the new environment variable

## Testing the Connection

1. **Check Backend Health**:
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Check if Frontend Can Connect**:
   - Open browser console on your Vercel site
   - Go to Network tab
   - Try to create a new request
   - Look for API calls - they should go to your Render backend, not localhost

## Database Setup

The backend on Render should already have access to Supabase via `SUPABASE_DB_URL`.

To load sample data:
1. SSH into Render or use their console
2. Run: `python3 load_sample_data.py`

Or connect directly to Supabase and run `sample_data.sql`.

## Architecture Flow

```
User Browser
    ↓
Vercel (Frontend - React)
    ↓ (API calls to REACT_APP_API_URL)
Render (Backend - FastAPI)
    ↓ (SQL queries via SUPABASE_DB_URL)
Supabase (PostgreSQL Database)
```

## Troubleshooting

### Frontend shows "API not available, using dummy data"
- Check browser console for CORS errors
- Verify `REACT_APP_API_URL` is set in Vercel
- Verify backend is running on Render
- Make sure you redeployed frontend after adding env var

### Backend can't connect to database
- Check `SUPABASE_DB_URL` in Render
- Verify it uses port 6543 (transaction pooler)
- Test connection: `python3 -c "from database import execute_query; print(execute_query('SELECT 1'))"`

### CORS errors
- Backend should have CORS enabled for Vercel domain
- Check `main.py` has proper CORS middleware configuration
