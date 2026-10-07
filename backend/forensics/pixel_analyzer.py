import io
from PIL import Image, ImageChops
from backend.models.evidence import EvidenceType
from backend.models.observation import RawObservation, ObservationType, ObservationStatus

SOURCE = "ela_pixel_analyzer"
ELA_RESAVE_QUALITY = 90
ELA_MAX_DIFF_THRESHOLD = 50

ELA_LIMITATIONS = [
    "ELA is highly subjective, prone to false positives on flat surfaces or edges, "
    "and unreliable on heavily compressed or non-JPEG images.",
    f"The threshold (max diff > {ELA_MAX_DIFF_THRESHOLD}) is uncalibrated and the global maximum "
    "does not localize a region. Method is implemented but NOT scientifically validated.",
]


def analyze_pixels(image_bytes: bytes, **kwargs) -> list[RawObservation]:
    """Basic Error Level Analysis (ELA) and JPEG Quantization Analysis.

    Returns RawObservations only. The analyzer reports the measured maximum
    error-level difference and quantization tables; it does not
    interpret what that means.
    """
    observations = []
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # JPEG Quantization Check
        if img.format == 'JPEG' and hasattr(img, 'quantization'):
            q_tables = img.quantization
            if q_tables:
                tables_info = {k: list(v) for k, v in q_tables.items()}
                observations.append(RawObservation(
                    source=SOURCE,
                    evidence_type=EvidenceType.PIXEL,
                    observation_type=ObservationType.JPEG_QUANTIZATION_OBSERVED,
                    status=ObservationStatus.OBSERVED,
                    observation=f"JPEG quantization tables extracted ({len(q_tables)} tables).",
                    raw_details={"quantization_tables": tables_info},
                    limitations=["Quantization tables indicate JPEG compression parameters but do not independently prove malicious manipulation."],
                ))
            else:
                observations.append(RawObservation(
                    source=SOURCE,
                    evidence_type=EvidenceType.PIXEL,
                    observation_type=ObservationType.JPEG_QUANTIZATION_NOT_APPLICABLE,
                    status=ObservationStatus.ABSENT,
                    observation="Image is JPEG but no quantization tables found.",
                    raw_details={},
                    limitations=[],
                ))
        else:
            observations.append(RawObservation(
                source=SOURCE,
                evidence_type=EvidenceType.PIXEL,
                observation_type=ObservationType.JPEG_QUANTIZATION_NOT_APPLICABLE,
                status=ObservationStatus.ABSENT,
                observation="Image is not JPEG or does not support quantization analysis.",
                raw_details={"format": img.format},
                limitations=[],
            ))

        # Basic Error Level Analysis (ELA)
        # ELA is JPEG-domain specific in this implementation.
        if img.format != 'JPEG':
            observations.append(RawObservation(
                source=SOURCE,
                evidence_type=EvidenceType.PIXEL,
                observation_type=ObservationType.ELA_NOT_APPLICABLE,
                status=ObservationStatus.ABSENT,
                observation="ELA was not applied because the current ELA implementation is JPEG-specific.",
                raw_details={"format": img.format},
                limitations=[],
            ))
            return observations

        img = img.convert("RGB")

        # Save at known quality and compare
        temp_io = io.BytesIO()
        img.save(temp_io, 'JPEG', quality=ELA_RESAVE_QUALITY)
        temp_io.seek(0)
        resaved_img = Image.open(temp_io)

        ela_img = ImageChops.difference(img, resaved_img)
        extrema = ela_img.getextrema()
        max_diff = max([ex[1] for ex in extrema])

        if max_diff > ELA_MAX_DIFF_THRESHOLD:
            observation_type = ObservationType.ELA_DIFFERENCE_ABOVE_THRESHOLD
            observation = f"High localized error-level differences detected (max diff: {max_diff})."
        else:
            observation_type = ObservationType.ELA_DIFFERENCE_BELOW_THRESHOLD
            observation = f"Uniform or low error-level differences detected (max diff: {max_diff})."

        observations.append(RawObservation(
            source=SOURCE,
            evidence_type=EvidenceType.PIXEL,
            observation_type=observation_type,
            status=ObservationStatus.OBSERVED,
            observation=observation,
            observed_value=max_diff,
            raw_details={
                "max_diff": max_diff,
                "threshold": ELA_MAX_DIFF_THRESHOLD,
                "resave_quality": ELA_RESAVE_QUALITY,
                "channel_extrema": [list(ex) for ex in extrema],
            },
            limitations=list(ELA_LIMITATIONS),
        ))
        
        return observations

    except Exception as e:
        observations.append(RawObservation(
            source=SOURCE,
            evidence_type=EvidenceType.PIXEL,
            observation_type=ObservationType.ANALYSIS_FAILED,
            status=ObservationStatus.FAILED,
            observation=f"Pixel analysis failed: {str(e)}",
            raw_details={"error": type(e).__name__},
            limitations=["Analysis exception."],
        ))
        return observations
