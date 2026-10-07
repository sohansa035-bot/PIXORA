import pytest
from backend.models.evidence import Evidence, EvidenceType, EvidenceStatus, Reliability
from backend.models.decision import DecisionEligibilityState, FinalDecisionState
from backend.models.observation import ObservationType
from backend.engine.decision_maker import evaluate_evidence

def test_scenario_b_insufficient_evidence():
    # Truly insufficient: non-applicable pixel analysis, absent metadata, unavailable provenance
    ev_list = [
        Evidence(
            id="1", source="meta", evidence_type=EvidenceType.METADATA,
            observation="No EXIF metadata found", reliability=Reliability.HIGH,
            applicability="Contextual", status=EvidenceStatus.VERIFIED, limitations="",
            observation_type=ObservationType.EXIF_ABSENT
        ),
        Evidence(
            id="2", source="pixel", evidence_type=EvidenceType.PIXEL,
            observation="ELA not applicable to this format", reliability=Reliability.UNKNOWN,
            applicability="Pixel", status=EvidenceStatus.UNAVAILABLE, limitations="",
            observation_type=ObservationType.ELA_NOT_APPLICABLE
        ),
        Evidence(
            id="3", source="prov", evidence_type=EvidenceType.PROVENANCE,
            observation="Unavailable", reliability=Reliability.UNKNOWN,
            applicability="Contextual", status=EvidenceStatus.UNAVAILABLE, limitations="",
            observation_type=ObservationType.PROVENANCE_NOT_CHECKED
        )
    ]
    assessment = evaluate_evidence(ev_list)
    assert assessment.eligibility == DecisionEligibilityState.ABSTAIN
    assert assessment.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE
    assert assessment.sufficiency == SufficiencyState.INSUFFICIENT

def test_scenario_c_conflicting_evidence():
    ev_list = [
        Evidence(
            id="1", source="meta", evidence_type=EvidenceType.METADATA,
            observation="EXIF data present", reliability=Reliability.HIGH,
            applicability="Contextual", status=EvidenceStatus.VERIFIED, limitations=""
        ),
        Evidence(
            id="2", source="pixel", evidence_type=EvidenceType.PIXEL,
            observation="High localized error-level differences", reliability=Reliability.MEDIUM,
            applicability="Pixel", status=EvidenceStatus.SUPPORTED, limitations=""
        ),
        Evidence(
            id="3", source="prov", evidence_type=EvidenceType.PROVENANCE,
            observation="Valid C2PA", reliability=Reliability.HIGH,
            applicability="Contextual", status=EvidenceStatus.VERIFIED, limitations=""
        )
    ]
    assessment = evaluate_evidence(ev_list)
    assert assessment.eligibility == DecisionEligibilityState.CONFLICTING
    assert assessment.final_decision == FinalDecisionState.CONFLICTING_EVIDENCE


# ---------------------------------------------------------------------------
# Architecture refactor: decision engine consumes normalized evidence + graph
# ---------------------------------------------------------------------------
from backend.models.decision import SufficiencyState
from backend.models.evidence import EvidenceRelationship, EvidenceRelationshipType
from backend.engine.relationship_engine import build_relationships


def _ev(id, etype, status, observation="obs", observation_type=None, reliability=Reliability.MEDIUM):
    return Evidence(id=id, source="test", evidence_type=etype, observation=observation,
                    reliability=reliability, applicability="test", status=status, limitations="",
                    observation_type=observation_type)


PIXEL_ANOMALY = _ev("pixel_001", EvidenceType.PIXEL, EvidenceStatus.SUPPORTED, "High ELA",
                    "ELA_DIFFERENCE_ABOVE_THRESHOLD")
PIXEL_CLEAN = _ev("pixel_001", EvidenceType.PIXEL, EvidenceStatus.VERIFIED, "Low ELA",
                  "ELA_DIFFERENCE_BELOW_THRESHOLD")
PIXEL_FAILED = _ev("pixel_001", EvidenceType.PIXEL, EvidenceStatus.UNAVAILABLE, "Pixel analysis failed: x",
                   "ANALYSIS_FAILED", Reliability.UNKNOWN)
EXIF_ABSENT = _ev("meta_001", EvidenceType.METADATA, EvidenceStatus.VERIFIED,
                  "No EXIF metadata found in the image file.", "EXIF_ABSENT", Reliability.HIGH)
EXIF_PRESENT = _ev("meta_001", EvidenceType.METADATA, EvidenceStatus.VERIFIED,
                   "EXIF data present, but no Software tag found.", "EXIF_PRESENT_NO_SOFTWARE_TAG")
SOFTWARE_TAG = _ev("meta_001", EvidenceType.METADATA, EvidenceStatus.VERIFIED, "Software tag found: X",
                   "EXIF_SOFTWARE_TAG_PRESENT", Reliability.HIGH)
