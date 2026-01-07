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
                item_number,
                item_description,
                serial_number,
                lot_number,
                product_family,
                product_line,
                is_serviceable,
                repairability_status,
                install_base_status,
                eligibility_countries
            FROM regops_app.tbl_globi_eu_am_99_items
            WHERE serial_number = %s
        """
        results = execute_query(query, (request.serial_number,))

        if not results:
            raise HTTPException(404, "Serial number not found in system")

        item = results[0]

    # Check by Item Number (secondary input - UR-034)
    elif request.item_number:
        query = """
            SELECT
                item_number,
                item_description,
                serial_number,
                lot_number,
                product_family,
                product_line,
                is_serviceable,
                repairability_status,
                install_base_status,
                eligibility_countries
            FROM regops_app.tbl_globi_eu_am_99_items
            WHERE item_number = %s
        """
        results = execute_query(query, (request.item_number,))

        if not results:
            raise HTTPException(404, "Item number not found in system")

        item = results[0]

    # Validate serviceability (UR-028)
    if not item['is_serviceable']:
        raise HTTPException(403, {
            "error": "Item is not serviceable",
            "item": item
        })

    # Validate country eligibility (UR-033)
    import json
    eligible_countries = json.loads(item['eligibility_countries'] or '[]')

    if request.country_code not in eligible_countries:
        raise HTTPException(403, {
            "error": f"Item is not eligible for service in {request.country_code}",
            "eligible_countries": eligible_countries,
            "item": item
        })

    # Validate install base status (UR-033)
    excluded_statuses = ['DECOMMISSIONED', 'SCRAPPED', 'SOLD']  # TBD by business
    if item['install_base_status'] in excluded_statuses:
        raise HTTPException(403, {
            "error": f"Item with status '{item['install_base_status']}' is not eligible for service",
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
            cu.email,
            cu.customer_number,
            cu.first_name,
            cu.last_name,
            cu.phone_number,
            c.customer_name,
            c.country_code,
            c.bill_to_address,
            c.ship_to_address,
            c.phone_number as CustomerPhone,
            c.has_pro_care_contract
        FROM regops_app.tbl_globi_eu_am_99_customer_users cu
        INNER JOIN regops_app.tbl_globi_eu_am_99_customers c ON cu.customer_number = c.customer_number
        WHERE cu.email = %s
        AND cu.is_active = true
        AND c.is_active = true
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
    if customer['country_code'] != country_code:
        raise HTTPException(403, {
            "error": f"Customer is registered in {customer['country_code']}, not {country_code}"
        })

    return {
        "found": True,
        "customer": customer,
        "message": "Customer found. Form will be auto-filled."
    }
