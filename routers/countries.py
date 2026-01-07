from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from auth import verify_entra_token, TokenData
from database import execute_query

router = APIRouter()

@router.get("/countries")
def get_countries(token_data: TokenData = Depends(verify_entra_token)):
    """
    Get list of active countries
    UR-029: Multi-country support
    """
    query = """
        SELECT country_code, country_name, default_language, supported_languages
        FROM regops_app.tbl_globi_eu_am_99_countries
        WHERE is_active = true
        ORDER BY country_name
    """
    return execute_query(query)

@router.get("/countries/{country_code}/languages")
def get_country_languages(
    country_code: str,
    token_data: TokenData = Depends(verify_entra_token)
):
    """
    Get supported languages for a country
    UR-030: Language support
    """
    query = """
        SELECT l.language_code, l.language_name
        FROM regops_app.tbl_globi_eu_am_99_languages l
        WHERE l.language_code = ANY(
            SELECT jsonb_array_elements_text(c.supported_languages::jsonb)
            FROM regops_app.tbl_globi_eu_am_99_countries c
            WHERE c.country_code = %s
        )
        AND l.is_active = true
    """
    return execute_query(query, (country_code,))

@router.get("/countries/{country_code}/legal")
def get_legal_documents(
    country_code: str,
    language_code: str = 'en',
    token_data: TokenData = Depends(verify_entra_token)
):
    """
    Get Terms & Conditions and Privacy Policy for a country
    UR-031: Terms and Conditions and Privacy Policy
    """
    query = """
        SELECT document_type, document_url, document_content, version, effective_date
        FROM regops_app.tbl_globi_eu_am_99_legal_documents
        WHERE country_code = %s
        AND language_code = %s
        AND is_active = true
    """
    return execute_query(query, (country_code, language_code))
