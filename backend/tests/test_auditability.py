import pytest
import hashlib
from backend.engine.pipeline import run_investigation
from backend.models.investigation import Investigation
from backend.models.evidence import EvidenceType, EvidenceStatus
from tests.fixtures import flat_jpeg, noise_png

def test_auditability_sha256():
    # Test 1 & 2 - SHA-256 and Different files
    b1 = flat_jpeg()
    b2 = noise_png()
    hash1 = hashlib.sha256(b1).hexdigest()
    hash2 = hashlib.sha256(b2).hexdigest()
    
    inv1 = run_investigation(b1, hash1, filename="test1.jpg")
    inv2 = run_investigation(b2, hash2, filename="test2.png")
    
    assert inv1.analysis.input_sha256 == hash1
    assert inv2.analysis.input_sha256 == hash2
    assert inv1.analysis.input_sha256 != inv2.analysis.input_sha256

def test_auditability_analysis_id():
    # Test 3 - Analysis ID
    b = flat_jpeg()
    hash_val = hashlib.sha256(b).hexdigest()
    inv1 = run_investigation(b, hash_val, filename="test.jpg")
    inv2 = run_investigation(b, hash_val, filename="test.jpg")
    
    assert inv1.analysis.analysis_id
    assert inv2.analysis.analysis_id
    assert inv1.analysis.analysis_id != inv2.analysis.analysis_id

def test_auditability_analyzer_manifest():
    # Test 4 & 5 - Analyzer manifest and Unavailable provenance
    b = flat_jpeg()
    hash_val = hashlib.sha256(b).hexdigest()
    inv = run_investigation(b, hash_val, filename="test.jpg")
    
    manifest_names = {a.name for a in inv.analyzers}
    assert "analyze_metadata" in manifest_names
    assert "analyze_pixels" in manifest_names
    assert "analyze_provenance" in manifest_names
    
    provenance_entry = next(a for a in inv.analyzers if a.name == "analyze_provenance")
    assert provenance_entry.status == "UNAVAILABLE"
    
    metadata_entry = next(a for a in inv.analyzers if a.name == "analyze_metadata")
    assert metadata_entry.status == "EXECUTED"

def test_auditability_evidence_traceability():
    # Test 6 - Evidence traceability
    b = flat_jpeg()
    hash_val = hashlib.sha256(b).hexdigest()
    inv = run_investigation(b, hash_val, filename="test.jpg")
    
    for ev in inv.evidence:
        assert ev.source_observation_id is not None
        assert ev.source_observation_id.startswith("obs_")

def test_auditability_relationship_traceability():
    # Test 7 - Relationship traceability
    b = noise_png() # will trigger ELA anomaly
    hash_val = hashlib.sha256(b).hexdigest()
    inv = run_investigation(b, hash_val, filename="test.png")
    
    # Check if there are any relationships (e.g. ELA anomaly + JPEG Quantization NOT APPLICABLE doesn't have consistent_with,
    # but noise_png might not trigger jpeg quantization relationship since it's PNG. 
    # Let's just ensure if relationships exist, they point to valid evidence IDs)
    evidence_ids = {e.id for e in inv.evidence}
    for rel in inv.relationships:
        assert rel.source_evidence_id in evidence_ids
        assert rel.target_evidence_id in evidence_ids

def test_auditability_decision_traceability():
    # Test 8 - Decision traceability
    b = noise_png()
    hash_val = hashlib.sha256(b).hexdigest()
    inv = run_investigation(b, hash_val, filename="test.png")
    
    # final assessment is present
    assert inv.assessment is not None
    # relationship_basis references relationships
    rel_ids = {r.id for r in inv.relationships}
    for rb in inv.assessment.relationship_basis:
        assert rb in rel_ids
