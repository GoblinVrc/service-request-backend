import psycopg2
import psycopg2.extras
import os
from contextlib import contextmanager
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

def get_connection_string() -> dict:
    """
    Get PostgreSQL connection parameters for Supabase.
    Returns a dictionary of connection parameters.
    """
    # Supabase connection (preferred)
    supabase_url = os.getenv('SUPABASE_DB_URL')
    if supabase_url:
        # Parse the connection URL
        # Format: postgresql://user:password@host:port/database
        import re
        match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', supabase_url)
        if match:
            user, password, host, port, database = match.groups()
            # Force IPv4 to avoid IPv6 network unreachable errors on Render
            return {
                'host': host,
                'port': port,
                'dbname': database,
                'user': user,
                'password': password,
                'sslmode': 'require',
                'connect_timeout': 10
            }
        else:
            raise ValueError("Invalid SUPABASE_DB_URL format. Expected: postgresql://user:password@host:port/database")

    # Generic PostgreSQL connection
    host = os.getenv('POSTGRES_HOST')
    database = os.getenv('POSTGRES_DATABASE')
    user = os.getenv('POSTGRES_USER')
    password = os.getenv('POSTGRES_PASSWORD')
    port = os.getenv('POSTGRES_PORT', '5432')

    if not all([host, database, user, password]):
        raise ValueError("Missing PostgreSQL connection parameters. Set either SUPABASE_DB_URL or (POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD)")

    return {
        'host': host,
        'port': port,
        'dbname': database,
        'user': user,
        'password': password,
        'sslmode': 'require',
        'connect_timeout': 10
    }

@contextmanager
def get_db_connection():
    """
    Context manager for PostgreSQL database connections.
    Handles connection, transaction commit/rollback, and cleanup.
    """
    conn = None
    try:
        conn_params = get_connection_string()
        print(f"Attempting PostgreSQL connection to {conn_params['host']}...")

        conn = psycopg2.connect(**conn_params)
        print("Database connection successful!")

        yield conn
        conn.commit()
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def execute_query(
    query: str,
    params: Optional[tuple] = None,
    fetch: bool = True
) -> List[Dict[str, Any]]:
    """
    Execute a SQL query and return results as list of dictionaries.

    Args:
        query: SQL query string (use %s for parameters, not ?)
        params: Query parameters as tuple
        fetch: Whether to fetch and return results

    Returns:
        List of dictionaries with column names as keys
    """
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        if fetch:
            results = cursor.fetchall()
            # Convert RealDictRow to regular dict and handle datetime serialization
            return [
                {
                    key: value.isoformat() if hasattr(value, 'isoformat') else value
                    for key, value in dict(row).items()
                }
                for row in results
            ]
        else:
            return cursor.rowcount

def execute_scalar(query: str, params: Optional[tuple] = None) -> Any:
    """
    Execute a query and return a single scalar value.

    Args:
        query: SQL query string
        params: Query parameters as tuple

    Returns:
        Single value from first column of first row
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        result = cursor.fetchone()
        return result[0] if result else None
