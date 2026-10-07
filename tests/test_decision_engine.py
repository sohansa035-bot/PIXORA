import pytest
from backend.models.evidence import Evidence, EvidenceType, EvidenceStatus, Reliability
from backend.models.decision import DecisionEligibilityState, FinalDecisionState
from backend.engine.decision_maker import evaluate_evidence

def test_scenario_b_insufficient_evidence():
    ev_list = [
        Evidence(
            id="1", source="meta", evidence_type=EvidenceType.METADATA,
            observation="No EXIF metadata found", reliability=Reliability.HIGH,
            applicability="Contextual", status=EvidenceStatus.VERIFIED, limitations=""
        ),
        Evidence(
            id="2", source="pixel", evidence_type=EvidenceType.PIXEL,
            observation="Uniform ELA", reliability=Reliability.MEDIUM,
            applicability="Pixel", status=EvidenceStatus.VERIFIED, limitations=""
        ),
        Evidence(
            id="3", source="prov", evidence_type=EvidenceType.PROVENANCE,
            observation="Unavailable", reliability=Reliability.UNKNOWN,
            applicability="Contextual", status=EvidenceStatus.UNAVAILABLE, limitations=""
        )
    ]
    assessment = evaluate_evidence(ev_list)
    assert assessment.eligibility == DecisionEligibilityState.ABSTAIN
    assert assessment.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE

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
