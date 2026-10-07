"""
Evidence normalizer.

Boundary:  RawObservation  ->  Evidence

This is the ONLY place where an analyzer's raw output is turned into a formal
Evidence object. Responsibilities:

  1. validate the raw observation (required fields, type/domain/status consistency)
  2. assign stable, deterministic evidence IDs (per investigation)
  3. carry over source / evidence type
  4. preserve the observation text and raw measurements verbatim
  5. attach an inference ONLY where a rule explicitly justifies one
  6. assign reliability, applicability and status from a fixed rule table
  7. preserve limitations
  8. preserve unavailable / unknown states (failed or not-performed checks
     become UNAVAILABLE evidence with UNKNOWN reliability and NO inference)

The normalizer never invents information and never issues conclusions such as
"the image is fake" or "the image is authentic". Conclusions are the decision
engine's job, and only after sufficiency and relationships are evaluated.

The rule values below are carried over unchanged from the analyzers' previous
inline Evidence construction, so the normalized output is backward compatible.
"""
from dataclasses import dataclass
from typing import Dict, FrozenSet, List, Optional

from backend.models.evidence import Evidence, EvidenceStatus, EvidenceType, Reliability
from backend.models.observation import ObservationStatus, ObservationType, RawObservation


class NormalizationError(ValueError):
    """Raised when a raw observation is malformed. Fails loudly by design:
    silently guessing would fabricate evidence."""


@dataclass(frozen=True)
class NormalizationRule:
    allowed_types: FrozenSet[EvidenceType]
    allowed_statuses: FrozenSet[ObservationStatus]
    status: EvidenceStatus
    reliability: Reliability
    applicability: str
    inference: Optional[str] = None
    requires_numeric_value: bool = False
    requires_text_value: bool = False


_ELA_APPLICABILITY = "Useful for detecting varying JPEG compression levels."

NORMALIZATION_RULES: Dict[ObservationType, NormalizationRule] = {
    ObservationType.EXIF_ABSENT: NormalizationRule(
        allowed_types=frozenset({EvidenceType.METADATA}),
        allowed_statuses=frozenset({ObservationStatus.ABSENT}),
        status=EvidenceStatus.VERIFIED,  # the absence itself is verified, nothing more
        reliability=Reliability.HIGH,
        applicability="Contextual. Missing metadata does not imply manipulation of pixel content.",
        inference="Image may have been stripped of metadata (common in social media or editing).",
    ),
    ObservationType.EXIF_SOFTWARE_TAG_PRESENT: NormalizationRule(
        allowed_types=frozenset({EvidenceType.METADATA}),
        allowed_statuses=frozenset({ObservationStatus.OBSERVED}),
        status=EvidenceStatus.VERIFIED,
        reliability=Reliability.HIGH,
        applicability="Indicates software interaction, but not necessarily malicious manipulation.",
        inference="Image was processed or saved using the specified software.",
        requires_text_value=True,
    ),
    ObservationType.EXIF_PRESENT_NO_SOFTWARE_TAG: NormalizationRule(
        allowed_types=frozenset({EvidenceType.METADATA}),
        allowed_statuses=frozenset({ObservationStatus.OBSERVED}),
        status=EvidenceStatus.VERIFIED,
        reliability=Reliability.MEDIUM,
        applicability="Contextual.",
        inference=None,  # absence of one tag justifies no inference
    ),
    ObservationType.METADATA_STRUCTURAL_INCONSISTENCY: NormalizationRule(
        allowed_types=frozenset({EvidenceType.METADATA}),
        allowed_statuses=frozenset({ObservationStatus.OBSERVED}),
        status=EvidenceStatus.SUPPORTED,
        reliability=Reliability.HIGH,
        applicability="Detects file renaming or structural tampering.",
        inference="File structure or format does not match the provided extension.",
    ),
    ObservationType.METADATA_STRUCTURAL_CONSISTENCY: NormalizationRule(
        allowed_types=frozenset({EvidenceType.METADATA}),
        allowed_statuses=frozenset({ObservationStatus.OBSERVED}),
        status=EvidenceStatus.VERIFIED,
        reliability=Reliability.HIGH,
        applicability="Confirms file structure matches its extension.",
        inference="File extension matches the actual decoded format.",
    ),
    ObservationType.JPEG_QUANTIZATION_OBSERVED: NormalizationRule(
        allowed_types=frozenset({EvidenceType.PIXEL}),
        allowed_statuses=frozenset({ObservationStatus.OBSERVED}),
        status=EvidenceStatus.VERIFIED,
        reliability=Reliability.HIGH,
        applicability="Identifies JPEG compression traits.",
        inference="Image has evidence of JPEG compression.",
    ),
    ObservationType.JPEG_QUANTIZATION_NOT_APPLICABLE: NormalizationRule(
        allowed_types=frozenset({EvidenceType.PIXEL}),
        allowed_statuses=frozenset({ObservationStatus.ABSENT}),
        status=EvidenceStatus.UNAVAILABLE,
        reliability=Reliability.UNKNOWN,
        applicability="JPEG analysis cannot run on this format.",
        inference=None,
    ),
    ObservationType.ELA_DIFFERENCE_ABOVE_THRESHOLD: NormalizationRule(
        allowed_types=frozenset({EvidenceType.PIXEL}),
        allowed_statuses=frozenset({ObservationStatus.OBSERVED}),
        status=EvidenceStatus.SUPPORTED,
        reliability=Reliability.MEDIUM,
        applicability=_ELA_APPLICABILITY,
        inference="Image regions exhibit varying compression levels, which may indicate splicing or localized modification.",
        requires_numeric_value=True,
    ),
    ObservationType.ELA_DIFFERENCE_BELOW_THRESHOLD: NormalizationRule(
        allowed_types=frozenset({EvidenceType.PIXEL}),
        allowed_statuses=frozenset({ObservationStatus.OBSERVED}),
        status=EvidenceStatus.VERIFIED,
        reliability=Reliability.MEDIUM,
        applicability=_ELA_APPLICABILITY,
        inference="No significant anomalies found via ELA.",
        requires_numeric_value=True,
    ),
    ObservationType.PROVENANCE_NOT_CHECKED: NormalizationRule(
        allowed_types=frozenset({EvidenceType.PROVENANCE}),
        allowed_statuses=frozenset({ObservationStatus.NOT_PERFORMED}),
        status=EvidenceStatus.UNAVAILABLE,
        reliability=Reliability.UNKNOWN,
        applicability="Directly relevant to origin validation.",
        inference=None,
    ),
    ObservationType.ANALYSIS_FAILED: NormalizationRule(
        allowed_types=frozenset(EvidenceType),
        allowed_statuses=frozenset({ObservationStatus.FAILED}),
        status=EvidenceStatus.UNAVAILABLE,
        reliability=Reliability.UNKNOWN,
        applicability="None",
        inference=None,
    ),
}

