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


def collect_observations(content: bytes, analyzers: Sequence[Analyzer] = DEFAULT_ANALYZERS) -> List[RawObservation]:
    observations: List[RawObservation] = []
    for analyzer in analyzers:
        observations.extend(analyzer(content))
    return observations


def collect_limitations(evidence: List[Evidence]) -> List[str]:
    return [f"[{e.id}] {e.limitations}" for e in evidence if e.limitations and e.limitations.strip()]


def run_investigation(
    content: bytes,
    image_hash: str,
    investigation_id: Optional[str] = None,
    analyzers: Sequence[Analyzer] = DEFAULT_ANALYZERS,
) -> Investigation:
    observations = collect_observations(content, analyzers)
    evidence = normalize_observations(observations)
    relationships = build_relationships(evidence)
    evidence = attach_relationship_refs(evidence, relationships)
    assessment = evaluate_evidence(evidence, relationships)

    return Investigation(
        id=investigation_id or str(uuid.uuid4()),
        image_hash=image_hash,
        evidence=evidence,
        relationships=relationships,
        assessment=assessment,
        limitations=collect_limitations(evidence),
    )
