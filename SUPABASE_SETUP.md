# Supabase Setup Instructions

This application now uses **Supabase (PostgreSQL)** instead of Azure SQL Database for easier deployment and no firewall restrictions.

## Why Supabase?

- ✅ **No firewall issues** - works with Render out-of-the-box
- ✅ **Free tier** - 500MB storage, unlimited API requests
- ✅ **PostgreSQL** - powerful, open-source database
- ✅ **Easy setup** - 5 minutes to get started
- ✅ **Auto-backups** - daily backups included

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **Start your project** (sign up with GitHub for free)
3. Click **New Project**
4. Fill in:
   - **Name**: `service-request-db` (or your preferred name)
   - **Database Password**: Create a strong password and **SAVE IT**
   - **Region**: Choose closest to your Render region (e.g., US East for faster connection)
   - **Pricing Plan**: Free
5. Click **Create new project**
6. Wait 2-3 minutes for database to provision

---

## Step 2: Get Database Connection String

1. In your Supabase project, click **Project Settings** (gear icon in left sidebar)
2. Click **Database** in the left menu
3. Scroll to **Connection String** section
4. Select **URI** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password from Step 1

---

## Step 3: Run Database Schema

1. In Supabase Dashboard, click **SQL Editor** in left sidebar
2. Click **New query**
3. Copy the entire contents of `database_schema_postgresql.sql` from this repository
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"
7. Check that tables were created:
   - Click **Table Editor** in left sidebar
   - You should see all tables under the `regops_app` schema

---

## Step 4: Configure Render Environment Variable

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your service: `service-request-backend-1`
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `SUPABASE_DB_URL`
   - **Value**: Your connection string from Step 2 (with password filled in)
   - Click **Save**
6. Render will automatically redeploy with the new variable

---

## Step 5: Verify Connection

After deployment completes:

1. Check Render logs for "Database connection successful!"
2. Visit your API endpoint: `https://your-app.onrender.com/api/countries`
3. You should see a list of countries (from seed data)
4. Check frontend - countries dropdown should now populate

---

## Local Development Setup

To run locally with Supabase:

1. Copy your Supabase connection string
2. Edit `.env` file in project root:
   ```bash
   DEMO_MODE=true
   SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
5. Test: Visit `http://localhost:8000/api/countries`

---

## Database Schema Details

The PostgreSQL schema includes:

### Master Data Tables
- `tbl_globi_eu_am_99_countries` - Country list with 12 countries pre-populated
- `tbl_globi_eu_am_99_languages` - Languages (11 pre-populated)
- `tbl_globi_eu_am_99_legal_documents` - Terms & Conditions, Privacy Policy
- `tbl_globi_eu_am_99_repairability_statuses` - Repair status codes

### Product/Customer Tables
- `tbl_globi_eu_am_99_items` - Products/Equipment catalog
- `tbl_globi_eu_am_99_customers` - Customer master data
- `tbl_globi_eu_am_99_customer_users` - Customer portal users
- `tbl_globi_eu_am_99_customer_territories` - Territory assignments

### Service Request Tables
- `tbl_globi_eu_am_99_service_requests` - Main service requests table
- `tbl_globi_eu_am_99_issue_reasons` - Issue/error codes
- `tbl_globi_eu_am_99_attachments` - File attachments
- `tbl_globi_eu_am_99_activity_log` - Audit trail

### User Management
- `tbl_globi_eu_am_99_territory_mappings` - Sales tech territories
- `tbl_globi_eu_am_99_admin_users` - Admin portal users

---

## Troubleshooting

### Issue: "could not connect to server"
- **Solution**: Check that your connection string password is correct
- Verify the password matches what you set in Step 1

### Issue: "relation does not exist"
- **Solution**: Make sure you ran the schema SQL in Step 3
- Check Table Editor to verify tables exist under `regops_app` schema

### Issue: "SSL connection required"
- **Solution**: Supabase requires SSL - the connection string includes `sslmode=require` by default

### Issue: Countries dropdown still empty
- **Solution**:
  1. Check Render logs for database errors
  2. Verify `SUPABASE_DB_URL` is set in Render environment variables
  3. Make sure seed data was inserted (check SQL Editor for SELECT query)

---

## Supabase Free Tier Limits

- **Storage**: 500 MB (plenty for this app)
- **Database**: 2 GB bandwidth/month
- **Rows**: Unlimited
- **API requests**: Unlimited
- **Backups**: Daily automatic backups, 7-day retention

For this PoC/demo application, the free tier is more than sufficient.

---

## Migration from Azure SQL (Optional)

If you need to migrate data from Azure SQL to Supabase:

1. Export data from Azure SQL using SQL Server Management Studio
2. Convert data types if needed (NVARCHAR → VARCHAR, BIT → BOOLEAN)
3. Import to Supabase using SQL Editor or `psql` command-line tool
4. Or use a migration tool like [pgloader](https://pgloader.io/)

---

## Next Steps

Once your database is connected:

1. ✅ Countries dropdown will work
2. ✅ Intake form can be submitted
3. ✅ Service requests will be saved
4. ✅ Dashboard will show metrics

All without any firewall configuration needed!
