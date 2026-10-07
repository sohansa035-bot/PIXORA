"""
Test for PIXORA Digital Image Forensics Status Console (GET "/").
"""
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_status_console_page():
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    
    html = response.text
    # Core brand and hierarchy
    assert "PIXORA" in html
    assert "DIGITAL IMAGE FORENSICS" in html
    assert "Every image leaves evidence." in html
    assert "OPERATIONAL" in html
    
    # Status rows
    assert "FORENSIC API STATUS" in html
    assert "CORE ENGINE" in html
    assert "IMAGE INGESTION" in html
    assert "EVIDENCE ANALYSIS" in html
    assert "API GATEWAY" in html
    
    # Endpoints
    assert "API ENDPOINTS" in html
    assert "/api/health" in html
    assert "/api/investigate" in html
    assert "/docs" in html
    
    # Actions & Badges
    assert "[ OPEN ]" in html
    assert "[ POST ]" in html
    assert "v1.0" in html

def test_api_health_endpoint_unchanged():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["message"] == "IMAGE-TRACE core is running."
