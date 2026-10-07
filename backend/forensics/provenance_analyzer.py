from backend.models.evidence import EvidenceType
from backend.models.observation import RawObservation, ObservationType, ObservationStatus

SOURCE = "provenance_analyzer"


def analyze_provenance(image_bytes: bytes) -> list[RawObservation]:
    """Provenance placeholder.

    C2PA / cryptographic provenance verification is NOT implemented. This
    analyzer records that no provenance check was performed. It does NOT claim
    that provenance data is absent from the file, and the result must never be
    interpreted as conflicting with any other evidence.
    (Previously built inline in api/ingest.py; moved here so it flows through
    the same observation -> normalization path as every other analyzer.)
    """
    return [RawObservation(
        source=SOURCE,
        evidence_type=EvidenceType.PROVENANCE,
        observation_type=ObservationType.PROVENANCE_NOT_CHECKED,
        status=ObservationStatus.NOT_PERFORMED,
        observation="C2PA / Provenance data unavailable: provenance verification is not implemented in this version.",
        raw_details={"c2pa_implemented": False},
        limitations=[
            "Standard image formats often lack cryptographic provenance.",
            "C2PA verification is not implemented; the file was not checked for provenance manifests.",
        ],
    )]
