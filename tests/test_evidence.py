import pytest
from backend.models.evidence import Evidence, EvidenceType, EvidenceStatus, Reliability
from backend.models.decision import DecisionAssessment, DecisionEligibilityState, FinalDecisionState

def test_evidence_model_creation():
    ev = Evidence(
        id="ev_001",
        source="pixel_analyzer",
        evidence_type=EvidenceType.PIXEL,
        observation="Strong localized noise pattern in top-right quadrant.",
        inference="Possible splicing or localized modification.",
        reliability=Reliability.MEDIUM,
        applicability="Directly relevant to pixel modification query.",
        status=EvidenceStatus.SUPPORTED,
        limitations="Method is sensitive to heavy JPEG compression."
    )
    assert ev.id == "ev_001"
    assert ev.evidence_type == EvidenceType.PIXEL
    assert ev.status == EvidenceStatus.SUPPORTED

def test_decision_assessment():
    decision = DecisionAssessment(
        eligibility=DecisionEligibilityState.ABSTAIN,
        final_decision=FinalDecisionState.INSUFFICIENT_EVIDENCE,
        what_can_be_established=[],
        what_cannot_be_established=["Authenticity", "Modification history"],
        missing_evidence=["Original Metadata", "Provenance"],
        explanation="Due to lack of metadata and inconclusive pixel tests, the system abstains from a decision."
    )
    assert decision.eligibility == DecisionEligibilityState.ABSTAIN
    assert decision.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE
