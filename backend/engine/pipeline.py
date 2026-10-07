"""
Investigation pipeline.

    IMAGE BYTES
      -> analyzers            (RawObservation)        backend/forensics/*
      -> normalizer           (Evidence)              engine/normalizer.py
      -> relationship engine  (EvidenceRelationship)  engine/relationship_engine.py
      -> decision integrity   (DecisionAssessment)    engine/decision_maker.py
      -> Investigation

Each stage only consumes the output of the previous stage. Analyzers never
build Evidence; the decision engine never builds relationships.
"""
import uuid
from typing import Callable, List, Optional, Sequence

from backend.models.evidence import Evidence
from backend.models.investigation import Investigation
from backend.models.observation import RawObservation
from backend.forensics.metadata_analyzer import analyze_metadata
from backend.forensics.pixel_analyzer import analyze_pixels
from backend.forensics.provenance_analyzer import analyze_provenance
from backend.engine.normalizer import normalize_observations
from backend.engine.relationship_engine import attach_relationship_refs, build_relationships
from backend.engine.decision_maker import evaluate_evidence

Analyzer = Callable[[bytes], List[RawObservation]]

# Order is fixed so evidence IDs are deterministic for a given image.
DEFAULT_ANALYZERS: Sequence[Analyzer] = (analyze_metadata, analyze_pixels, analyze_provenance)


import io
from PIL import Image
from backend.models.investigation import Investigation, AnalysisMetadata, AnalyzerManifestEntry
from backend.models.observation import RawObservation, ObservationStatus

def collect_observations(content: bytes, analyzers: Sequence[Analyzer] = DEFAULT_ANALYZERS, **kwargs) -> tuple[List[RawObservation], List[AnalyzerManifestEntry]]:
    observations: List[RawObservation] = []
    manifest: List[AnalyzerManifestEntry] = []
    obs_counter = 1
    
    for analyzer in analyzers:
        analyzer_name = analyzer.__name__
        try:
            results = analyzer(content, **kwargs)
            # Determine status based on highest severity in results
            if any(r.status == ObservationStatus.FAILED for r in results):
                status = "FAILED"
            elif all(r.status == ObservationStatus.NOT_PERFORMED for r in results):
                status = "UNAVAILABLE"
            elif all(r.status == ObservationStatus.ABSENT and r.observation_type.value == "JPEG_QUANTIZATION_NOT_APPLICABLE" for r in results):
                # Approximation: if it only says not applicable, we can mark it NOT_APPLICABLE if it was the ONLY result
                # But analyzers might return multiple, so default to EXECUTED if it didn't fail/unavailable entirely.
                status = "EXECUTED" 
            else:
                status = "EXECUTED"
            
            for r in results:
                r.id = f"obs_{obs_counter:03d}"
                obs_counter += 1
                observations.append(r)
                
            manifest.append(AnalyzerManifestEntry(name=analyzer_name, status=status))
            
        except Exception as e:
            manifest.append(AnalyzerManifestEntry(name=analyzer_name, status="FAILED"))

    return observations, manifest


def collect_limitations(evidence: List[Evidence]) -> List[str]:
    return [f"[{e.id}] {e.limitations}" for e in evidence if e.limitations and e.limitations.strip()]


def run_investigation(
    content: bytes,
    image_hash: str,
    investigation_id: Optional[str] = None,
    analyzers: Sequence[Analyzer] = DEFAULT_ANALYZERS,
    **kwargs
) -> Investigation:
    inv_id = investigation_id or str(uuid.uuid4())
    observations, manifest = collect_observations(content, analyzers, **kwargs)
    evidence = normalize_observations(observations)
    relationships = build_relationships(evidence)
    evidence = attach_relationship_refs(evidence, relationships)
    assessment = evaluate_evidence(evidence, relationships)
    
    width, height = 0, 0
    img_format = "unknown"
    try:
        img = Image.open(io.BytesIO(content))
        width, height = img.size
        img_format = img.format.lower() if img.format else "unknown"
    except Exception:
        pass
        
    analysis_meta = AnalysisMetadata(
        analysis_id=inv_id,
        input_sha256=image_hash,
        input_filename=kwargs.get("filename", "unknown"),
        input_format=img_format,
        input_size=len(content),
        width=width,
        height=height
    )

    return Investigation(
        id=inv_id,
        image_hash=image_hash,
        analysis=analysis_meta,
        analyzers=manifest,
        evidence=evidence,
        relationships=relationships,
        assessment=assessment,
        limitations=collect_limitations(evidence),
    )
