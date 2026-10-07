"""
Evidence predicates shared by the relationship engine and the decision engine.

These classify NORMALIZED Evidence into the states the existing decision rules
reason about. Keeping them in one place stops the two engines from drifting
apart. Predicates prefer the structured `observation_type` set by the
normalizer; a narrow legacy fallback on observation text is kept only for
hand-built Evidence objects that have no observation_type (pre-refactor tests
and callers).
"""
from backend.models.evidence import Evidence, EvidenceStatus, EvidenceType
from backend.models.observation import ObservationType

NON_INFORMATIVE_STATUSES = frozenset({EvidenceStatus.UNAVAILABLE, EvidenceStatus.UNKNOWN})


def is_informative(e: Evidence) -> bool:
    """False for failed / not-performed / unknown evidence. Such evidence can
    contribute to incompleteness, but never to a relationship or conclusion."""
    return e.status not in NON_INFORMATIVE_STATUSES


def is_pixel_anomaly(e: Evidence) -> bool:
    # Existing rule: pixel evidence with status SUPPORTED (ELA above threshold).
    return e.evidence_type == EvidenceType.PIXEL and e.status == EvidenceStatus.SUPPORTED


def is_pixel_assessed(e: Evidence) -> bool:
    return e.evidence_type == EvidenceType.PIXEL and is_informative(e)


def is_metadata_absent(e: Evidence) -> bool:
    if e.evidence_type != EvidenceType.METADATA:
        return False
    if e.observation_type is not None:
        return e.observation_type == ObservationType.EXIF_ABSENT
    return "No EXIF metadata found" in e.observation  # legacy fallback


def is_software_tag(e: Evidence) -> bool:
    if e.evidence_type != EvidenceType.METADATA or not is_informative(e):
        return False
    if e.observation_type is not None:
        return e.observation_type == ObservationType.EXIF_SOFTWARE_TAG_PRESENT
    return "Software tag found" in e.observation  # legacy fallback


def is_metadata_available(e: Evidence) -> bool:
    """Metadata evidence that actually describes EXIF content (not absent, not failed, not just structural)."""
    if e.evidence_type != EvidenceType.METADATA or not is_informative(e):
        return False
    if is_metadata_absent(e) or is_structural_inconsistency(e) or is_structural_consistency(e):
        return False
    return True


def is_provenance_verified(e: Evidence) -> bool:
    return e.evidence_type == EvidenceType.PROVENANCE and e.status == EvidenceStatus.VERIFIED

def is_structural_inconsistency(e: Evidence) -> bool:
    if e.evidence_type != EvidenceType.METADATA or not is_informative(e):
        return False
    return e.observation_type == ObservationType.METADATA_STRUCTURAL_INCONSISTENCY

def is_structural_consistency(e: Evidence) -> bool:
    if e.evidence_type != EvidenceType.METADATA or not is_informative(e):
        return False
    return e.observation_type == ObservationType.METADATA_STRUCTURAL_CONSISTENCY

def is_jpeg_quantization_observed(e: Evidence) -> bool:
    if e.evidence_type != EvidenceType.PIXEL or not is_informative(e):
        return False
    return e.observation_type == ObservationType.JPEG_QUANTIZATION_OBSERVED
