import pyodbc
import os
from contextlib import contextmanager
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

def get_connection_string() -> str:
    server = os.getenv('AZURE_SQL_SERVER')
    database = os.getenv('AZURE_SQL_DATABASE')

    if not all([server, database]):
        raise ValueError("Missing AZURE_SQL_SERVER or AZURE_SQL_DATABASE in environment variables")

    # Check if using Service Principal (SPN) authentication
    client_id = os.getenv('AZURE_CLIENT_ID')
    client_secret = os.getenv('AZURE_CLIENT_SECRET')
    tenant_id = os.getenv('AZURE_TENANT_ID')

    # If SPN credentials provided, use Azure AD authentication
    if all([client_id, client_secret, tenant_id]):
        return (
            f"Driver={{ODBC Driver 18 for SQL Server}};"
            f"Server=tcp:{server},1433;"
            f"Database={database};"
            f"Authentication=ActiveDirectoryServicePrincipal;"
            f"Uid={client_id};"
            f"Pwd={client_secret};"
            f"Encrypt=yes;"
            f"TrustServerCertificate=no;"
            f"Connection Timeout=30;"
        )

    # Otherwise use SQL authentication
    username = os.getenv('AZURE_SQL_USER')
    password = os.getenv('AZURE_SQL_PASSWORD')

    if not all([username, password]):
        raise ValueError("Missing credentials: Either provide (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID) for SPN auth OR (AZURE_SQL_USER, AZURE_SQL_PASSWORD) for SQL auth")

    return (
        f"Driver={{ODBC Driver 18 for SQL Server}};"
        f"Server=tcp:{server},1433;"
        f"Database={database};"
        f"Uid={username};"
        f"Pwd={password};"
        f"Encrypt=yes;"
        f"TrustServerCertificate=no;"
        f"Connection Timeout=30;"
    )

@contextmanager
def get_db_connection():
    conn = None
    try:
        conn_str = get_connection_string()
        # Log connection attempt (hide secrets)
        import re
        safe_conn_str = re.sub(r'(Pwd|Password)=[^;]+', r'\1=***', conn_str)
        print(f"Attempting connection with: {safe_conn_str}")

        conn = pyodbc.connect(get_connection_string())
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
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch:
            columns = [column[0] for column in cursor.description]
            results = []
            for row in cursor.fetchall():
                row_dict = {}
                for i, column in enumerate(columns):
                    value = row[i]
                    if hasattr(value, 'isoformat'):
                        value = value.isoformat()
                    row_dict[column] = value
                results.append(row_dict)
            return results
        else:
            return cursor.rowcount

def execute_scalar(query: str, params: Optional[tuple] = None) -> Any:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        result = cursor.fetchone()
        return result[0] if result else None