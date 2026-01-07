from fastapi import APIRouter, Query, Depends
from auth import verify_entra_token, TokenData
from database import execute_query

router = APIRouter()

@router.get("/serial")
def lookup_serial(
    q: str = Query(..., min_length=2),
    token_data: TokenData = Depends(verify_entra_token)
):
    query = """
        SELECT TOP 10
            SerialNumber, ItemNumber, ItemDescription, LotNumber
        FROM REGOPS_APP.tbl_globi_eu_am_99_Items
        WHERE SerialNumber LIKE ?
        ORDER BY SerialNumber
    """
    
    results = execute_query(query, (f"%{q}%",))
    return results

@router.get("/lot")
def lookup_lot(
    q: str = Query(..., min_length=2),
    token_data: TokenData = Depends(verify_entra_token)
):
    query = """
        SELECT TOP 10
            LotNumber, ItemNumber, ItemDescription, COUNT(*) as ItemCount
        FROM REGOPS_APP.tbl_globi_eu_am_99_Items
        WHERE LotNumber LIKE ?
        GROUP BY LotNumber, ItemNumber, ItemDescription
        ORDER BY LotNumber
    """
    
    results = execute_query(query, (f"%{q}%",))
    return results

@router.get("/item")
def lookup_item(
    q: str = Query(..., min_length=2),
    token_data: TokenData = Depends(verify_entra_token)
):
    query = """
        SELECT TOP 10
            ItemNumber, ItemDescription, COUNT(*) as InstanceCount
        FROM REGOPS_APP.tbl_globi_eu_am_99_Items
        WHERE ItemNumber LIKE ? OR ItemDescription LIKE ?
        GROUP BY ItemNumber, ItemDescription
        ORDER BY ItemNumber
    """
    
    results = execute_query(query, (f"%{q}%", f"%{q}%"))
    return results

@router.get("/reasons")
def get_reasons(token_data: TokenData = Depends(verify_entra_token)):
    query = """
        SELECT MainReason, SubReason
        FROM REGOPS_APP.tbl_globi_eu_am_99_IssueReasons
        ORDER BY MainReason, SubReason
    """
    
    results = execute_query(query)
    
    # Group by main reason
    grouped = {}
    for row in results:
        main = row['MainReason']
        sub = row['SubReason']
        
        if main not in grouped:
            grouped[main] = []
        grouped[main].append(sub)
    
    return grouped