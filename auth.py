from fastapi import Depends, HTTPException, status, Header
from typing import Optional
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

TENANT_ID = os.getenv("ENTRA_TENANT_ID")
CLIENT_ID = os.getenv("ENTRA_CLIENT_ID")
CLIENT_SECRET = os.getenv("ENTRA_CLIENT_SECRET")
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"  # Enable demo auth for PoC

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

def verify_entra_token(authorization: Optional[str] = Header(None)) -> TokenData:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

    # Demo mode for PoC - bypass OAuth validation
    if DEMO_MODE and token.startswith("demo-token-"):
        try:
            import base64
            import json
            # Decode demo token to get user data
            user_json = base64.b64decode(token.replace("demo-token-", "")).decode('utf-8')
            user_data = json.loads(user_json)

            email = user_data.get("email", "demo@example.com")
            name = user_data.get("name", "Demo User")
            role = user_data.get("role", Roles.CUSTOMER)
            customer_number = user_data.get("customer_number")
            territories = user_data.get("territories", [])

            return TokenData(
                email=email,
                role=role,
                customer_number=customer_number,
                territories=territories,
                name=name
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid demo token: {str(e)}"
            )

    try:
        graph_url = "https://graph.microsoft.com/v1.0/me"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(graph_url, headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        user_info = response.json()
        email = user_info.get("mail") or user_info.get("userPrincipalName")
        name = user_info.get("displayName")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not extract email from token"
            )
        
        role, customer_number, territories = determine_user_role(email)
        
        return TokenData(
            email=email,
            role=role,
            customer_number=customer_number,
            territories=territories,
            name=name
        )
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )

def determine_user_role(email: str) -> tuple:
    from database import execute_query
    
    # Check TerritoryMappings for SalesTech
    territory_query = "SELECT Territory FROM TerritoryMappings WHERE Email = ?"
    territories = execute_query(territory_query, (email,))
    
    if territories:
        territory_list = [t['Territory'] for t in territories]
        return (Roles.SALES_TECH, None, territory_list)
    
    # Check CustomerUsers for Customer
    try:
        customer_query = "SELECT CustomerNumber FROM CustomerUsers WHERE Email = ?"
        customers = execute_query(customer_query, (email,))
        if customers:
            customer_number = customers[0]['CustomerNumber']
            return (Roles.CUSTOMER, customer_number, None)
    except:
        pass
    
    # Check admin emails from env
    admin_emails = os.getenv("ADMIN_EMAILS", "").split(",")
    if email in admin_emails:
        return (Roles.ADMIN, None, None)
    
    # Check AdminUsers table
    try:
        admin_query = "SELECT Email FROM AdminUsers WHERE Email = ?"
        admins = execute_query(admin_query, (email,))
        if admins:
            return (Roles.ADMIN, None, None)
    except:
        pass
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User not authorized to access this system"
    )

def require_role(allowed_roles: list):
    def role_checker(token_data: TokenData = Depends(verify_entra_token)):
        if token_data.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {allowed_roles}"
            )
        return token_data
    return role_checker