ID_PREFIXES: Dict[EvidenceType, str] = {
    EvidenceType.PIXEL: "pixel",
    EvidenceType.METADATA: "meta",
    EvidenceType.PROVENANCE: "prov",
    EvidenceType.CONTEXT: "ctx",
    EvidenceType.UNKNOWN: "ev",
}


def _validate(obs: RawObservation, rule: NormalizationRule) -> None:
    if not obs.source or not obs.source.strip():
        raise NormalizationError("RawObservation.source is required.")
    if not obs.observation or not obs.observation.strip():
        raise NormalizationError(f"RawObservation from '{obs.source}' has an empty observation.")
    if obs.evidence_type not in rule.allowed_types:
        raise NormalizationError(
            f"{obs.observation_type.value} is not valid for evidence type {obs.evidence_type.value}."
        )
    if obs.status not in rule.allowed_statuses:
        raise NormalizationError(
            f"{obs.observation_type.value} cannot have status {obs.status.value}."
        )
    if rule.requires_numeric_value and (
        isinstance(obs.observed_value, bool) or not isinstance(obs.observed_value, (int, float))
    ):
        raise NormalizationError(f"{obs.observation_type.value} requires a numeric observed_value.")
    if rule.requires_text_value and (
        not isinstance(obs.observed_value, str) or not obs.observed_value.strip()
    ):
        raise NormalizationError(f"{obs.observation_type.value} requires a non-empty text observed_value.")


def normalize_observation(obs: RawObservation, evidence_id: str) -> Evidence:
    rule = NORMALIZATION_RULES.get(obs.observation_type)
    if rule is None:
        raise NormalizationError(f"No normalization rule for {obs.observation_type!r}.")
    _validate(obs, rule)

    raw_details = dict(obs.raw_details)
    if obs.observed_value is not None and "observed_value" not in raw_details:
        raw_details["observed_value"] = obs.observed_value

    return Evidence(
        id=evidence_id,
        source_observation_id=obs.id if obs.id else None,
        source=obs.source,
        evidence_type=obs.evidence_type,
        observation=obs.observation,
        inference=rule.inference,
        reliability=rule.reliability,
        applicability=rule.applicability,
        status=rule.status,
        limitations=" ".join(obs.limitations),
        observation_type=obs.observation_type.value,
        raw_details=raw_details,
    )


def normalize_observations(observations: List[RawObservation]) -> List[Evidence]:
    """Normalize a batch. IDs are deterministic: '<prefix>_<NNN>' numbered per
    evidence type in input order (e.g. meta_001, pixel_001, prov_001). IDs are
    unique within one investigation, not globally."""
    counters: Dict[EvidenceType, int] = {}
    evidence: List[Evidence] = []
    for obs in observations:
        counters[obs.evidence_type] = counters.get(obs.evidence_type, 0) + 1
        evidence_id = f"{ID_PREFIXES[obs.evidence_type]}_{counters[obs.evidence_type]:03d}"
        evidence.append(normalize_observation(obs, evidence_id))
    return evidence
