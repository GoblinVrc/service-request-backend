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
        SELECT CountryCode, CountryName, DefaultLanguage, SupportedLanguages
        FROM REGOPS_APP.tbl_globi_eu_am_99_Countries
        WHERE IsActive = 1
        ORDER BY CountryName
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
        SELECT LanguageCode, LanguageName
        FROM REGOPS_APP.tbl_globi_eu_am_99_Languages
        WHERE LanguageCode IN (
            SELECT value
            FROM REGOPS_APP.tbl_globi_eu_am_99_Countries
            CROSS APPLY OPENJSON(SupportedLanguages)
            WHERE CountryCode = ?
        )
        AND IsActive = 1
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
        SELECT DocumentType, DocumentURL, DocumentContent, Version, EffectiveDate
        FROM REGOPS_APP.tbl_globi_eu_am_99_LegalDocuments
        WHERE CountryCode = ?
        AND LanguageCode = ?
        AND IsActive = 1
    """
    return execute_query(query, (country_code, language_code))
