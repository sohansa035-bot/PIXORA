from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.models.investigation import Investigation
from backend.models.evidence import Evidence
import hashlib
import uuid
import io
from datetime import datetime
from PIL import Image

from backend.forensics.metadata_analyzer import analyze_metadata
from backend.forensics.pixel_analyzer import analyze_pixels

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

    # Create investigation
    inv_id = str(uuid.uuid4())
    investigation = Investigation(
        id=inv_id,
        image_hash=image_hash,
        timestamp=datetime.utcnow()
    )

    # Route to forensics
    evidence_list = []
    
    metadata_evidence = analyze_metadata(content)
    evidence_list.extend(metadata_evidence)

    pixel_evidence = analyze_pixels(content)
    evidence_list.extend(pixel_evidence)
    
    # Provenance Architecture requirement (Stage 1)
    from backend.models.evidence import EvidenceType, EvidenceStatus, Reliability
    from backend.models.evidence import Evidence as EvModel
    prov_ev = EvModel(
        id=f"prov_{uuid.uuid4().hex[:8]}",
        source="provenance_analyzer",
        evidence_type=EvidenceType.PROVENANCE,
        observation="C2PA / Provenance data unavailable.",
        reliability=Reliability.UNKNOWN,
        applicability="Directly relevant to origin validation.",
        status=EvidenceStatus.UNAVAILABLE,
        limitations="Standard image formats often lack cryptographic provenance."
    )
    evidence_list.append(prov_ev)

    investigation.evidence = evidence_list
    
    return investigation
