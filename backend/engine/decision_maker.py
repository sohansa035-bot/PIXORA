"""
Decision integrity engine.

Boundary:  (List[Evidence], List[EvidenceRelationship])  ->  DecisionAssessment

Consumes NORMALIZED evidence plus the EXPLICIT relationship graph. Conflicts
are read from CONFLICTS relationships rather than re-derived here; supporting
context is read from CONSISTENT_WITH relationships. Evidence-state predicates
are shared with the relationship engine (engine/evidence_predicates.py).

Order of evaluation (unchanged from the pre-refactor engine):
  1. completeness  -> missing_evidence / what_cannot_be_established
  2. conflict      -> CONFLICTING (manual review), if any CONFLICTS relationship exists
  3. sufficiency   -> ABSTAIN / INSUFFICIENT_EVIDENCE when evidence is insufficient
  4. conclusion    -> only reached when evidence is sufficient and not conflicting
"""
from typing import List, Optional

from backend.models.evidence import Evidence, EvidenceRelationship, EvidenceRelationshipType
from backend.models.decision import (
    DecisionAssessment,
    DecisionEligibilityState,
    FinalDecisionState,
    SufficiencyState,
)
from backend.engine.evidence_predicates import (
    is_metadata_absent,
    is_metadata_available,
    is_pixel_anomaly,
    is_pixel_assessed,
    is_provenance_verified,
    is_software_tag,
    is_structural_inconsistency,
    is_structural_consistency,
    is_jpeg_quantization_observed,
)
from backend.models.observation import ObservationType
from backend.engine.relationship_engine import build_relationships


