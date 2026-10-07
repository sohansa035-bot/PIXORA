from typing import List
from backend.models.evidence import Evidence, EvidenceType, EvidenceStatus
from backend.models.decision import DecisionAssessment, DecisionEligibilityState, FinalDecisionState

def evaluate_evidence(evidence_list: List[Evidence]) -> DecisionAssessment:
    # 1. Collect context
    pixel_evidence = [e for e in evidence_list if e.evidence_type == EvidenceType.PIXEL]
    meta_evidence = [e for e in evidence_list if e.evidence_type == EvidenceType.METADATA]
    prov_evidence = [e for e in evidence_list if e.evidence_type == EvidenceType.PROVENANCE]

    has_pixel_anomaly = any(e.status == EvidenceStatus.SUPPORTED for e in pixel_evidence)
    
    # Metadata anomalies: Software tag present or metadata completely missing
    has_meta_missing = any("No EXIF metadata found" in e.observation for e in meta_evidence)
    has_meta_software = any("Software tag found" in e.observation for e in meta_evidence)
    
    is_prov_valid = any(e.status == EvidenceStatus.VERIFIED for e in prov_evidence)

    what_can = []
    what_cannot = []
    missing = []
    
    if has_meta_missing:
        missing.append("Original EXIF Metadata")
        what_cannot.append("Determine original capture device or software due to lack of metadata.")
    
    if not prov_evidence or not is_prov_valid:
        missing.append("Cryptographic Provenance (C2PA)")
        what_cannot.append("Guarantee mathematical authenticity of the origin.")

    # 2. Conflict Check
    if has_pixel_anomaly and is_prov_valid:
        # Conflict: Pixel analysis says manipulated, but provenance says it's cryptographically valid and untampered
        return DecisionAssessment(
            eligibility=DecisionEligibilityState.CONFLICTING,
            final_decision=FinalDecisionState.CONFLICTING_EVIDENCE,
            what_can_be_established=what_can,
            what_cannot_be_established=what_cannot,
            missing_evidence=missing,
            explanation="Cryptographic provenance claims validity, but pixel analysis detects localized anomalies. Manual review is required to resolve this conflict."
        )

    # 3. Sufficiency Check
    # If we have literally no metadata, no provenance, and pixel analysis is inconclusive
    # we should ABSTAIN rather than claiming "REAL".
    if has_meta_missing and not has_pixel_anomaly and not is_prov_valid:
        return DecisionAssessment(
            eligibility=DecisionEligibilityState.ABSTAIN,
            final_decision=FinalDecisionState.INSUFFICIENT_EVIDENCE,
            what_can_be_established=what_can,
            what_cannot_be_established=what_cannot,
            missing_evidence=missing,
            explanation="Image lacks metadata, provenance, and significant pixel anomalies. There is insufficient evidence to make a definitive forensic claim. Abstaining."
        )

    # 4. Conclusion
    if has_pixel_anomaly:
        what_can.append("Pixel-level anomalies detected consistent with manipulation.")
        if has_meta_software:
            what_can.append("Metadata confirms interaction with editing software.")
            
        return DecisionAssessment(
            eligibility=DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
            final_decision=FinalDecisionState.SUPPORTED_MANIPULATION,
            what_can_be_established=what_can,
            what_cannot_be_established=what_cannot,
            missing_evidence=missing,
            explanation="Evidence is sufficient and consistent. Pixel anomalies support a conclusion of digital manipulation."
        )
    else:
        what_can.append("No obvious pixel-level anomalies detected.")
        if has_meta_software:
            return DecisionAssessment(
                eligibility=DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
                final_decision=FinalDecisionState.LIKELY_MANIPULATED,
                what_can_be_established=what_can,
                what_cannot_be_established=what_cannot,
                missing_evidence=missing,
                explanation="Software editing traces found in metadata, though no pixel anomalies were strongly detected. Image was likely modified."
            )
            
        return DecisionAssessment(
            eligibility=DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
            final_decision=FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE,
            what_can_be_established=what_can,
            what_cannot_be_established=what_cannot,
            missing_evidence=missing,
            explanation="Evidence is sufficient and consistent. No significant indicators of manipulation were found. NOTE: This does not guarantee contextual truth."
        )
