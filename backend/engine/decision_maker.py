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

from backend.models.evidence import Evidence, EvidenceRelationship, EvidenceRelationshipType, EvidenceType
from backend.models.decision import (
    DecisionAssessment,
    DecisionEligibilityState,
    FinalDecisionState,
    SufficiencyState,
)
from backend.engine.evidence_predicates import (
    is_informative,
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
        
    quant_ev = next((e for e in evidence_list if is_jpeg_quantization_observed(e)), None)
    if quant_ev:
        tbl_count = quant_ev.raw_details.get("table_count") if quant_ev.raw_details else None
        if tbl_count:
            what_can.append(f"JPEG quantization tables observed ({tbl_count} tables extracted).")
        else:
            what_can.append("JPEG quantization tables observed.")

    # Dynamic pixel findings
    pixel_ela_ev = next((e for e in evidence_list if e.evidence_type == EvidenceType.PIXEL and is_informative(e) and "ELA" in (e.observation_type or "")), None)
    if pixel_ela_ev:
        max_diff = pixel_ela_ev.raw_details.get("max_diff") if pixel_ela_ev.raw_details else None
        mean_diff = pixel_ela_ev.raw_details.get("mean_diff") if pixel_ela_ev.raw_details else None
        if has_pixel_anomaly:
            detail_parts = []
            if max_diff is not None:
                detail_parts.append(f"max diff: {max_diff}")
            if mean_diff is not None:
                detail_parts.append(f"mean: {mean_diff}")
            det_str = f" ({', '.join(detail_parts)})" if detail_parts else ""
            what_can.append(f"Localized pixel-level anomalies detected{det_str} consistent with potential compression disruption.")
        elif pixel_ela_ev.observation_type == ObservationType.ELA_DIFFERENCE_BELOW_THRESHOLD:
            max_str = f" (max diff: {max_diff})" if max_diff is not None else ""
            what_can.append(f"Uniform error-level distribution across compression grid{max_str}. No obvious pixel-level anomalies detected.")
    elif pixel_assessed and not has_pixel_anomaly:
        what_can.append("No obvious pixel-level anomalies detected.")

    # Dynamic metadata findings
    soft_ev = next((e for e in evidence_list if is_software_tag(e)), None)
    if soft_ev:
        sw_name = soft_ev.raw_details.get("software") or soft_ev.observed_value if soft_ev.raw_details else None
        what_can.append(f"Software editing trace detected in metadata: {sw_name or 'identified software'}.")

    meta_camera_ev = next((e for e in evidence_list if e.observation_type == ObservationType.EXIF_PRESENT_NO_SOFTWARE_TAG), None)
    if meta_camera_ev:
        c_make = meta_camera_ev.raw_details.get("camera_make") if meta_camera_ev.raw_details else None
        c_model = meta_camera_ev.raw_details.get("camera_model") if meta_camera_ev.raw_details else None
        tag_count = meta_camera_ev.raw_details.get("exif_tag_count") if meta_camera_ev.raw_details else None
        if c_make or c_model:
            what_can.append(f"Original capture device metadata identified: {f'{c_make} ' if c_make else ''}{c_model or ''} ({tag_count or ''} EXIF tags preserved).")
        else:
            what_can.append(f"EXIF metadata container preserved ({tag_count or ''} tags), with no editing software headers.")

    if is_prov_valid:
        what_can.append("Cryptographic provenance verified (C2PA signature valid).")

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
        is_ela_not_applicable = any(e.observation_type == ObservationType.ELA_NOT_APPLICABLE for e in evidence_list)
        if is_ela_not_applicable and not meta_available:
            insufficiency_reasons.append(
                "The current pixel-level ELA method is not applicable to this image format, and no additional usable forensic evidence was available."
            )
        else:
            insufficiency_reasons.append(
                "Pixel-level analysis produced no usable result (format not applicable or analysis failed) and no verified provenance is available."
            )
            if not meta_available:
                insufficiency_reasons.append("Metadata is also unavailable.")
    
    sufficiency = SufficiencyState.INSUFFICIENT if insufficiency_reasons else SufficiencyState.SUFFICIENT

    def _assessment(eligibility, decision, explanation, basis=()):
        return DecisionAssessment(
            eligibility=eligibility,
            final_decision=decision,
            what_can_be_established=list(what_can),
            what_cannot_be_established=list(what_cannot),
            missing_evidence=list(missing),
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
        has_software_corroboration = any(is_software_tag(e) for e in evidence_list) and consistent
        
        if has_software_corroboration:
            what_can.append(
                "Metadata Software tag indicates the file was processed by software, "
                "which is consistent with the pixel-level anomaly."
            )
            return _assessment(
                DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
                FinalDecisionState.SUPPORTED_MANIPULATION,
                "Evidence is sufficient and consistent. Multiple consistent forensic signals support the manipulation assessment: pixel anomalies, corroborated by software traces, support a conclusion of digital manipulation.",
                consistent,
            )
        else:
            return _assessment(
                DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
                FinalDecisionState.LIKELY_MANIPULATED,
                "Localized pixel-level compression anomalies detected via error level analysis. "
                "While consistent with potential compression disruption or modification, an ELA anomaly alone does not definitively prove manipulation or malicious tampering without secondary corroboration.",
            )

    if has_meta_software:
        return _assessment(
            DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
            FinalDecisionState.LIKELY_MANIPULATED,
            "Software editing traces found in metadata, though no pixel anomalies were strongly detected. "
            "Software metadata indicates that software interacted with the file, but does not independently prove malicious manipulation.",
        )

    if has_meta_missing or not meta_available:
        return _assessment(
            DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
            FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE,
            "No significant manipulation indicators were detected by the applicable forensic analysis. "
            "Error level analysis across compression blocks indicates a uniform error-level distribution with no significant localized anomalies detected. "
            "However, metadata is unavailable and origin authenticity is not established. "
            "NOTE: Absence of detected anomalies does not guarantee contextual truth, nor does it prove origin authenticity.",
        )

    return _assessment(
        DecisionEligibilityState.CONCLUSION_MAY_BE_ISSUED,
        FinalDecisionState.NO_SIGNIFICANT_MANIPULATION_EVIDENCE,
        "No significant manipulation indicators were detected by the applicable forensic analysis. "
        "Error level analysis across compression blocks indicates a uniform error-level distribution with no significant localized anomalies detected. "
        "NOTE: Absence of detected anomalies does not guarantee contextual truth, nor does it prove origin authenticity.",
    )
