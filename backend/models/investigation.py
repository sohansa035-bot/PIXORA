from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .evidence import Evidence, EvidenceRelationship
from .decision import DecisionAssessment

class AnalysisMetadata(BaseModel):
    analysis_id: str
    input_sha256: str
    input_filename: str
    input_format: str
    input_size: int
    width: int
    height: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AnalyzerManifestEntry(BaseModel):
    name: str
    status: str

class ForensicBoundaries(BaseModel):
    what_can_be_established: List[str]
    what_cannot_be_established: List[str]
    limitations: List[str]
    missing_evidence: List[str]

class EvidenceSummaryEntry(BaseModel):
    category: str
    availability: str
    applicability: str
    reliability: str

class Investigation(BaseModel):
    id: str
    image_hash: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    question: str = "Does the available evidence support a conclusion that the image has undergone digital manipulation?"
    analysis: Optional[AnalysisMetadata] = None
    analyzers: List[AnalyzerManifestEntry] = []
    evidence: List[Evidence] = []
    relationships: List[EvidenceRelationship] = []
    assessment: Optional[DecisionAssessment] = None
    # Aggregated, per-evidence limitations ("[evidence_id] limitation text").
    limitations: List[str] = []
    
    forensic_boundaries: Optional[ForensicBoundaries] = None
    evidence_summary: List[EvidenceSummaryEntry] = []
