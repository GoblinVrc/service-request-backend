# Render Setup Instructions

## Database Configuration

The application requires Azure SQL Database connection. You must configure the following environment variables in your Render Dashboard.

### Required Environment Variables

Go to your Render service → **Environment** tab and add these variables:

1. **AZURE_SQL_SERVER**
   - Value: Your Azure SQL Server hostname (e.g., `your-server.database.windows.net`)
   - Type: Secret

2. **AZURE_SQL_DATABASE**
   - Value: Your database name (e.g., `service_request_db`)
   - Type: Secret

3. **AZURE_SQL_USER**
   - Value: Your SQL username
   - Type: Secret

4. **AZURE_SQL_PASSWORD**
   - Value: Your SQL password
   - Type: Secret

### How to Add Environment Variables in Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your service: `service-request-backend-1`
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. For each variable:
   - Enter the **Key** (e.g., `AZURE_SQL_SERVER`)
   - Enter the **Value** (your actual database credentials)
   - Click **Save Changes**
6. After adding all 4 variables, click **Manual Deploy** → **Deploy latest commit**

### Verify Connection

After deployment:
1. Check the service logs for any connection errors
2. Visit `https://your-app.onrender.com/api/countries` to test if data loads
3. The countries dropdown in the intake form should now populate

### Database Schema

Make sure your Azure SQL Database has the schema created using:
- `database_schema_v2.sql`

The schema includes:
- REGOPS_APP schema
- tbl_globi_eu_am_99_Countries table with seed data
- tbl_globi_eu_am_99_Languages table with seed data
- All other required tables

### Troubleshooting

**Countries dropdown is empty:**
- Check Render logs for database connection errors
- Verify all 4 environment variables are set correctly
- Ensure Azure SQL firewall allows Render IP addresses
- Check that seed data was inserted (see database_schema_v2.sql)

**Connection timeout:**
- Azure SQL Server firewall must allow connections from `0.0.0.0/0` (all IPs)
- Or add Render's outbound IP addresses to firewall rules
