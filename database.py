import psycopg2
import psycopg2.extras
import os
from contextlib import contextmanager
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

def get_connection_string() -> str:
    """
    Get PostgreSQL connection string for Supabase.
    Supports both Supabase and generic PostgreSQL connections.
    """
    # Supabase connection (preferred)
    supabase_url = os.getenv('SUPABASE_DB_URL')
    if supabase_url:
        return supabase_url

    # Generic PostgreSQL connection
    host = os.getenv('POSTGRES_HOST')
    database = os.getenv('POSTGRES_DATABASE')
    user = os.getenv('POSTGRES_USER')
    password = os.getenv('POSTGRES_PASSWORD')
    port = os.getenv('POSTGRES_PORT', '5432')

    if not all([host, database, user, password]):
        raise ValueError("Missing PostgreSQL connection parameters. Set either SUPABASE_DB_URL or (POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD)")

    return f"host={host} port={port} dbname={database} user={user} password={password} sslmode=require"

@contextmanager
def get_db_connection():
    """
    Context manager for PostgreSQL database connections.
    Handles connection, transaction commit/rollback, and cleanup.
    """
    conn = None
    try:
        conn_str = get_connection_string()
        print(f"Attempting PostgreSQL connection to database...")

        conn = psycopg2.connect(conn_str)
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
