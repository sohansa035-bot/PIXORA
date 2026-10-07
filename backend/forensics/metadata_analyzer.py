import io
import os
import exifread
from PIL import Image
from backend.models.evidence import EvidenceType
from backend.models.observation import RawObservation, ObservationType, ObservationStatus

SOURCE = "exifread_analyzer"


def analyze_metadata(image_bytes: bytes, **kwargs) -> list[RawObservation]:
    """Read EXIF tags and container structure; report what was (or was not) found.

    Returns RawObservations only. No inference, reliability, or applicability is
    assigned here -- that is the normalizer's job.
    """
    observations: list[RawObservation] = []
    filename = kwargs.get("filename")

    # 1. Structural Container Consistency Check
    try:
        img = Image.open(io.BytesIO(image_bytes))
        actual_format = img.format.upper() if img.format else "UNKNOWN"
        
        if filename and filename != "unknown":
            _, ext = os.path.splitext(filename.lower())
            ext = ext.lstrip(".")
            ext_map = {"jpg": "JPEG", "jpeg": "JPEG", "png": "PNG", "webp": "WEBP", "tif": "TIFF", "tiff": "TIFF"}
            expected_format = ext_map.get(ext)

            if expected_format and expected_format == actual_format:
                observations.append(RawObservation(
                    source=SOURCE,
                    evidence_type=EvidenceType.METADATA,
                    observation_type=ObservationType.METADATA_STRUCTURAL_CONSISTENCY,
                    status=ObservationStatus.OBSERVED,
                    observation="File structure and extension are consistent.",
                    raw_details={"format": actual_format, "filename": filename, "extension": ext},
                    limitations=[],
                ))
            elif expected_format and expected_format != actual_format:
                observations.append(RawObservation(
                    source=SOURCE,
                    evidence_type=EvidenceType.METADATA,
                    observation_type=ObservationType.METADATA_STRUCTURAL_INCONSISTENCY,
                    status=ObservationStatus.OBSERVED,
                    observation=f"Structural inconsistency detected: file structure or format ({actual_format}) does not match extension ({ext}).",
                    raw_details={"actual_format": actual_format, "expected_format": expected_format, "filename": filename},
                    limitations=["File may have been renamed to disguise its true container format."],
                ))
            elif actual_format in ("JPEG", "PNG", "WEBP", "TIFF"):
                observations.append(RawObservation(
                    source=SOURCE,
                    evidence_type=EvidenceType.METADATA,
                    observation_type=ObservationType.METADATA_STRUCTURAL_CONSISTENCY,
                    status=ObservationStatus.OBSERVED,
                    observation="File structure and extension are consistent.",
                    raw_details={"format": actual_format, "filename": filename},
                    limitations=[],
                ))
    except Exception:
        pass

    # 2. EXIF Tag Extraction
    try:
        tags = exifread.process_file(io.BytesIO(image_bytes), details=False)
    except Exception as e:
        observations.append(RawObservation(
            source=SOURCE,
            evidence_type=EvidenceType.METADATA,
            observation_type=ObservationType.ANALYSIS_FAILED,
            status=ObservationStatus.FAILED,
            observation=f"Metadata analysis failed: {str(e)}",
            raw_details={"error": type(e).__name__},
            limitations=["Analysis exception. Metadata state is unknown."],
        ))
        return observations

    if not tags:
        # Missing metadata
        observations.append(RawObservation(
            source=SOURCE,
            evidence_type=EvidenceType.METADATA,
            observation_type=ObservationType.EXIF_ABSENT,
            status=ObservationStatus.ABSENT,
            observation="No EXIF metadata found in the image file.",
            raw_details={"exif_tag_count": 0},
            limitations=["Cannot determine if metadata was never present or removed."],
        ))
        return observations

    # Look for software/editing signatures
    software_tag = tags.get('Image Software')
    if software_tag:
        software_val = str(software_tag)
        observations.append(RawObservation(
            source=SOURCE,
            evidence_type=EvidenceType.METADATA,
            observation_type=ObservationType.EXIF_SOFTWARE_TAG_PRESENT,
            status=ObservationStatus.OBSERVED,
            observation=f"Software tag found: {software_val}",
            observed_value=software_val,
            raw_details={"exif_tag_count": len(tags), "tag": "Image Software", "software": software_val},
            limitations=["Metadata is easily spoofed or altered."],
        ))
        return observations

    # Check for camera make/model
    make = tags.get('Image Make')
    model = tags.get('Image Model')
    details = {"exif_tag_count": len(tags)}
    if make or model:
        details["camera_make"] = str(make) if make else None
        details["camera_model"] = str(model) if model else None
        obs_msg = f"EXIF camera metadata present ({f'{make} ' if make else ''}{model or ''}, {len(tags)} tags), but no Software tag found."
    else:
        obs_msg = "EXIF data present, but no Software tag found."

    observations.append(RawObservation(
        source=SOURCE,
        evidence_type=EvidenceType.METADATA,
        observation_type=ObservationType.EXIF_PRESENT_NO_SOFTWARE_TAG,
        status=ObservationStatus.OBSERVED,
        observation=obs_msg,
        raw_details=details,
        limitations=["Absence of software tag does not guarantee the image was never edited."],
    ))

    return observations