PROV_UNAVAILABLE = _ev("prov_001", EvidenceType.PROVENANCE, EvidenceStatus.UNAVAILABLE,
                       "C2PA / Provenance data unavailable.", "PROVENANCE_NOT_CHECKED", Reliability.UNKNOWN)
PROV_VERIFIED = _ev("prov_001", EvidenceType.PROVENANCE, EvidenceStatus.VERIFIED, "Valid C2PA",
                    reliability=Reliability.HIGH)


def test_insufficient_evidence_abstains_with_explicit_sufficiency():
    # Truly insufficient: failed pixel analysis + absent metadata + unavailable provenance
    ev = [EXIF_ABSENT, PIXEL_FAILED, PROV_UNAVAILABLE]
    a = evaluate_evidence(ev, build_relationships(ev))
    assert a.eligibility == DecisionEligibilityState.ABSTAIN
    assert a.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE
    assert a.sufficiency == SufficiencyState.INSUFFICIENT
    assert a.relationship_basis == []


def test_clean_jpeg_without_exif_concludes_no_significant_manipulation():
    # Clean JPEG without EXIF concludes NO_SIGNIFICANT_MANIPULATION_EVIDENCE
    ev = [EXIF_ABSENT, PIXEL_CLEAN, PROV_UNAVAILABLE]
    a = evaluate_evidence(ev, build_relationships(ev))
    assert a.eligibility == DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED
    assert a.final_decision == FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE
    assert a.sufficiency == SufficiencyState.SUFFICIENT


def test_genuine_conflict_from_graph_requires_manual_review():
    ev = [EXIF_PRESENT, PIXEL_ANOMALY, PROV_VERIFIED]
    rels = build_relationships(ev)
    a = evaluate_evidence(ev, rels)
    assert a.eligibility == DecisionEligibilityState.CONFLICTING
    assert a.final_decision == FinalDecisionState.CONFLICTING_EVIDENCE
    assert "Manual review" in a.explanation
    assert a.relationship_basis == [r.id for r in rels if r.relationship_type == EvidenceRelationshipType.CONFLICTS]


def test_conflict_is_read_from_explicit_relationships():
    """The decision engine trusts the supplied graph instead of re-deriving conflicts."""
    ev = [EXIF_PRESENT, PIXEL_CLEAN, PROV_UNAVAILABLE]
    injected = [EvidenceRelationship(id="rel_x", source_evidence_id="pixel_001", target_evidence_id="meta_001",
                                     relationship_type=EvidenceRelationshipType.CONFLICTS, description="test")]
    a = evaluate_evidence(ev, injected)
    assert a.eligibility == DecisionEligibilityState.CONFLICTING
    assert a.relationship_basis == ["rel_x"]


def test_unavailable_provenance_is_not_conflict():
    ev = [EXIF_ABSENT, PIXEL_ANOMALY, PROV_UNAVAILABLE]
    a = evaluate_evidence(ev, build_relationships(ev))
    assert a.eligibility != DecisionEligibilityState.CONFLICTING
    assert a.final_decision != FinalDecisionState.CONFLICTING_EVIDENCE
    assert "Cryptographic Provenance (C2PA)" in a.missing_evidence  # it is incompleteness instead


def test_consistent_with_relationship_is_cited_as_basis():
    ev = [SOFTWARE_TAG, PIXEL_ANOMALY, PROV_UNAVAILABLE]
    rels = build_relationships(ev)
    a = evaluate_evidence(ev, rels)
    assert a.final_decision == FinalDecisionState.SUPPORTED_MANIPULATION
    assert a.relationship_basis == [rels[0].id]
    assert rels[0].relationship_type == EvidenceRelationshipType.CONSISTENT_WITH


def test_failed_pixel_analysis_is_unknown_not_clean():
    """Unknown != Real: a failed pixel analysis must not be reported as 'no anomalies'."""
    for meta in (EXIF_PRESENT, SOFTWARE_TAG, EXIF_ABSENT):
        ev = [meta, PIXEL_FAILED, PROV_UNAVAILABLE]
        a = evaluate_evidence(ev, build_relationships(ev))
        assert a.eligibility == DecisionEligibilityState.ABSTAIN, meta.observation
        assert a.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE
        assert not any("No obvious pixel-level anomalies" in s for s in a.what_can_be_established)
        assert any("Pixel-level analysis" in m for m in a.missing_evidence)


def test_default_graph_matches_explicit_graph():
    for ev in ([EXIF_ABSENT, PIXEL_CLEAN, PROV_UNAVAILABLE], [SOFTWARE_TAG, PIXEL_ANOMALY, PROV_UNAVAILABLE],
               [EXIF_PRESENT, PIXEL_ANOMALY, PROV_VERIFIED]):
        assert evaluate_evidence(ev) == evaluate_evidence(ev, build_relationships(ev))
