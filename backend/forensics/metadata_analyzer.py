import io
import uuid
import exifread
from backend.models.evidence import Evidence, EvidenceType, EvidenceStatus, Reliability

def analyze_metadata(image_bytes: bytes) -> list[Evidence]:
    evidence_list = []
    tags = exifread.process_file(io.BytesIO(image_bytes), details=False)
    
    if not tags:
        # Missing metadata
        ev = Evidence(
            id=f"meta_{uuid.uuid4().hex[:8]}",
            source="exifread_analyzer",
            evidence_type=EvidenceType.METADATA,
            observation="No EXIF metadata found in the image file.",
            inference="Image may have been stripped of metadata (common in social media or editing).",
            reliability=Reliability.HIGH,
            applicability="Contextual. Missing metadata does not imply manipulation of pixel content.",
            status=EvidenceStatus.VERIFIED,
            limitations="Cannot determine if metadata was never present or removed."
        )
        evidence_list.append(ev)
        return evidence_list

    # Look for software/editing signatures
    software_tag = tags.get('Image Software')
    if software_tag:
        software_val = str(software_tag)
        ev = Evidence(
            id=f"meta_{uuid.uuid4().hex[:8]}",
            source="exifread_analyzer",
            evidence_type=EvidenceType.METADATA,
            observation=f"Software tag found: {software_val}",
            inference="Image was processed or saved using the specified software.",
            reliability=Reliability.HIGH,
            applicability="Indicates software interaction, but not necessarily malicious manipulation.",
            status=EvidenceStatus.VERIFIED,
            limitations="Metadata is easily spoofed or altered."
        )
        evidence_list.append(ev)
    else:
        ev = Evidence(
            id=f"meta_{uuid.uuid4().hex[:8]}",
            source="exifread_analyzer",
            evidence_type=EvidenceType.METADATA,
            observation="EXIF data present, but no Software tag found.",
            reliability=Reliability.MEDIUM,
            applicability="Contextual.",
            status=EvidenceStatus.VERIFIED,
            limitations="Metadata can be modified."
        )
        evidence_list.append(ev)

    return evidence_list
