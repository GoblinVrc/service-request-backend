import pyodbc
import os
from contextlib import contextmanager
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

def get_connection_string() -> str:
    server = os.getenv('AZURE_SQL_SERVER')
    database = os.getenv('AZURE_SQL_DATABASE')
    username = os.getenv('AZURE_SQL_USER')
    password = os.getenv('AZURE_SQL_PASSWORD')
    
    if not all([server, database, username, password]):
        raise ValueError("Missing Azure SQL credentials in environment variables")
    
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
        conn = pyodbc.connect(get_connection_string())
        yield conn
        conn.commit()
    except Exception as e:
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