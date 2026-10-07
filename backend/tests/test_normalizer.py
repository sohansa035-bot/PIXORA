import re

import pytest

from backend.engine.normalizer import (
    NORMALIZATION_RULES,
    NormalizationError,
    normalize_observations,
)
from backend.forensics.metadata_analyzer import analyze_metadata
from backend.forensics.pixel_analyzer import analyze_pixels
from backend.forensics.provenance_analyzer import analyze_provenance
from backend.models.evidence import Evidence, EvidenceStatus, EvidenceType, Reliability
from backend.models.observation import ObservationStatus, ObservationType, RawObservation
from tests.fixtures import flat_jpeg, noise_png, noise_jpeg, software_exif

# Words that would turn evidence into a verdict. The normalizer must never emit them.
CONCLUSION_WORDS = re.compile(r"\b(fake|forged|forgery|authentic|genuine|real|proven|proof|tampered)\b", re.I)


def _raw(**overrides) -> RawObservation:
    base = dict(
        source="test_analyzer",
        evidence_type=EvidenceType.PIXEL,
        observation_type=ObservationType.ELA_DIFFERENCE_ABOVE_THRESHOLD,
        status=ObservationStatus.OBSERVED,
        observation="High localized error-level differences detected (max diff: 87).",
        observed_value=87,
        raw_details={"max_diff": 87, "threshold": 50},
        limitations=["ELA limitation A.", "ELA limitation B."],
    )
    base.update(overrides)
    return RawObservation(**base)


# ---------- analyzers emit raw observations, not Evidence ----------

def test_analyzers_return_raw_observations_only():
    for obs in analyze_metadata(flat_jpeg()) + analyze_pixels(flat_jpeg()) + analyze_provenance(flat_jpeg()):
        assert isinstance(obs, RawObservation)
        assert not isinstance(obs, Evidence)
        # The raw layer has no place to put an interpretation.
        for field in ("inference", "reliability", "applicability"):
            assert field not in RawObservation.model_fields
            assert not hasattr(obs, field)


# ---------- raw metadata observation -> normalized Evidence ----------

def test_raw_metadata_absent_normalizes_without_invention():
    raw = analyze_metadata(flat_jpeg())
    assert raw[0].observation_type == ObservationType.EXIF_ABSENT
    [ev] = normalize_observations(raw)

    assert ev.id == "meta_001"
    assert ev.evidence_type == EvidenceType.METADATA
    assert ev.source == "exifread_analyzer"
    assert ev.observation == raw[0].observation  # preserved verbatim
    assert ev.observation_type == ObservationType.EXIF_ABSENT
    assert ev.status == EvidenceStatus.VERIFIED  # the absence is verified, nothing more
    assert "does not imply manipulation" in ev.applicability
    assert ev.limitations == "Cannot determine if metadata was never present or removed."
    assert not CONCLUSION_WORDS.search(f"{ev.observation} {ev.inference}")


def test_raw_metadata_software_tag_preserves_value():
    raw = analyze_metadata(flat_jpeg(exif=software_exif("SomeEditor 9")))
    [ev] = normalize_observations(raw)
    assert ev.observation == "Software tag found: SomeEditor 9"
    assert ev.raw_details["observed_value"] == "SomeEditor 9"
    assert ev.status == EvidenceStatus.VERIFIED
    assert "not necessarily malicious" in ev.applicability


def test_exif_present_without_software_tag_gets_no_inference():
    raw = RawObservation(
        source="exifread_analyzer", evidence_type=EvidenceType.METADATA,
        observation_type=ObservationType.EXIF_PRESENT_NO_SOFTWARE_TAG, status=ObservationStatus.OBSERVED,
        observation="EXIF data present, but no Software tag found.", raw_details={"exif_tag_count": 4},
    )
    [ev] = normalize_observations([raw])
    assert ev.inference is None  # absence of one tag justifies no inference
    assert ev.raw_details == {"exif_tag_count": 4}


# ---------- raw pixel observation -> normalized Evidence ----------

