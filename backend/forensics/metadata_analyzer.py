import io
import exifread
from backend.models.evidence import EvidenceType
from backend.models.observation import RawObservation, ObservationType, ObservationStatus

SOURCE = "exifread_analyzer"


def analyze_metadata(image_bytes: bytes) -> list[RawObservation]:
    """Read EXIF tags and report what was (or was not) found.

    Returns RawObservations only. No inference, reliability, or applicability is
    assigned here -- that is the normalizer's job.
    """
    try:
        tags = exifread.process_file(io.BytesIO(image_bytes), details=False)
    except Exception as e:
        return [RawObservation(
            source=SOURCE,
            evidence_type=EvidenceType.METADATA,
            observation_type=ObservationType.ANALYSIS_FAILED,
            status=ObservationStatus.FAILED,
            observation=f"Metadata analysis failed: {str(e)}",
            raw_details={"error": type(e).__name__},
            limitations=["Analysis exception. Metadata state is unknown."],
        )]

    if not tags:
        # Missing metadata
        return [RawObservation(
            source=SOURCE,
            evidence_type=EvidenceType.METADATA,
            observation_type=ObservationType.EXIF_ABSENT,
            status=ObservationStatus.ABSENT,
            observation="No EXIF metadata found in the image file.",
            raw_details={"exif_tag_count": 0},
            limitations=["Cannot determine if metadata was never present or removed."],
        )]

    # Look for software/editing signatures
    software_tag = tags.get('Image Software')
    if software_tag:
        software_val = str(software_tag)
        return [RawObservation(
            source=SOURCE,
            evidence_type=EvidenceType.METADATA,
            observation_type=ObservationType.EXIF_SOFTWARE_TAG_PRESENT,
            status=ObservationStatus.OBSERVED,
            observation=f"Software tag found: {software_val}",
            observed_value=software_val,
            raw_details={"exif_tag_count": len(tags), "tag": "Image Software"},
            limitations=["Metadata is easily spoofed or altered."],
        )]

    return [RawObservation(
        source=SOURCE,
        evidence_type=EvidenceType.METADATA,
        observation_type=ObservationType.EXIF_PRESENT_NO_SOFTWARE_TAG,
        status=ObservationStatus.OBSERVED,
        observation="EXIF data present, but no Software tag found.",
        raw_details={"exif_tag_count": len(tags)},
        limitations=["Metadata can be modified."],
    )]
