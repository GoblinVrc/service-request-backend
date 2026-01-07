from fastapi import Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel

class Roles:
    CUSTOMER = "Customer"
    SALES_TECH = "SalesTech"
    ADMIN = "Admin"

class TokenData(BaseModel):
    email: str
    role: str
    customer_number: Optional[str] = None
    territories: Optional[list] = None
    name: Optional[str] = None

def verify_entra_token() -> TokenData:
    """
    Simplified authentication for PoC.
    In a real application, this would validate JWT tokens or session cookies.
    For now, we return a generic user to allow API access.
    Authentication is handled by the /login endpoint.
    """
    return TokenData(
        email="anonymous@stryker.com",
        role=Roles.CUSTOMER,
        name="Anonymous User",
        customer_number=None,
        territories=None
    )

def require_role(allowed_roles: list):
    """
    Role-based access control decorator.
    Currently disabled for PoC - all users have access.
    """
    def role_checker(token_data: TokenData = Depends(verify_entra_token)):
        # For PoC, allow all roles
        return token_data
    return role_checker
