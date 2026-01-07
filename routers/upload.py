from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from azure.core.exceptions import AzureError
import os
from typing import List
from datetime import datetime, timedelta
from auth import verify_entra_token, TokenData, Roles
from database import execute_query, get_db_connection

router = APIRouter()

BLOB_CONNECTION_STRING = os.getenv("AZURE_BLOB_CONNECTION_STRING")
CONTAINER_NAME = "service-request-attachments"

def get_blob_service_client():
    if not BLOB_CONNECTION_STRING:
        raise HTTPException(500, "Azure Blob Storage not configured")
    return BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)

@router.post("/upload")
async def upload_files(
    request_id: int = Form(...),
    files: List[UploadFile] = File(...),
    token_data: TokenData = Depends(verify_entra_token)
):
    # Verify request access
    request_query = """
        SELECT customer_number, territory
        FROM regops_app.tbl_globi_eu_am_99_service_requests
        WHERE id = %s
    """
    request_result = execute_query(request_query, (request_id,))

    if not request_result:
        raise HTTPException(404, "Request not found")

    request_data = request_result[0]

    # RBAC check
    if token_data.role == Roles.CUSTOMER:
        if request_data['customer_number'] != token_data.customer_number:
            raise HTTPException(403, "Access denied")
    elif token_data.role == Roles.SALES_TECH:
        if request_data['territory'] not in (token_data.territories or []):
            raise HTTPException(403, "Access denied")

    uploaded_files = []
    blob_service = get_blob_service_client()
    container_client = blob_service.get_container_client(CONTAINER_NAME)

    # Ensure container exists
    try:
        container_client.create_container()
    except Exception:
        pass

    allowed_extensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx',
                         '.xls', '.xlsx', '.zip', '.mov', '.mp4', '.avi', '.3gp']

    for file in files:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(400, f"File type {file_ext} not allowed")

        # Check size (25MB)
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > 25 * 1024 * 1024:
            raise HTTPException(400, f"File {file.filename} exceeds 25MB limit")

        # Generate unique blob name
        import uuid
        blob_name = f"{request_id}/{uuid.uuid4()}_{file.filename}"

        try:
            blob_client = container_client.get_blob_client(blob_name)
            blob_client.upload_blob(file.file, overwrite=True)

            # Save to DB
            insert_query = """
                INSERT INTO regops_app.tbl_globi_eu_am_99_attachments
                    (request_id, file_name, blob_path, file_size, content_type, uploaded_date)
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            """
            execute_query(insert_query, (
                request_id, file.filename, blob_name, file_size, file.content_type
            ), fetch=False)

            uploaded_files.append({
                "filename": file.filename,
                "blob_path": blob_name,
                "size": file_size
            })

        except AzureError as e:
            raise HTTPException(500, f"Upload failed: {str(e)}")

    return {"message": f"Uploaded {len(uploaded_files)} files", "files": uploaded_files}

@router.get("/download/{request_id}/{blob_filename}")
def download_file(
    request_id: int,
    blob_filename: str,
    token_data: TokenData = Depends(verify_entra_token)
):
    # Verify access
    request_query = """
        SELECT customer_number, territory
        FROM regops_app.tbl_globi_eu_am_99_service_requests
        WHERE id = %s
    """
    request_result = execute_query(request_query, (request_id,))

    if not request_result:
        raise HTTPException(404, "Request not found")

    request_data = request_result[0]

    # RBAC check
    if token_data.role == Roles.CUSTOMER:
        if request_data['customer_number'] != token_data.customer_number:
            raise HTTPException(403, "Access denied")
    elif token_data.role == Roles.SALES_TECH:
        if request_data['territory'] not in (token_data.territories or []):
            raise HTTPException(403, "Access denied")

    blob_name = f"{request_id}/{blob_filename}"

    sas_token = generate_blob_sas(
        account_name=os.getenv("AZURE_STORAGE_ACCOUNT_NAME"),
        container_name=CONTAINER_NAME,
        blob_name=blob_name,
        account_key=os.getenv("AZURE_STORAGE_ACCOUNT_KEY"),
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=1)
    )

    download_url = f"https://{os.getenv('AZURE_STORAGE_ACCOUNT_NAME')}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}?{sas_token}"

    return {"download_url": download_url}