def evaluate_evidence(
    evidence_list: List[Evidence],
    relationships: Optional[List[EvidenceRelationship]] = None,
) -> DecisionAssessment:
    # Backward compatibility: callers that only pass evidence get the graph built
    # by the dedicated relationship engine (never by ad-hoc logic in this module).
    if relationships is None:
        relationships = build_relationships(evidence_list)

    conflicts = [r for r in relationships if r.relationship_type == EvidenceRelationshipType.CONFLICTS]
    consistent = [r for r in relationships if r.relationship_type == EvidenceRelationshipType.CONSISTENT_WITH]

    # 1. Collect evidence states
    has_pixel_anomaly = any(is_pixel_anomaly(e) for e in evidence_list)
    pixel_assessed = any(is_pixel_assessed(e) for e in evidence_list)
    has_meta_missing = any(is_metadata_absent(e) for e in evidence_list)
    meta_available = any(is_metadata_available(e) for e in evidence_list)
    has_meta_software = any(is_software_tag(e) for e in evidence_list)
    is_prov_valid = any(is_provenance_verified(e) for e in evidence_list)
    has_structural_inconsistency = any(is_structural_inconsistency(e) for e in evidence_list)
    has_structural_consistency = any(is_structural_consistency(e) for e in evidence_list)
    has_jpeg_quantization = any(is_jpeg_quantization_observed(e) for e in evidence_list)

    what_can = []
    what_cannot = []
    missing = []
    
    if has_structural_inconsistency:
        what_can.append("Structural inconsistency detected: file structure or format does not match extension.")
    elif has_structural_consistency:
        what_can.append("File structure and extension are consistent.")
        
    if has_jpeg_quantization:
        what_can.append("JPEG quantization tables observed.")

    if has_meta_missing:
        missing.append("Original EXIF Metadata")
        what_cannot.append("Determine original capture device or software due to lack of metadata.")
    elif not meta_available:
        missing.append("EXIF Metadata (metadata analysis failed or was not run)")
        what_cannot.append("Determine original capture device or software because metadata could not be read.")

    if not is_prov_valid:
        missing.append("Cryptographic Provenance (C2PA)")
        what_cannot.append("Guarantee mathematical authenticity of the origin.")

    if not pixel_assessed:
        is_ela_not_applicable = any(e.observation_type == ObservationType.ELA_NOT_APPLICABLE for e in evidence_list)
        if is_ela_not_applicable:
            missing.append("Pixel-level analysis (ELA not applicable to this file format)")
            what_cannot.append("Assess pixel-level consistency because the format is outside the supported JPEG domain.")
        else:
            missing.append("Pixel-level analysis result (ELA failed or was not run)")
            what_cannot.append("Assess pixel-level consistency of the image content.")

    insufficiency_reasons = []
    if not pixel_assessed and not is_prov_valid:
        insufficiency_reasons.append(
            "Pixel-level analysis produced no usable result (unknown, not clean) and no verified provenance is available."
        )
        if not meta_available:
            insufficiency_reasons.append("Metadata is also unavailable.")
    elif not meta_available and not has_pixel_anomaly and not is_prov_valid:
        # Pre-existing rule: no metadata, no provenance, no pixel anomaly -> abstain rather than claim "real".
        insufficiency_reasons.append("Image lacks metadata, provenance, and significant pixel anomalies.")
    elif has_pixel_anomaly and not meta_available and not is_prov_valid:
        insufficiency_reasons.append("ELA anomaly detected, but metadata and provenance are unavailable. Available evidence may warrant further investigation, but does not independently establish manipulation.")
    
    sufficiency = SufficiencyState.INSUFFICIENT if insufficiency_reasons else SufficiencyState.SUFFICIENT

    def _assessment(eligibility, decision, explanation, basis=()):
        return DecisionAssessment(
            eligibility=eligibility,
            final_decision=decision,
            what_can_be_established=what_can,
            what_cannot_be_established=what_cannot,
            missing_evidence=missing,
            explanation=explanation,
            sufficiency=sufficiency,
            relationship_basis=[r.id for r in basis],
        )

    # 2. Conflict check -- driven by explicit CONFLICTS relationships
    if conflicts:
        return _assessment(
            DecisionEligibilityState.CONFLICTING,
            FinalDecisionState.CONFLICTING_EVIDENCE,
            "Cryptographic provenance claims validity, but pixel analysis detects localized anomalies. "
            "Manual review is required to resolve this conflict. "
            f"Conflicting relationships: {', '.join(r.id for r in conflicts)}.",
            conflicts,
        )

    # 3. Sufficiency check -- abstain rather than guess
    if sufficiency == SufficiencyState.INSUFFICIENT:
        return _assessment(
            DecisionEligibilityState.ABSTAIN,
            FinalDecisionState.INSUFFICIENT_EVIDENCE,
            " ".join(insufficiency_reasons)
            + " There is insufficient evidence to make a definitive forensic claim. Abstaining.",
        )

    # 4. Conclusion
    if has_pixel_anomaly:
        what_can.append("Pixel-level anomalies detected consistent with localized editing.")
        
        has_software_corroboration = any(is_software_tag(e) for e in evidence_list) and consistent
        
        if has_software_corroboration:
            what_can.append(
                "Metadata Software tag indicates the file was processed by software, "
                "which is consistent with the pixel-level anomaly."
            )
            return _assessment(
                DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
                FinalDecisionState.SUPPORTED_MANIPULATION,
                "Evidence is sufficient and consistent. Pixel anomalies, corroborated by software traces, support a conclusion of digital manipulation.",
                consistent,
            )
        else:
            return _assessment(
                DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
                FinalDecisionState.LIKELY_MANIPULATED,
                "Pixel anomalies detected, but without corroborating metadata evidence, this cannot definitively prove manipulation. Likely manipulated.",
            )

    if pixel_assessed:
        what_can.append("No obvious pixel-level anomalies detected.")

    if has_meta_software:
        return _assessment(
            DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
            FinalDecisionState.LIKELY_MANIPULATED,
            "Software editing traces found in metadata, though no pixel anomalies were strongly detected. "
            "Image was likely modified.",
        )

    return _assessment(
        DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
        FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE,
        "Evidence is sufficient and consistent. No significant indicators of manipulation were found. "
        "NOTE: This does not guarantee contextual truth.",
    )
