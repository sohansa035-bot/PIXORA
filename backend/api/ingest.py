from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.models.investigation import Investigation
import hashlib
import io
from PIL import Image

from backend.engine.pipeline import run_investigation

router = APIRouter()

@router.post("/api/investigate", response_model=Investigation)
async def investigate_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be an image.")

    content = await file.read()
    
    # Calculate hash
    image_hash = hashlib.sha256(content).hexdigest()
    
    # Validate image and get basic properties
    try:
        img = Image.open(io.BytesIO(content))
        img.verify() # Verify it's not corrupt
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image validation failed: {str(e)}")

    # Analyzers -> RawObservation -> Normalizer -> Evidence -> Relationship engine
    # -> Decision integrity -> Investigation  (see backend/engine/pipeline.py)
    return run_investigation(content, image_hash)
