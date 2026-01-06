from fastapi import APIRouter, Depends
from auth import verify_entra_token, TokenData

router = APIRouter()

@router.get("/me")
def get_current_user(token_data: TokenData = Depends(verify_entra_token)):
    return {
        "email": token_data.email,
        "name": token_data.name,
        "role": token_data.role,
        "customer_number": token_data.customer_number,
        "territories": token_data.territories
    }