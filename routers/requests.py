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
            sr.Id, sr.RequestType, sr.CustomerNumber, sr.Territory,
            sr.SerialNumber, sr.LotNumber, sr.ItemNumber,
            sr.MainReason, sr.SubReason, sr.Details, sr.Status,
            sr.SubmittedDate, sr.SubmittedByEmail, sr.ContactEmail, sr.ContactPhone
        FROM REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests sr
        WHERE 1=1
    """
    params = []
    
    # RBAC filtering
    if token_data.role == Roles.CUSTOMER:
        query += " AND sr.CustomerNumber = ?"
        params.append(token_data.customer_number)
    
    elif token_data.role == Roles.SALES_TECH:
        if token_data.territories:
            placeholders = ','.join('?' * len(token_data.territories))
            query += f" AND sr.Territory IN ({placeholders})"
            params.extend(token_data.territories)
        else:
            return []
    
    # Filters
    if status:
        query += " AND sr.Status = ?"
        params.append(status)
    
    if from_date:
        query += " AND sr.SubmittedDate >= ?"
        params.append(from_date)
    
    if to_date:
        query += " AND sr.SubmittedDate <= ?"
        params.append(to_date)
    
    if item_number:
        query += " AND sr.ItemNumber LIKE ?"
        params.append(f"%{item_number}%")
    
    if serial_number:
        query += " AND sr.SerialNumber LIKE ?"
        params.append(f"%{serial_number}%")
    
    query += " ORDER BY sr.SubmittedDate DESC"
    
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
    territory_query = "SELECT TOP 1 Territory FROM REGOPS_APP.tbl_globi_eu_am_99_CustomerTerritories WHERE CustomerNumber = ?"
    territory_result = execute_query(territory_query, (customer_number,))
    territory = territory_result[0]['Territory'] if territory_result else 'UNKNOWN'
    
    # Validation
    if not any([request.serial_number, request.lot_number, request.item_number]):
        raise HTTPException(400, "At least one of serial_number, lot_number, or item_number required")
    
    # Insert
    insert_query = """
        INSERT INTO REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests (
            RequestType, CustomerNumber, Territory, SerialNumber,
            LotNumber, ItemNumber, MainReason, SubReason, Details,
            ContactEmail, ContactPhone, SubmittedByEmail, Status, SubmittedDate
        )
        OUTPUT INSERTED.Id
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', GETUTCDATE())
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
        
        new_id = cursor.fetchone()[0]
        conn.commit()
    
    return {"id": new_id, "status": "created"}

@router.get("/{request_id}")
def get_request_detail(
    request_id: int,
    token_data: TokenData = Depends(verify_entra_token)
):
    query = """
        SELECT sr.*
        FROM REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests sr
        WHERE sr.Id = ?
    """
    
    results = execute_query(query, (request_id,))
    
    if not results:
        raise HTTPException(404, "Request not found")
    
    request = results[0]
    
    # RBAC check
    if token_data.role == Roles.CUSTOMER:
        if request['CustomerNumber'] != token_data.customer_number:
            raise HTTPException(403, "Access denied")
    
    elif token_data.role == Roles.SALES_TECH:
        if request['Territory'] not in (token_data.territories or []):
            raise HTTPException(403, "Access denied")
    
    # Get attachments
    attachments_query = """
        SELECT Id, FileName, BlobPath, FileSize, ContentType, UploadedDate
        FROM REGOPS_APP.tbl_globi_eu_am_99_Attachments
        WHERE RequestId = ?
        ORDER BY UploadedDate DESC
    """
    attachments = execute_query(attachments_query, (request_id,))
    request['attachments'] = attachments
    
    return request

@router.patch("/{request_id}/status")
def update_request_status(
    request_id: int,
    new_status: str,
    token_data: TokenData = Depends(require_role([Roles.SALES_TECH, Roles.ADMIN]))
):
    allowed_statuses = ["Submitted", "In Progress", "Resolved", "Closed", "Cancelled"]
    
    if new_status not in allowed_statuses:
        raise HTTPException(400, f"Invalid status. Allowed: {allowed_statuses}")
    
    # RBAC for SalesTech
    if token_data.role == Roles.SALES_TECH:
        check_query = "SELECT Territory FROM REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests WHERE Id = ?"
        result = execute_query(check_query, (request_id,))
        
        if not result:
            raise HTTPException(404, "Request not found")
        
        if result[0]['Territory'] not in (token_data.territories or []):
            raise HTTPException(403, "Access denied")
    
    # Update
    update_query = """
        UPDATE REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests
        SET Status = ?, LastModifiedDate = GETUTCDATE()
        WHERE Id = ?
    """
    
    rows = execute_query(update_query, (new_status, request_id), fetch=False)
    
    if rows == 0:
        raise HTTPException(404, "Request not found")
    
    return {"message": "Status updated", "new_status": new_status}