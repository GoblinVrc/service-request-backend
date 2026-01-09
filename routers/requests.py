from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional

from auth import verify_entra_token, require_role, Roles, TokenData
from database import execute_query, get_db_connection

router = APIRouter()

class ServiceRequestCreate(BaseModel):
    request_type: str
    serial_number: Optional[str] = None
    lot_number: Optional[str] = None
    item_number: Optional[str] = None
    main_reason: str
    sub_reason: str
    details: Optional[str] = None
    contact_email: str
    contact_phone: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

@router.get("")
def get_requests(
    token_data: TokenData = Depends(verify_entra_token),
    status: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    item_number: Optional[str] = Query(None),
    serial_number: Optional[str] = Query(None)
):
    query = """
        SELECT
            sr.id, sr.request_code, sr.request_type, sr.customer_number, sr.customer_name,
            sr.country_code, sr.territory_code, sr.serial_number, sr.lot_number, sr.item_number,
            sr.item_description, sr.product_family, sr.main_reason, sr.sub_reason,
            sr.issue_description, sr.status, sr.submitted_date, sr.submitted_by_email,
            sr.submitted_by_name, sr.contact_email, sr.contact_phone, sr.contact_name,
            sr.urgency_level, sr.repairability_status, sr.last_modified_date,
            sr.language_code, sr.site_address, sr.loaner_required, sr.loaner_details,
            sr.quote_required, sr.customer_notes, sr.internal_notes, sr.requested_service_date
        FROM regops_app.tbl_globi_eu_am_99_service_requests sr
        WHERE 1=1
    """
    params = []

    # RBAC filtering based on territories
    # All users (Customer, SalesTech, Admin) filter by their assigned territories
    if not token_data.territories:
        # No territories = no access
        return []

    # Filter by territory
    placeholders = ','.join(['%s'] * len(token_data.territories))
    query += f" AND sr.territory_code IN ({placeholders})"
    params.extend(token_data.territories)

    # Additional filtering for Customer role - only see their own customer's requests
    if token_data.role == Roles.CUSTOMER:
        if not token_data.customer_number:
            raise HTTPException(400, "Customer number not found in authentication token")
        query += " AND sr.customer_number = %s"
        params.append(token_data.customer_number)

    # Filters
    if status:
        query += " AND sr.status = %s"
        params.append(status)

    if from_date:
        query += " AND sr.submitted_date >= %s"
        params.append(from_date)

    if to_date:
        query += " AND sr.submitted_date <= %s"
        params.append(to_date)

    if item_number:
        query += " AND sr.item_number LIKE %s"
        params.append(f"%{item_number}%")

    if serial_number:
        query += " AND sr.serial_number LIKE %s"
        params.append(f"%{serial_number}%")

    query += " ORDER BY sr.submitted_date DESC"

    results = execute_query(query, tuple(params) if params else None)
    return results

@router.post("", status_code=201)
def create_request(
    request: ServiceRequestCreate,
    token_data: TokenData = Depends(verify_entra_token)
):
    if token_data.role != Roles.CUSTOMER:
        raise HTTPException(403, "Only customers can create service requests")

    customer_number = token_data.customer_number
    if not customer_number:
        raise HTTPException(400, "Customer number not found")

    # Get territory
    territory_query = """
        SELECT territory
        FROM regops_app.tbl_globi_eu_am_99_customer_territories
        WHERE customer_number = %s
        LIMIT 1
    """
    territory_result = execute_query(territory_query, (customer_number,))
    territory = territory_result[0]['territory'] if territory_result else 'UNKNOWN'

    # Validation
    if not any([request.serial_number, request.lot_number, request.item_number]):
        raise HTTPException(400, "At least one of serial_number, lot_number, or item_number required")

    # Insert
    insert_query = """
        INSERT INTO regops_app.tbl_globi_eu_am_99_service_requests (
            request_type, customer_number, territory, serial_number,
            lot_number, item_number, main_reason, sub_reason, issue_description,
            contact_email, contact_phone, submitted_by_email, status, submitted_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Submitted', CURRENT_TIMESTAMP)
        RETURNING id
    """

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(insert_query, (
            request.request_type,
            customer_number,
            territory,
            request.serial_number,
            request.lot_number,
            request.item_number,
            request.main_reason,
            request.sub_reason,
            request.details,
            request.contact_email,
            request.contact_phone,
            token_data.email
        ))

        result = cursor.fetchone()
        new_id = result[0] if result else None

        if not new_id:
            raise HTTPException(500, "Failed to create request")

    return {"id": new_id, "status": "created"}

@router.get("/{request_id}")
def get_request_detail(
    request_id: int,
    token_data: TokenData = Depends(verify_entra_token)
):
    query = """
        SELECT sr.*
        FROM regops_app.tbl_globi_eu_am_99_service_requests sr
        WHERE sr.id = %s
    """

    results = execute_query(query, (request_id,))

    if not results:
        raise HTTPException(404, "Request not found")

    request = results[0]

    # RBAC check
    if token_data.role == Roles.CUSTOMER:
        if request['customer_number'] != token_data.customer_number:
            raise HTTPException(403, "Access denied")

    elif token_data.role == Roles.SALES_TECH:
        if request['territory'] not in (token_data.territories or []):
            raise HTTPException(403, "Access denied")

    # Get attachments
    attachments_query = """
        SELECT id, file_name, blob_path, file_size, content_type, uploaded_date
        FROM regops_app.tbl_globi_eu_am_99_attachments
        WHERE request_id = %s
        ORDER BY uploaded_date DESC
    """
    attachments = execute_query(attachments_query, (request_id,))
    request['attachments'] = attachments

    return request

@router.patch("/{request_id}/status")
def update_request_status(
    request_id: int,
    status_update: StatusUpdate,
    token_data: TokenData = Depends(require_role([Roles.SALES_TECH, Roles.ADMIN]))
):
    allowed_statuses = ["Open", "Received", "In Progress", "Repair Completed", "Shipped Back", "Resolved", "Closed"]

    if status_update.status not in allowed_statuses:
        raise HTTPException(400, f"Invalid status. Allowed: {allowed_statuses}")

    # RBAC for SalesTech
    if token_data.role == Roles.SALES_TECH:
        check_query = """
            SELECT territory
            FROM regops_app.tbl_globi_eu_am_99_service_requests
            WHERE id = %s
        """
        result = execute_query(check_query, (request_id,))

        if not result:
            raise HTTPException(404, "Request not found")

        if result[0]['territory'] not in (token_data.territories or []):
            raise HTTPException(403, "Access denied")

    # Update
    update_query = """
        UPDATE regops_app.tbl_globi_eu_am_99_service_requests
        SET status = %s, last_modified_date = CURRENT_TIMESTAMP
        WHERE id = %s
    """

    rows = execute_query(update_query, (status_update.status, request_id), fetch=False)

    if rows == 0:
        raise HTTPException(404, "Request not found")

    return {"message": "Status updated", "new_status": status_update.status}
