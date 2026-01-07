from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from auth import verify_entra_token, TokenData
from database import execute_query, get_db_connection

router = APIRouter()

class ServiceRequestCreate(BaseModel):
    """
    Complete Service Request model based on URS requirements
    UR-037: Mandatory and Non-Mandatory fields
    """
    # Request Type (UR-036)
    request_type: str  # 'Serial', 'Item', 'General'

    # Mandatory fields (UR-037)
    country_code: str
    contact_email: EmailStr
    contact_name: str
    contact_phone: str
    main_reason: str

    # Customer Information (auto-filled or manual)
    customer_number: Optional[str] = None
    customer_name: Optional[str] = None
    site_address: Optional[str] = None

    # Product/Item Information (conditional mandatory based on request_type)
    serial_number: Optional[str] = None
    item_number: Optional[str] = None
    lot_number: Optional[str] = None
    item_description: Optional[str] = None
    product_family: Optional[str] = None

    # Issue Details (UR-040)
    sub_reason: Optional[str] = None
    issue_description: Optional[str] = None

    # Service Details
    requested_service_date: Optional[datetime] = None
    urgency_level: Optional[str] = 'Normal'

    # Additional Services
    loaner_required: bool = False
    loaner_details: Optional[str] = None
    quote_required: bool = False

    # Metadata
    language_code: str = 'en'
    customer_notes: Optional[str] = None

    @validator('request_type')
    def validate_request_type(cls, v):
        if v not in ['Serial', 'Item', 'General']:
            raise ValueError('request_type must be Serial, Item, or General')
        return v

    @validator('urgency_level')
    def validate_urgency(cls, v):
        if v and v not in ['Normal', 'Urgent', 'Critical']:
            raise ValueError('urgency_level must be Normal, Urgent, or Critical')
        return v

@router.post("/intake/submit")
def submit_service_request(
    request: ServiceRequestCreate,
    token_data: TokenData = Depends(verify_entra_token)
):
    """
    Submit a new service request
    UR-045: Request Submission and Confirmation
    UR-044: Generate unique Request ID
    """

    # Validate based on request type (UR-034, UR-036)
    if request.request_type == 'Serial' and not request.serial_number:
        raise HTTPException(400, "Serial number is required for Serial request type")

    if request.request_type == 'Item' and not request.item_number:
        raise HTTPException(400, "Item number is required for Item request type")

    # For General requests, ensure manual fields are provided (UR-039)
    if request.request_type == 'General':
        if not all([request.item_description, request.customer_name]):
            raise HTTPException(400, "Item description and customer name are required for General requests")

    # Generate unique request code (UR-044)
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Call stored procedure to generate request code
        request_code_param = cursor.execute(
            "DECLARE @code NVARCHAR(50); EXEC regops_app.sp_GenerateRequestCode ?, @code OUTPUT; SELECT @code",
            (request.country_code,)
        ).fetchone()[0]

        # Determine repairability status (UR-041)
        repairability_status = None
        if request.serial_number or request.item_number:
            # Auto-assign based on item data
            item_query = """
                SELECT repairability_status
                FROM regops_app.tbl_globi_eu_am_99_items
                WHERE (serial_number = %s OR item_number = %s)
                AND is_serviceable = true
            """
            item_result = execute_query(
                item_query,
                (request.serial_number or '', request.item_number or '')
            )
            if item_result:
                repairability_status = item_result[0]['repairability_status']

        # Determine territory for routing (UR-046)
        territory = None
        if request.customer_number:
            territory_query = """
                SELECT territory
                FROM regops_app.tbl_globi_eu_am_99_customer_territories
                WHERE customer_number = %s
                LIMIT 1
            """
            territory_result = execute_query(territory_query, (request.customer_number,))
            if territory_result:
                territory = territory_result[0]['territory']

        # Insert service request
        insert_query = """
            INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests (
                request_code,
                request_type,
                customer_number,
                customer_name,
                contact_email,
                contact_phone,
                contact_name,
                country_code,
                territory,
                site_address,
                serial_number,
                item_number,
                lot_number,
                item_description,
                product_family,
                main_reason,
                sub_reason,
                issue_description,
                repairability_status,
                requested_service_date,
                urgency_level,
                loaner_required,
                loaner_details,
                quote_required,
                status,
                submitted_by_email,
                submitted_by_name,
                language_code,
                customer_notes
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, 'Submitted', %s, %s, %s, %s
            )
            RETURNING id;
        """

        cursor.execute(insert_query, (
            request_code_param,
            request.request_type,
            request.customer_number,
            request.customer_name,
            request.contact_email,
            request.contact_phone,
            request.contact_name,
            request.country_code,
            territory,
            request.site_address,
            request.serial_number,
            request.item_number,
            request.lot_number,
            request.item_description,
            request.product_family,
            request.main_reason,
            request.sub_reason,
            request.issue_description,
            repairability_status,
            request.requested_service_date,
            request.urgency_level,
            request.loaner_required,
            request.loaner_details,
            request.quote_required,
            token_data.email,
            token_data.name,
            request.language_code,
            request.customer_notes
        ))

        request_id = cursor.fetchone()[0]

        # Log activity
        cursor.execute("""
            INSERT INTO regops_app.tbl_globi_eu_am_99_activity_log (request_id, activity_type, activity_description, performed_by)
            VALUES (%s, 'Created', 'Service request created', %s)
        """, (request_id, token_data.email))

        conn.commit()

    # Return confirmation (UR-045)
    return {
        "success": True,
        "request_id": request_id,
        "request_code": request_code_param,
        "message": f"Service request {request_code_param} has been successfully submitted",
        "next_steps": "Your request has been routed to the appropriate ProCare team and you will receive updates via email."
    }

@router.get("/intake/issue-reasons")
def get_issue_reasons(
    language_code: str = 'en',
    token_data: TokenData = Depends(verify_entra_token)
):
    """
    Get list of issue reasons for dropdown
    UR-040: Repair Error/Issue Description Dropdown List
    """
    query = """
        SELECT main_reason, sub_reason, display_order
        FROM regops_app.tbl_globi_eu_am_99_issue_reasons
        WHERE language_code = %s
        AND is_active = true
        ORDER BY display_order, main_reason, sub_reason
    """

    results = execute_query(query, (language_code,))

    # Group by main_reason
    grouped = {}
    for row in results:
        main = row['main_reason']
        if main not in grouped:
            grouped[main] = []
        if row['sub_reason']:
            grouped[main].append(row['sub_reason'])

    return grouped

@router.get("/intake/repairability-statuses")
def get_repairability_statuses(token_data: TokenData = Depends(verify_entra_token)):
    """
    Get list of repairability statuses
    UR-041: Repairability status types
    """
    query = """
        SELECT StatusCode, StatusName, Description, RepairLocation
        FROM regops_app.tbl_globi_eu_am_99_repairability_statuses
        WHERE is_active = true
        ORDER BY StatusName
    """
    return execute_query(query)
