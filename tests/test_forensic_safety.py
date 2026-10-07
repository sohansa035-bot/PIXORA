import pytest
from backend.models.evidence import Evidence, EvidenceType, EvidenceStatus, Reliability
from backend.models.decision import DecisionEligibilityState, FinalDecisionState, SufficiencyState
from backend.engine.decision_maker import evaluate_evidence
from backend.engine.relationship_engine import build_relationships
from backend.models.observation import ObservationType

def _ev(id, etype, status, observation="obs", observation_type=None, reliability=Reliability.MEDIUM):
    return Evidence(id=id, source="test", evidence_type=etype, observation=observation,
                    reliability=reliability, applicability="test", status=status, limitations="",
                    observation_type=observation_type)

PIXEL_ANOMALY = _ev("pixel_001", EvidenceType.PIXEL, EvidenceStatus.SUPPORTED, "High ELA",
                    "ELA_DIFFERENCE_ABOVE_THRESHOLD")
PIXEL_CLEAN = _ev("pixel_001", EvidenceType.PIXEL, EvidenceStatus.VERIFIED, "Low ELA",
                  "ELA_DIFFERENCE_BELOW_THRESHOLD")
EXIF_ABSENT = _ev("meta_001", EvidenceType.METADATA, EvidenceStatus.VERIFIED,
                  "No EXIF metadata found", "EXIF_ABSENT", Reliability.HIGH)
EXIF_PRESENT = _ev("meta_001", EvidenceType.METADATA, EvidenceStatus.VERIFIED,
                   "EXIF data present", "EXIF_PRESENT_NO_SOFTWARE_TAG")
PROV_UNAVAILABLE = _ev("prov_001", EvidenceType.PROVENANCE, EvidenceStatus.UNAVAILABLE,
                       "C2PA / Provenance data unavailable.", "PROVENANCE_NOT_CHECKED", Reliability.UNKNOWN)
PROV_VERIFIED = _ev("prov_001", EvidenceType.PROVENANCE, EvidenceStatus.VERIFIED, "Valid C2PA",
                    reliability=Reliability.HIGH)

def test_missing_exif_not_manipulation_proof():
    ev = [EXIF_ABSENT, PIXEL_CLEAN, PROV_UNAVAILABLE]
    a = evaluate_evidence(ev, build_relationships(ev))
    assert a.eligibility == DecisionEligibilityState.ABSTAIN
    assert a.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE

def test_ela_anomaly_not_automatic_manipulation_proof():
    # EXIF present but no corroborating tags + ELA anomaly + Prov Unavailable
    ev = [EXIF_PRESENT, PIXEL_ANOMALY, PROV_UNAVAILABLE]
    a = evaluate_evidence(ev, build_relationships(ev))
    # Should be LIKELY_MANIPULATED, not SUPPORTED_MANIPULATION, because no corroboration
    assert a.eligibility == DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED
    assert a.final_decision == FinalDecisionState.LIKELY_MANIPULATED

def test_scenario_c_missing_exif_plus_ela_anomaly():
    # Missing EXIF + ELA Anomaly = INSUFFICIENT
    ev = [EXIF_ABSENT, PIXEL_ANOMALY, PROV_UNAVAILABLE]
    a = evaluate_evidence(ev, build_relationships(ev))
    assert a.eligibility == DecisionEligibilityState.ABSTAIN
    assert a.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE
    assert any("metadata and provenance are unavailable" in r for r in a.explanation.split(". "))

def test_unavailable_provenance_not_conflict():
    ev = [EXIF_ABSENT, PIXEL_ANOMALY, PROV_UNAVAILABLE]
    a = evaluate_evidence(ev, build_relationships(ev))
    assert a.eligibility != DecisionEligibilityState.CONFLICTING

def test_metadata_presence_not_authenticity_proof():
    ev = [EXIF_PRESENT, PIXEL_CLEAN, PROV_UNAVAILABLE]
    a = evaluate_evidence(ev, build_relationships(ev))
    # Evidence is sufficient and consistent, but "No significant manipulation evidence"
    # does NOT guarantee it's authentic.
    assert a.final_decision == FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE
    assert "does not guarantee contextual truth" in a.explanation

