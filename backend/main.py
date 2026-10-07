from typing import Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.api.ingest import router as ingest_router

app = FastAPI(title="PIXORA", description="Evidence-Aware Digital Image Forensic Investigation System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_router)

class RootResponse(BaseModel):
    service: str
    status: str
    message: str
    endpoints: Dict[str, str]

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/", response_model=RootResponse)
def root_status():
    return RootResponse(
        service="PIXORA",
        status="operational",
        message="Digital image forensics API is running.",
        endpoints={
            "health": "/api/health",
            "investigate": "/api/investigate",
            "docs": "/docs",
        },
    )

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok", message="IMAGE-TRACE core is running.")
