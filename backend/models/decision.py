from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class DecisionEligibilityState(str, Enum):
    CONCLUSION_MAY_BE_ISSUED = "CONCLUSION_MAY_BE_ISSUED"
    ABSTAIN = "ABSTAIN"
    CONFLICTING = "CONFLICTING"
    MANUAL_REVIEW = "MANUAL_REVIEW"

class FinalDecisionState(str, Enum):
    SUPPORTED_MANIPULATION = "SUPPORTED_MANIPULATION"
    LIKELY_MANIPULATED = "LIKELY_MANIPULATED"
    NO_SIGNIFICANT_MANIPULATION_EVIDENCE = "NO_SIGNIFICANT_MANIPULATION_EVIDENCE"
    CONFLICTING_EVIDENCE = "CONFLICTING_EVIDENCE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    INCONCLUSIVE = "INCONCLUSIVE"
    UNKNOWN = "UNKNOWN"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"

class SufficiencyState(str, Enum):
    SUFFICIENT = "SUFFICIENT"
    INSUFFICIENT = "INSUFFICIENT"
    NOT_EVALUATED = "NOT_EVALUATED"

class DecisionAssessment(BaseModel):
    eligibility: DecisionEligibilityState
    final_decision: FinalDecisionState
    what_can_be_established: List[str]
    what_cannot_be_established: List[str]
    missing_evidence: List[str]
    explanation: str
    # Explicit sufficiency state (previously only implicit in the decision branch taken).
    sufficiency: SufficiencyState = SufficiencyState.NOT_EVALUATED
    # IDs of EvidenceRelationship objects the decision relied on.
    relationship_basis: List[str] = Field(default_factory=list)
