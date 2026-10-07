from pydantic import BaseModel
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

class DecisionAssessment(BaseModel):
    eligibility: DecisionEligibilityState
    final_decision: FinalDecisionState
    what_can_be_established: List[str]
    what_cannot_be_established: List[str]
    missing_evidence: List[str]
    explanation: str
