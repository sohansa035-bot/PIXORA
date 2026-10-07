"""
End-to-end pipeline tests (IMAGE -> observations -> evidence -> relationships ->
decision -> Investigation) plus explicit checks of the forensic distinction rules.

These test SOFTWARE BEHAVIOR on synthetic images. They are not forensic
validation: synthetic fixtures have no ground truth about real-world editing.
"""
import hashlib
import re

from backend.engine.pipeline import collect_observations, run_investigation
from backend.models.decision import DecisionEligibilityState, FinalDecisionState, SufficiencyState
from backend.models.evidence import EvidenceRelationshipType, EvidenceStatus, EvidenceType
from backend.models.investigation import Investigation
from backend.models.observation import RawObservation
from tests.fixtures import flat_jpeg, noise_png, noise_jpeg, software_exif

VERDICT_WORDS = re.compile(r"\b(fake|forged|forgery|authentic image|is real|genuine)\b", re.I)


def _run(content: bytes) -> Investigation:
    return run_investigation(content, hashlib.sha256(content).hexdigest())


def test_pipeline_stages_and_shape_for_insufficient_case():
    content = flat_jpeg()
    obs, manifest = collect_observations(content)
    assert all(isinstance(o, RawObservation) for o in obs)

    inv = _run(content)
    # verify that meta, pixel, and prov are present instead of hardcoding length
    ids = [e.id for e in inv.evidence]
    assert any(i.startswith("meta_") for i in ids)
    assert any(i.startswith("pixel_") for i in ids)
    assert any(i.startswith("prov_") for i in ids)
    assert inv.relationships == []  # nothing justifies a relationship
    assert all(e.relationships == [] for e in inv.evidence)
    assert inv.assessment.eligibility == DecisionEligibilityState.ABSTAIN
    assert inv.assessment.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE
    assert inv.assessment.sufficiency == SufficiencyState.INSUFFICIENT
    assert any("[pixel_" in l for l in inv.limitations)
    assert any("[prov_" in l for l in inv.limitations)


def test_pipeline_populates_relationship_graph_when_justified():
    inv = _run(noise_jpeg(exif=software_exif()))
    assert all(r.relationship_type == EvidenceRelationshipType.CONSISTENT_WITH for r in inv.relationships)
    # Find the software -> pixel anomaly relationship
    by_id = {e.id: e for e in inv.evidence}
    rel = next(r for r in inv.relationships if by_id[r.source_evidence_id].evidence_type == EvidenceType.METADATA)
    
    assert by_id[rel.source_evidence_id].evidence_type == EvidenceType.METADATA
    assert by_id[rel.target_evidence_id].evidence_type == EvidenceType.PIXEL
    assert rel.id in by_id[rel.source_evidence_id].relationships
    assert rel.id in by_id[rel.target_evidence_id].relationships
    assert rel.id in inv.assessment.relationship_basis


def test_investigation_serializes_all_required_sections():
    data = _run(noise_jpeg()).model_dump(mode="json")
    for key in ("evidence", "relationships", "assessment", "limitations"):
        assert key in data
    for key in ("final_decision", "eligibility", "sufficiency", "relationship_basis"):
        assert key in data["assessment"]


# ---------------- Forensic distinction rules ----------------

def test_rule_no_metadata_is_not_fake():
    inv = _run(flat_jpeg())  # no EXIF, clean ELA
    assert inv.assessment.final_decision not in (
        FinalDecisionState.SUPPORTED_MANIPULATION, FinalDecisionState.LIKELY_MANIPULATED)


def test_rule_metadata_present_is_not_authentic():
    inv = _run(flat_jpeg(exif=software_exif("Camera Firmware 1.0")))
    text = " ".join([inv.assessment.explanation, *inv.assessment.what_can_be_established])
    assert not VERDICT_WORDS.search(text)
    assert "Guarantee mathematical authenticity of the origin." in inv.assessment.what_cannot_be_established


def test_rule_ela_anomaly_is_hedged_signal_not_proof():
    inv = _run(noise_jpeg())
    pixel = next(e for e in inv.evidence if e.evidence_type == EvidenceType.PIXEL and e.observation_type == "ELA_DIFFERENCE_ABOVE_THRESHOLD")
    assert pixel.status == EvidenceStatus.SUPPORTED  # not VERIFIED
    assert "may indicate" in pixel.inference
    assert "NOT scientifically validated" in pixel.limitations
    assert not VERDICT_WORDS.search(f"{pixel.observation} {pixel.inference} {inv.assessment.explanation}")


def test_rule_unavailable_provenance_is_not_conflict():
    inv = _run(noise_jpeg())  # pixel anomaly + provenance not checked
    assert EvidenceRelationshipType.CONFLICTS not in [r.relationship_type for r in inv.relationships]
    assert inv.assessment.eligibility != DecisionEligibilityState.CONFLICTING


def test_rule_unknown_is_neither_real_nor_fake():
    inv = _run(flat_jpeg())
    assert inv.assessment.final_decision == FinalDecisionState.INSUFFICIENT_EVIDENCE
    assert inv.assessment.final_decision != FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE


def test_rule_observation_inference_conclusion_are_separate_fields():
    inv = _run(noise_jpeg())
    for e in inv.evidence:
        assert e.observation and e.observation != e.inference
    # Conclusions exist only on the assessment, never on evidence.
    assert not any(hasattr(e, "final_decision") for e in inv.evidence)


def test_no_binary_real_fake_states_exist():
    names = {s.name for s in FinalDecisionState}
    assert not names & {"REAL", "FAKE", "AUTHENTIC", "FORGED"}
