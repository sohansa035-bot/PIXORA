from backend.engine.normalizer import normalize_observations
from backend.engine.relationship_engine import attach_relationship_refs, build_relationships
from backend.forensics.metadata_analyzer import analyze_metadata
from backend.forensics.pixel_analyzer import analyze_pixels
from backend.forensics.provenance_analyzer import analyze_provenance
from backend.models.evidence import (
    Evidence,
    EvidenceRelationship,
    EvidenceRelationshipType,
    EvidenceStatus,
    EvidenceType,
    Reliability,
)
from tests.fixtures import flat_jpeg, noise_png, software_exif


def _ev(id, etype, status, observation="obs", observation_type=None, reliability=Reliability.MEDIUM):
    return Evidence(id=id, source="test", evidence_type=etype, observation=observation,
                    reliability=reliability, applicability="test", status=status, limitations="",
                    observation_type=observation_type)


def _pixel_anomaly(id="pixel_001"):
    return _ev(id, EvidenceType.PIXEL, EvidenceStatus.SUPPORTED, "High ELA",
               "ELA_DIFFERENCE_ABOVE_THRESHOLD")


def _pixel_clean(id="pixel_001"):
    return _ev(id, EvidenceType.PIXEL, EvidenceStatus.VERIFIED, "Low ELA", "ELA_DIFFERENCE_BELOW_THRESHOLD")


def _software_tag(id="meta_001"):
    return _ev(id, EvidenceType.METADATA, EvidenceStatus.VERIFIED, "Software tag found: X",
               "EXIF_SOFTWARE_TAG_PRESENT", Reliability.HIGH)


def _exif_absent(id="meta_001"):
    return _ev(id, EvidenceType.METADATA, EvidenceStatus.VERIFIED, "No EXIF metadata found in the image file.",
               "EXIF_ABSENT", Reliability.HIGH)


def _prov_verified(id="prov_001"):
    return _ev(id, EvidenceType.PROVENANCE, EvidenceStatus.VERIFIED, "Valid C2PA", reliability=Reliability.HIGH)


def _prov_unavailable(id="prov_001"):
    return _ev(id, EvidenceType.PROVENANCE, EvidenceStatus.UNAVAILABLE, "C2PA / Provenance data unavailable.",
               "PROVENANCE_NOT_CHECKED", Reliability.UNKNOWN)


def _types(rels):
    return [r.relationship_type for r in rels]


# ---------- Case A: compatible evidence ----------

def test_case_a_compatible_evidence_is_consistent_with():
    rels = build_relationships([_software_tag(), _pixel_anomaly(), _prov_unavailable()])
    assert len(rels) == 1
    rel = rels[0]
    assert isinstance(rel, EvidenceRelationship)
    assert rel.relationship_type == EvidenceRelationshipType.CONSISTENT_WITH
    assert (rel.source_evidence_id, rel.target_evidence_id) == ("meta_001", "pixel_001")
    assert rel.description and "does not establish" in rel.description


# ---------- Case B: genuinely conflicting evidence ----------

def test_case_b_pixel_anomaly_vs_verified_provenance_conflicts():
    rels = build_relationships([_exif_absent(), _pixel_anomaly(), _prov_verified()])
    assert _types(rels) == [EvidenceRelationshipType.CONFLICTS]
    assert (rels[0].source_evidence_id, rels[0].target_evidence_id) == ("pixel_001", "prov_001")


# ---------- Case C: unavailable evidence never conflicts ----------

def test_case_c_unavailable_provenance_does_not_conflict():
    rels = build_relationships([_exif_absent(), _pixel_anomaly(), _prov_unavailable()])
    assert EvidenceRelationshipType.CONFLICTS not in _types(rels)
    assert rels == []  # no relationship is justified at all


def test_unavailable_evidence_never_participates_in_any_relationship():
    failed_pixel = _ev("pixel_001", EvidenceType.PIXEL, EvidenceStatus.UNAVAILABLE, "Pixel analysis failed",
                       "ANALYSIS_FAILED", Reliability.UNKNOWN)
    unknown_prov = _ev("prov_001", EvidenceType.PROVENANCE, EvidenceStatus.UNKNOWN, "?", None, Reliability.UNKNOWN)
    rels = build_relationships([_software_tag(), failed_pixel, unknown_prov, _prov_unavailable("prov_002")])
    assert rels == []


# ---------- No relationship invented when none is justified ----------

def test_no_relationships_for_clean_pixels_and_missing_metadata():
    assert build_relationships([_exif_absent(), _pixel_clean(), _prov_unavailable()]) == []


def test_clean_pixels_plus_software_tag_are_not_related():
    assert build_relationships([_software_tag(), _pixel_clean(), _prov_unavailable()]) == []


def test_clean_pixels_plus_verified_provenance_do_not_conflict():
    assert build_relationships([_pixel_clean(), _prov_verified()]) == []


def test_missing_exif_is_not_related_to_pixel_anomaly():
    rels = build_relationships([_exif_absent(), _pixel_anomaly()])
    assert rels == []


# ---------- graph mechanics ----------

def test_relationship_ids_are_deterministic_and_refs_attached():
    evidence = [_software_tag(), _pixel_anomaly(), _prov_verified()]
    rels = build_relationships(evidence)
    assert [r.id for r in rels] == ["rel_001", "rel_002"]
    assert build_relationships(evidence) == rels

    linked = attach_relationship_refs(evidence, rels)
    by_id = {e.id: e for e in linked}
    assert by_id["pixel_001"].relationships == ["rel_001", "rel_002"]
    assert by_id["prov_001"].relationships == ["rel_001"]
    assert by_id["meta_001"].relationships == ["rel_002"]
    assert evidence[1].relationships == []  # originals are not mutated


def test_relationships_from_real_analyzer_output():
    """Analyzer -> normalizer -> relationship engine, no hand-built evidence."""
    content = noise_png(exif=software_exif())
    observations = analyze_metadata(content) + analyze_pixels(content) + analyze_provenance(content)
    evidence = normalize_observations(observations)
    rels = build_relationships(evidence)
    assert _types(rels) == [EvidenceRelationshipType.CONSISTENT_WITH]

    plain = flat_jpeg()
    evidence = normalize_observations(analyze_metadata(plain) + analyze_pixels(plain) + analyze_provenance(plain))
    assert build_relationships(evidence) == []
