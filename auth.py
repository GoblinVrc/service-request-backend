from fastapi import Depends, HTTPException, status, Request
from typing import Optional
from pydantic import BaseModel
import base64
import json

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

async def verify_entra_token(request: Request) -> TokenData:
    """
    Simplified authentication for PoC.
    Extracts user data from the Bearer token sent by frontend.
    The token format is: "demo-token-<base64_encoded_user_json>"
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        # No token provided - return anonymous user
        return TokenData(
            email="anonymous@stryker.com",
            role=Roles.CUSTOMER,
            name="Anonymous User",
            customer_number=None,
            territories=None
        )

    # Extract token (remove "Bearer " prefix)
    token = auth_header[7:]

    # Token format: "demo-token-<base64_user_data>"
    if token.startswith("demo-token-"):
        try:
            # Extract base64 part
            base64_data = token[11:]  # Remove "demo-token-" prefix

            # Decode base64
            user_json = base64.b64decode(base64_data).decode('utf-8')

            # Parse JSON
            user_data = json.loads(user_json)

            # Return TokenData with actual user info
            return TokenData(
                email=user_data.get("email", "unknown@stryker.com"),
                role=user_data.get("role", Roles.CUSTOMER),
                name=user_data.get("name", "Unknown User"),
                customer_number=user_data.get("customer_number"),
                territories=user_data.get("territories")
            )
        except Exception as e:
            # If decoding fails, return anonymous user
            print(f"Token decode error: {e}")
            return TokenData(
                email="anonymous@stryker.com",
                role=Roles.CUSTOMER,
                name="Anonymous User",
                customer_number=None,
                territories=None
            )

    # Unknown token format - return anonymous user
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
    async def role_checker(token_data: TokenData = Depends(verify_entra_token)):
        # For PoC, allow all roles
        return token_data
    return role_checker
