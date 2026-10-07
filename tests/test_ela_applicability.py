import hashlib
from backend.engine.pipeline import run_investigation
from backend.models.evidence import EvidenceType, EvidenceStatus
from backend.models.decision import FinalDecisionState, SufficiencyState
from tests.fixtures import noise_png, noise_jpeg, flat_jpeg

def _run(content: bytes) -> dict:
    inv = run_investigation(content, hashlib.sha256(content).hexdigest(), filename="test")
    return inv

def test_png_ela_not_applicable():
    # Test A - PNG must NOT produce ELA_DIFFERENCE_ABOVE_THRESHOLD
    inv = _run(noise_png())
    pixel_evidences = [e for e in inv.evidence if e.evidence_type == EvidenceType.PIXEL]
    ela_evidence = [e for e in pixel_evidences if "ELA" in e.observation_type or "ELA" in e.observation]
    
    assert all(e.observation_type != "ELA_DIFFERENCE_ABOVE_THRESHOLD" for e in ela_evidence)
    # It should have ELA_NOT_APPLICABLE
    not_applicable = [e for e in ela_evidence if e.observation_type == "ELA_NOT_APPLICABLE"]
    assert len(not_applicable) == 1
    assert not_applicable[0].status == EvidenceStatus.UNAVAILABLE

def test_png_decision():
    # Test B - PNG ELA cannot contribute to LIKELY_MANIPULATED
    inv = _run(noise_png())
    # The noise_png has NO EXIF (since we didn't pass software_exif),
    # It has ELA_NOT_APPLICABLE, JPEG_QUANT_NOT_APPLICABLE, PROVENANCE_NOT_CHECKED, and structural consistency (png==png)
    # None of these are positive evidence of manipulation.
    assert inv.assessment.sufficiency == SufficiencyState.INSUFFICIENT
    assert inv.assessment.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE

def test_jpeg_ela_applicable():
    # Test C - JPEG can execute ELA
    inv = _run(noise_jpeg())
    ela_evidence = [e for e in inv.evidence if e.observation_type == "ELA_DIFFERENCE_ABOVE_THRESHOLD"]
    assert len(ela_evidence) == 1
    assert ela_evidence[0].status == EvidenceStatus.SUPPORTED

def test_ela_limitation_retained():
    # Test D - ELA limitation
    inv = _run(noise_jpeg())
    ela_evidence = [e for e in inv.evidence if e.observation_type == "ELA_DIFFERENCE_ABOVE_THRESHOLD"][0]
    assert "NOT scientifically validated" in ela_evidence.limitations

def test_non_applicable_evidence_does_not_increase_sufficiency():
    # Test E - Non-applicable evidence cannot increase sufficiency
    inv = _run(noise_png())
    # All analysis except structural consistency is either UNAVAILABLE or ABSENT
    assert inv.assessment.sufficiency == SufficiencyState.INSUFFICIENT

def test_empty_relationship_graph_no_corroboration():
    # Test F - Empty relationship graph must not automatically imply corroboration
    # flat_jpeg has no ELA anomaly, no software tag.
    inv = _run(flat_jpeg())
    assert len(inv.relationships) == 0
    # The lack of relationships shouldn't lead to a positive result
    assert inv.assessment.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE
