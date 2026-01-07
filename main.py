from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Service Request Portal API",
    description="API for Stryker Service Request Portal",
    version="1.0.0"
)

# CORS - Allow all origins for PoC/Demo (configure ALLOWED_ORIGINS in production)
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = allowed_origins_str.split(",") if allowed_origins_str != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Service Request Portal API",
        "version": "1.0.0",
        "auth": "Entra ID"
    }

@app.get("/health")
def health_check():
    health_status = {
        "api": "ok",
        "database": "unknown",
        "blob_storage": "unknown"
    }
    
    try:
        from database import execute_query
        execute_query("SELECT 1")
        health_status["database"] = "ok"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
    
    try:
        from azure.storage.blob import BlobServiceClient
        blob_conn = os.getenv("AZURE_BLOB_CONNECTION_STRING")
        BlobServiceClient.from_connection_string(blob_conn).list_containers()
        health_status["blob_storage"] = "ok"
    except Exception as e:
        health_status["blob_storage"] = f"error: {str(e)}"
    
    return health_status

from routers import requests, lookups, upload, auth, countries, validation, intake

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(requests.router, prefix="/api/requests", tags=["Requests"])
app.include_router(lookups.router, prefix="/api/lookups", tags=["Lookups"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(countries.router, prefix="/api", tags=["Countries & Languages"])
app.include_router(validation.router, prefix="/api", tags=["Validation"])
app.include_router(intake.router, prefix="/api", tags=["Intake Form"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)