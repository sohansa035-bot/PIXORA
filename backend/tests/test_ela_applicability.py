import hashlib
from backend.engine.pipeline import run_investigation
from backend.models.evidence import EvidenceType, EvidenceStatus
from backend.models.decision import FinalDecisionState, SufficiencyState
from tests.fixtures import noise_png, noise_jpeg, flat_jpeg

def _run(content: bytes, filename="test.png") -> dict:
    inv = run_investigation(content, hashlib.sha256(content).hexdigest(), filename=filename)
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
    
    # Test boundary fields
    assert hasattr(inv, "forensic_boundaries")
    assert inv.forensic_boundaries is not None
    assert len(inv.forensic_boundaries.missing_evidence) > 0
    # Test 2 - PNG ELA Wording
    assert not any("ELA failed" in me for me in inv.forensic_boundaries.missing_evidence)
    assert any("ELA not applicable to this file format" in me for me in inv.forensic_boundaries.missing_evidence)

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
    inv = _run(noise_jpeg(), filename="test.jpeg")
    ela_evidence = [e for e in inv.evidence if e.observation_type == "ELA_DIFFERENCE_ABOVE_THRESHOLD"]
    assert len(ela_evidence) == 1
    assert ela_evidence[0].status == EvidenceStatus.SUPPORTED

def test_ela_limitation_retained():
    # Test D - ELA limitation
    inv = _run(noise_jpeg(), filename="test.jpeg")
    ela_evidence = [e for e in inv.evidence if e.observation_type == "ELA_DIFFERENCE_ABOVE_THRESHOLD"][0]
    assert "NOT scientifically validated" in ela_evidence.limitations

def test_non_applicable_evidence_does_not_increase_sufficiency():
    # Test E - Non-applicable evidence cannot increase sufficiency
    inv = _run(noise_png())
    # All analysis except structural consistency is either UNAVAILABLE or ABSENT
    assert inv.assessment.sufficiency == SufficiencyState.INSUFFICIENT

def test_empty_relationship_graph_no_corroboration():
    # Test F - Empty relationship graph must not automatically imply corroboration
    # flat_jpeg has no ELA anomaly, no software tag -> NO_SIGNIFICANT_MANIPULATION_EVIDENCE
    inv = _run(flat_jpeg(), filename="test.jpeg")
    assert len(inv.relationships) == 0
    # Clean JPEG with no ELA anomaly concludes NO_SIGNIFICANT_MANIPULATION_EVIDENCE
    assert inv.assessment.final_decision == FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE
    assert inv.assessment.final_decision not in (FinalDecisionState.SUPPORTED_MANIPULATION, FinalDecisionState.LIKELY_MANIPULATED)

def test_png_structural_consistency():
    # TEST 1 - Valid PNG structural consistency
    inv = _run(noise_png())
    # Should say "File structure and extension are consistent."
    assert "File structure and extension are consistent." in inv.forensic_boundaries.what_can_be_established
    assert not any("Structural inconsistency detected" in s for s in inv.forensic_boundaries.what_can_be_established)

def test_c2pa_semantics():
    # TEST 4 - C2PA semantics
    inv = _run(noise_png())
    c2pa_summary = next(s for s in inv.evidence_summary if s.category == "C2PA")
    assert c2pa_summary.availability == "UNAVAILABLE"
    assert c2pa_summary.applicability == "APPLICABLE"
