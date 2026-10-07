from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.models.investigation import Investigation
import hashlib
import io
import logging
from PIL import Image

from backend.engine.pipeline import run_investigation

logger = logging.getLogger("pixora.api.ingest")
router = APIRouter()

@router.post("/api/investigate", response_model=Investigation)
async def investigate_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be an image.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty upload. File contains 0 bytes.")
    
    # Calculate SHA-256 hash
    image_hash = hashlib.sha256(content).hexdigest()
    filename = file.filename or "uploaded_image"
    
    # Validate image and get basic properties
    try:
        img = Image.open(io.BytesIO(content))
        img.verify() # Verify it's not corrupt
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image validation failed: {str(e)}")

    print(f"[PIXORA BACKEND INGEST] Filename: '{filename}' | Content-Type: '{file.content_type}' | Size: {len(content)} bytes | SHA-256: {image_hash}")

    # Analyzers -> RawObservation -> Normalizer -> Evidence -> Relationship engine
    # -> Decision integrity -> Investigation  (see backend/engine/pipeline.py)
    return run_investigation(
        content,
        image_hash,
        filename=filename,
        content_type=file.content_type
    )
