#!/usr/bin/env python3
"""
Run SQL migration script on the database
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def run_migration(sql_file):
    """Execute SQL migration file"""
    # Get database URL from environment
    db_url = os.getenv('SUPABASE_DB_URL')

    if not db_url:
        print("Error: SUPABASE_DB_URL not found in environment")
        return False

    try:
        # Read SQL file
        with open(sql_file, 'r') as f:
            sql = f.read()

        # Connect to database
        print(f"Connecting to database...")
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()

        # Execute SQL
        print(f"Executing migration: {sql_file}")
        cursor.execute(sql)

        # Commit changes
        conn.commit()
        print("✓ Migration completed successfully")

        # Close connection
        cursor.close()
        conn.close()

        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python run_migration.py <sql_file>")
        sys.exit(1)

    sql_file = sys.argv[1]

    if not os.path.exists(sql_file):
        print(f"Error: File not found: {sql_file}")
        sys.exit(1)

    success = run_migration(sql_file)
    sys.exit(0 if success else 1)
