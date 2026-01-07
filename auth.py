from fastapi import Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

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
    Always returns demo admin user.
    """
    if DEMO_MODE:
        return TokenData(
            email="demo@stryker.com",
            role=Roles.ADMIN,
            name="Demo User",
            customer_number=None,
            territories=None
        )

    # For production, implement real authentication here
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentication not implemented. Enable DEMO_MODE for PoC."
    )

def require_role(allowed_roles: list):
    """
    Role-based access control decorator.
    Currently disabled for PoC - all users are admins.
    """
    def role_checker(token_data: TokenData = Depends(verify_entra_token)):
        if not DEMO_MODE and token_data.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {allowed_roles}"
            )
        return token_data
    return role_checker