def test_raw_pixel_above_threshold_normalizes_to_hedged_inference():
    raw = analyze_pixels(noise_jpeg())
    ela_obs = [o for o in raw if o.observation_type == ObservationType.ELA_DIFFERENCE_ABOVE_THRESHOLD][0]
    [ev] = normalize_observations([ela_obs])

    assert ev.id == "pixel_001"
    assert ev.evidence_type == EvidenceType.PIXEL
    assert ev.observation == ela_obs.observation
    assert ev.status == EvidenceStatus.SUPPORTED
    assert ev.reliability == Reliability.MEDIUM
    assert "may indicate" in ev.inference  # hedged, not a verdict
    assert ev.raw_details["max_diff"] == ela_obs.observed_value
    assert ev.raw_details["threshold"] == 50
    assert "NOT scientifically validated" in ev.limitations
    assert not CONCLUSION_WORDS.search(f"{ev.observation} {ev.inference}")


def test_raw_pixel_below_threshold():
    raw = analyze_pixels(flat_jpeg())
    ela_obs = [o for o in raw if o.observation_type == ObservationType.ELA_DIFFERENCE_BELOW_THRESHOLD][0]
    [ev] = normalize_observations([ela_obs])
    assert ev.status == EvidenceStatus.VERIFIED
    assert ev.raw_details["max_diff"] == 0
    assert ev.inference == "No significant anomalies found via ELA."


# ---------- unavailable / unknown states are preserved ----------

def test_failed_analysis_becomes_unavailable_with_no_inference():
    raw = _raw(observation_type=ObservationType.ANALYSIS_FAILED, status=ObservationStatus.FAILED,
               observation="Pixel analysis failed: boom", observed_value=None, raw_details={"error": "OSError"},
               limitations=["Analysis exception."])
    [ev] = normalize_observations([raw])
    assert ev.status == EvidenceStatus.UNAVAILABLE
    assert ev.reliability == Reliability.UNKNOWN
    assert ev.inference is None


def test_pixel_analyzer_failure_on_garbage_bytes():
    obs = analyze_pixels(b"definitely not an image")
    ela_obs = [o for o in obs if o.observation_type == ObservationType.ANALYSIS_FAILED][0]
    assert ela_obs.status == ObservationStatus.FAILED
    [ev] = normalize_observations([ela_obs])
    assert ev.status == EvidenceStatus.UNAVAILABLE and ev.inference is None


def test_provenance_not_checked_is_unavailable_not_negative():
    [ev] = normalize_observations(analyze_provenance(flat_jpeg()))
    assert ev.id == "prov_001"
    assert ev.status == EvidenceStatus.UNAVAILABLE
    assert ev.reliability == Reliability.UNKNOWN
    assert ev.inference is None
    assert "not implemented" in ev.observation


# ---------- IDs, validation, coverage ----------

def test_ids_are_stable_and_per_type():
    raws = (analyze_metadata(flat_jpeg()) + analyze_pixels(flat_jpeg())
            + analyze_pixels(noise_jpeg()) + analyze_provenance(flat_jpeg()))
    first = [e.id for e in normalize_observations(raws)]
    second = [e.id for e in normalize_observations(raws)]
    assert first == second


@pytest.mark.parametrize("overrides", [
    {"observation": "   "},
    {"source": ""},
    {"evidence_type": EvidenceType.METADATA},          # ELA type on metadata domain
    {"status": ObservationStatus.FAILED},              # status inconsistent with type
    {"observed_value": None},                          # ELA requires numeric value
    {"observed_value": "87"},
])
def test_malformed_observations_are_rejected(overrides):
    with pytest.raises(NormalizationError):
        normalize_observations([_raw(**overrides)])


def test_software_tag_requires_text_value():
    raw = RawObservation(
        source="exifread_analyzer", evidence_type=EvidenceType.METADATA,
        observation_type=ObservationType.EXIF_SOFTWARE_TAG_PRESENT, status=ObservationStatus.OBSERVED,
        observation="Software tag found: ", observed_value="",
    )
    with pytest.raises(NormalizationError):
        normalize_observations([raw])


def test_every_observation_type_has_a_rule():
    assert set(NORMALIZATION_RULES) == set(ObservationType)


def test_no_rule_emits_a_conclusion():
    for otype, rule in NORMALIZATION_RULES.items():
        assert not CONCLUSION_WORDS.search(rule.inference or ""), otype
        assert not CONCLUSION_WORDS.search(rule.applicability), otype
