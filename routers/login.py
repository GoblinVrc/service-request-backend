from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from database import execute_query
from datetime import datetime

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    email: str
    name: str
    customer_number: Optional[str] = None
    role: str
    customer_name: Optional[str] = None
    territories: Optional[List[str]] = None

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """
    Simple email/password authentication for PoC
    Returns user data if credentials are valid
    """

    # Query user from database
    query = """
        SELECT
            cu.email,
            cu.first_name,
            cu.last_name,
            cu.customer_number,
            cu.password_hash,
            cu.is_active,
            cu.role,
            c.customer_name
        FROM regops_app.tbl_globi_eu_am_99_customer_users cu
        LEFT JOIN regops_app.tbl_globi_eu_am_99_customers c
            ON cu.customer_number = c.customer_number
        WHERE cu.email = %s
    """

    result = execute_query(query, (credentials.email,))

    if not result or len(result) == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user = result[0]

    # Check if user is active
    if not user['is_active']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support."
        )

    # Verify password (plaintext for PoC - NEVER do this in production!)
    if user['password_hash'] != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Update last login date
    update_query = """
        UPDATE regops_app.tbl_globi_eu_am_99_customer_users
        SET last_login_date = %s
        WHERE email = %s
    """
    execute_query(update_query, (datetime.now(), credentials.email), fetch=False)

    # Get user territories (all users have territories now)
    territories = None
    territory_query = """
        SELECT territory_code
        FROM regops_app.tbl_globi_eu_am_99_user_territories
        WHERE user_email = %s
    """
    territory_result = execute_query(territory_query, (user['email'],))
    if territory_result:
        territories = [row['territory_code'] for row in territory_result]

    # Return user data
    full_name = f"{user['first_name']} {user['last_name']}".strip()

    return LoginResponse(
        email=user['email'],
        name=full_name or "Unknown User",
        customer_number=user['customer_number'],
        customer_name=user['customer_name'],
        role=user.get('role', 'Customer'),
        territories=territories
    )
