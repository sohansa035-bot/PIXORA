from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class EvidenceType(str, Enum):
    PIXEL = "PIXEL"
    METADATA = "METADATA"
    PROVENANCE = "PROVENANCE"
    CONTEXT = "CONTEXT"
    UNKNOWN = "UNKNOWN"

class EvidenceStatus(str, Enum):
    VERIFIED = "VERIFIED"
    SUPPORTED = "SUPPORTED"
    WEAK = "WEAK"
    UNVERIFIED = "UNVERIFIED"
    UNKNOWN = "UNKNOWN"
    UNAVAILABLE = "UNAVAILABLE"

class Reliability(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNKNOWN = "UNKNOWN"

class Evidence(BaseModel):
    id: str
    source_observation_id: Optional[str] = None
    source: str
    evidence_type: EvidenceType
    observation: str
    inference: Optional[str] = None
    region: Optional[str] = None
    confidence: Optional[float] = None
    reliability: Reliability
    applicability: str
    status: EvidenceStatus
    limitations: str
    relationships: List[str] = []
    provenance: Optional[str] = None
    # Set by the normalizer. Optional so hand-built Evidence stays valid.
    observation_type: Optional[str] = None
    raw_details: Dict[str, Any] = Field(default_factory=dict)

class EvidenceRelationshipType(str, Enum):
    SUPPORTS = "SUPPORTS"
    CONFLICTS = "CONFLICTS"
    CONSISTENT_WITH = "CONSISTENT_WITH"
    DOES_NOT_ESTABLISH = "DOES_NOT_ESTABLISH"
    MISSING = "MISSING"
    UNKNOWN = "UNKNOWN"

class EvidenceRelationship(BaseModel):
    id: str
    source_evidence_id: str
    target_evidence_id: str
    relationship_type: EvidenceRelationshipType
    description: str
