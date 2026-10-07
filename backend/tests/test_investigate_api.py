"""
End-to-end API integration tests for /api/investigate and technical failure separation.
"""
import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models.decision import FinalDecisionState, DecisionEligibilityState, SufficiencyState
from backend.engine.pipeline import run_investigation, collect_observations
from backend.models.observation import RawObservation, ObservationType, ObservationStatus
from backend.models.evidence import EvidenceType, EvidenceStatus
from tests.fixtures import flat_jpeg, noise_jpeg, noise_png, software_exif

client = TestClient(app)


def test_api_clean_jpeg_no_exif():
    """Case A: Clean JPEG without EXIF metadata concludes NO_SIGNIFICANT_MANIPULATION_EVIDENCE."""
    data = flat_jpeg()
    response = client.post(
        "/api/investigate",
        files={"file": ("clean.jpg", data, "image/jpeg")}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["assessment"]["final_decision"] == FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE
    assert res["assessment"]["eligibility"] == DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED
    assert res["assessment"]["sufficiency"] == SufficiencyState.SUFFICIENT
    assert "uniform error-level distribution" in res["assessment"]["explanation"]


def test_api_jpeg_with_ela_anomaly():
    """Case B: JPEG with strong ELA anomaly concludes LIKELY_MANIPULATED."""
    data = noise_jpeg()
    response = client.post(
        "/api/investigate",
        files={"file": ("tampered.jpg", data, "image/jpeg")}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["assessment"]["final_decision"] == FinalDecisionState.LIKELY_MANIPULATED
    assert res["assessment"]["eligibility"] == DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED
    assert "does not definitively prove manipulation" in res["assessment"]["explanation"]


def test_api_jpeg_with_ela_anomaly_and_software_metadata():
    """Case C: JPEG with ELA anomaly + supporting software metadata concludes SUPPORTED_MANIPULATION."""
    data = noise_jpeg(exif=software_exif("Adobe Photoshop 2024"))
    response = client.post(
        "/api/investigate",
        files={"file": ("edited.jpg", data, "image/jpeg")}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["assessment"]["final_decision"] == FinalDecisionState.SUPPORTED_MANIPULATION
    assert res["assessment"]["eligibility"] == DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED
    assert len(res["assessment"]["relationship_basis"]) > 0


def test_api_png_insufficient_evidence():
    """Case D: PNG with no usable forensic evidence concludes INSUFFICIENT_EVIDENCE."""
    data = noise_png()
    response = client.post(
        "/api/investigate",
        files={"file": ("graphic.png", data, "image/png")}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["assessment"]["final_decision"] == FinalDecisionState.INSUFFICIENT_EVIDENCE
    assert res["assessment"]["eligibility"] == DecisionEligibilityState.ABSTAIN
    assert res["assessment"]["sufficiency"] == SufficiencyState.INSUFFICIENT


def test_api_invalid_non_image_upload_rejected():
    """Case E: Non-image uploads return technical HTTP 400 error, not forensic INSUFFICIENT_EVIDENCE."""
    response = client.post(
        "/api/investigate",
        files={"file": ("document.txt", b"Hello world, this is a text file.", "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_api_corrupt_image_upload_rejected():
    """Case E (cont): Corrupted image bytes return technical HTTP 400 error."""
    response = client.post(
        "/api/investigate",
        files={"file": ("corrupt.jpg", b"NOT_A_REAL_IMAGE_BYTES_AT_ALL", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "Image validation failed" in response.json()["detail"]


def test_api_empty_file_upload_rejected():
    """Empty files return technical HTTP 400 error."""
    response = client.post(
        "/api/investigate",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "Empty upload" in response.json()["detail"]


def test_analyzer_failure_technical_separation():
    """Case F: Analyzer/backend failure produces ANALYSIS_FAILED / UNAVAILABLE, not false forensic claims."""
    def failing_analyzer(content: bytes):
        raise RuntimeError("Low-level forensic library crash")

    observations, manifest = collect_observations(flat_jpeg(), analyzers=[failing_analyzer])
    # The manifest marks the analyzer as FAILED
    assert any(m.status == "FAILED" for m in manifest)

    # If an analyzer produces an ANALYSIS_FAILED observation
    failed_obs = RawObservation(
        source="failing_analyzer",
        evidence_type=EvidenceType.PIXEL,
        observation_type=ObservationType.ANALYSIS_FAILED,
        status=ObservationStatus.FAILED,
        observation="Pixel analysis failed: Low-level forensic library crash",
        raw_details={"error": "RuntimeError"},
        limitations=["Analysis exception."],
    )
    from backend.engine.normalizer import normalize_observations
    ev = normalize_observations([failed_obs])
    assert len(ev) == 1
    assert ev[0].status == EvidenceStatus.UNAVAILABLE
    assert ev[0].observation_type == "ANALYSIS_FAILED"
