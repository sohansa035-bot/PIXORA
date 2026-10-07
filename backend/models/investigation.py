from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .evidence import Evidence, EvidenceRelationship
from .decision import DecisionAssessment

class Investigation(BaseModel):
    id: str
    image_hash: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    question: str = "Does the available evidence support a conclusion that the image has undergone digital manipulation?"
    evidence: List[Evidence] = []
    relationships: List[EvidenceRelationship] = []
    assessment: Optional[DecisionAssessment] = None
