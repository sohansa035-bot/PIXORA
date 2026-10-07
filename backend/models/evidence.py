from pydantic import BaseModel
from typing import Optional, List
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
