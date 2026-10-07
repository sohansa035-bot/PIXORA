import io
import uuid
from PIL import Image, ImageChops
from backend.models.evidence import Evidence, EvidenceType, EvidenceStatus, Reliability

def analyze_pixels(image_bytes: bytes) -> list[Evidence]:
    evidence_list = []
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Basic Error Level Analysis (ELA)
        # Save at known quality and compare
        temp_io = io.BytesIO()
        img.save(temp_io, 'JPEG', quality=90)
        temp_io.seek(0)
        resaved_img = Image.open(temp_io)
        
        ela_img = ImageChops.difference(img, resaved_img)
        extrema = ela_img.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        
        if max_diff > 50:
            observation = f"High localized error-level differences detected (max diff: {max_diff})."
            inference = "Image regions exhibit varying compression levels, which may indicate splicing or localized modification."
            status = EvidenceStatus.SUPPORTED
        else:
            observation = f"Uniform or low error-level differences detected (max diff: {max_diff})."
            inference = "No significant anomalies found via ELA."
            status = EvidenceStatus.VERIFIED

        ev = Evidence(
            id=f"pixel_{uuid.uuid4().hex[:8]}",
            source="ela_pixel_analyzer",
            evidence_type=EvidenceType.PIXEL,
            observation=observation,
            inference=inference,
            reliability=Reliability.MEDIUM,
            applicability="Useful for detecting varying JPEG compression levels.",
            status=status,
            limitations="ELA is highly subjective, prone to false positives on flat surfaces or edges, and unreliable on heavily compressed or non-JPEG images."
        )
        evidence_list.append(ev)

    except Exception as e:
        ev = Evidence(
            id=f"pixel_{uuid.uuid4().hex[:8]}",
            source="ela_pixel_analyzer",
            evidence_type=EvidenceType.PIXEL,
            observation=f"Pixel analysis failed: {str(e)}",
            reliability=Reliability.UNKNOWN,
            applicability="None",
            status=EvidenceStatus.UNAVAILABLE,
            limitations="Analysis exception."
        )
        evidence_list.append(ev)
        
    return evidence_list
