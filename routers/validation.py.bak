from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Dict, Any
from pydantic import BaseModel
from auth import verify_entra_token, TokenData
from database import execute_query

router = APIRouter()

class ValidationRequest(BaseModel):
    serial_number: Optional[str] = None
    item_number: Optional[str] = None
    country_code: str

@router.post("/validate/item")
def validate_item(
    request: ValidationRequest,
    token_data: TokenData = Depends(verify_entra_token)
):
    """
    Validate item eligibility and fetch details
    UR-032: Item validation against Salesforce/Install Base
    UR-033: Item Eligibility for Repair Request
    UR-035: Input validation
    """

    if not request.serial_number and not request.item_number:
        raise HTTPException(400, "Either serial_number or item_number is required")

    # Check by Serial Number first (primary input - UR-034)
    if request.serial_number:
        query = """
            SELECT
                ItemNumber,
                ItemDescription,
                SerialNumber,
                LotNumber,
                ProductFamily,
                ProductLine,
                IsServiceable,
                RepairabilityStatus,
                InstallBaseStatus,
                EligibilityCountries
            FROM REGOPS_APP.tbl_globi_eu_am_99_Items
            WHERE SerialNumber = ?
        """
        results = execute_query(query, (request.serial_number,))

        if not results:
            raise HTTPException(404, "Serial number not found in system")

        item = results[0]

    # Check by Item Number (secondary input - UR-034)
    elif request.item_number:
        query = """
            SELECT
                ItemNumber,
                ItemDescription,
                SerialNumber,
                LotNumber,
                ProductFamily,
                ProductLine,
                IsServiceable,
                RepairabilityStatus,
                InstallBaseStatus,
                EligibilityCountries
            FROM REGOPS_APP.tbl_globi_eu_am_99_Items
            WHERE ItemNumber = ?
        """
        results = execute_query(query, (request.item_number,))

        if not results:
            raise HTTPException(404, "Item number not found in system")

        item = results[0]

    # Validate serviceability (UR-028)
    if not item['IsServiceable']:
        raise HTTPException(403, {
            "error": "Item is not serviceable",
            "item": item
        })

    # Validate country eligibility (UR-033)
    import json
    eligible_countries = json.loads(item['EligibilityCountries'] or '[]')

    if request.country_code not in eligible_countries:
        raise HTTPException(403, {
            "error": f"Item is not eligible for service in {request.country_code}",
            "eligible_countries": eligible_countries,
            "item": item
        })

    # Validate install base status (UR-033)
    excluded_statuses = ['DECOMMISSIONED', 'SCRAPPED', 'SOLD']  # TBD by business
    if item['InstallBaseStatus'] in excluded_statuses:
        raise HTTPException(403, {
            "error": f"Item with status '{item['InstallBaseStatus']}' is not eligible for service",
            "item": item
        })

    # Return validated item with all details for autofill (UR-038)
    return {
        "valid": True,
        "item": item,
        "message": "Item is eligible for service request"
    }

@router.get("/validate/customer")
def validate_customer(
    email: str,
    country_code: str,
    token_data: TokenData = Depends(verify_entra_token)
):
    """
    Validate customer and fetch details for autofill
    UR-035: Customer data validation
    UR-038: Field Auto-completion
    """

    # Check if customer exists
    query = """
        SELECT
            cu.Email,
            cu.CustomerNumber,
            cu.FirstName,
            cu.LastName,
            cu.PhoneNumber,
            c.CustomerName,
            c.CountryCode,
            c.BillToAddress,
            c.ShipToAddress,
            c.PhoneNumber as CustomerPhone,
            c.HasProCareContract
        FROM REGOPS_APP.tbl_globi_eu_am_99_CustomerUsers cu
        INNER JOIN REGOPS_APP.tbl_globi_eu_am_99_Customers c ON cu.CustomerNumber = c.CustomerNumber
        WHERE cu.Email = ?
        AND cu.IsActive = 1
        AND c.IsActive = 1
    """

    results = execute_query(query, (email,))

    if not results:
        # Return empty result - will trigger manual entry (UR-039)
        return {
            "found": False,
            "message": "Customer not found in system. Please enter details manually."
        }

    customer = results[0]

    # Validate country match
    if customer['CountryCode'] != country_code:
        raise HTTPException(403, {
            "error": f"Customer is registered in {customer['CountryCode']}, not {country_code}"
        })

    return {
        "found": True,
        "customer": customer,
        "message": "Customer found. Form will be auto-filled."
    }
