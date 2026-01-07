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
        SELECT
            serial_number, item_number, item_description, lot_number
        FROM regops_app.tbl_globi_eu_am_99_items
        WHERE serial_number LIKE %s
        ORDER BY serial_number
        LIMIT 10
    """

    results = execute_query(query, (f"%{q}%",))
    return results

@router.get("/lot")
def lookup_lot(
    q: str = Query(..., min_length=2),
    token_data: TokenData = Depends(verify_entra_token)
):
    query = """
        SELECT
            lot_number, item_number, item_description, COUNT(*) as item_count
        FROM regops_app.tbl_globi_eu_am_99_items
        WHERE lot_number LIKE %s
        GROUP BY lot_number, item_number, item_description
        ORDER BY lot_number
        LIMIT 10
    """

    results = execute_query(query, (f"%{q}%",))
    return results

@router.get("/item")
def lookup_item(
    q: str = Query(..., min_length=2),
    token_data: TokenData = Depends(verify_entra_token)
):
    query = """
        SELECT
            item_number, item_description, COUNT(*) as instance_count
        FROM regops_app.tbl_globi_eu_am_99_items
        WHERE item_number LIKE %s OR item_description LIKE %s
        GROUP BY item_number, item_description
        ORDER BY item_number
        LIMIT 10
    """

    results = execute_query(query, (f"%{q}%", f"%{q}%"))
    return results

@router.get("/reasons")
def get_reasons(token_data: TokenData = Depends(verify_entra_token)):
    query = """
        SELECT main_reason, sub_reason
        FROM regops_app.tbl_globi_eu_am_99_issue_reasons
        ORDER BY main_reason, sub_reason
    """

    results = execute_query(query)

    # Group by main reason
    grouped = {}
    for row in results:
        main = row['main_reason']
        sub = row['sub_reason']

        if main not in grouped:
            grouped[main] = []
        grouped[main].append(sub)

    return grouped
