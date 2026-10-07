"""
Evidence relationship engine.

Boundary:  List[Evidence]  ->  List[EvidenceRelationship]

Produces explicit, inspectable relationship objects between pieces of
normalized evidence. A relationship is created ONLY when two actual,
informative evidence states justify it under the project's existing decision
rules. Rules implemented:

  R1  CONFLICTS
      pixel anomaly (ELA above threshold)  <->  VERIFIED provenance
      Mirrors the existing conflict rule: provenance asserting integrity and
      pixel analysis reporting anomalies materially disagree.

  R2  CONSISTENT_WITH
      EXIF Software tag  ->  pixel anomaly
      Mirrors the existing rule that adds the software tag to what can be
      established when a pixel anomaly is present. CONSISTENT_WITH (not
      SUPPORTS) is used deliberately: a software tag shows the file was
      processed/saved by software; it does not independently corroborate a
      localized edit.

  R3  CONSISTENT_WITH
      EXIF Software tag  ->  JPEG Quantization tables
      Corroborates that software encoding parameters match extracted quantization.
"""
from typing import List

from backend.models.evidence import Evidence, EvidenceRelationship, EvidenceRelationshipType
from backend.engine.evidence_predicates import (
    is_informative,
    is_pixel_anomaly,
    is_provenance_verified,
    is_software_tag,
    is_jpeg_quantization_observed,
)


def build_relationships(evidence: List[Evidence]) -> List[EvidenceRelationship]:
    informative = [e for e in evidence if is_informative(e)]
    anomalies = [e for e in informative if is_pixel_anomaly(e)]
    verified_provenance = [e for e in informative if is_provenance_verified(e)]
    software_tags = [e for e in informative if is_software_tag(e)]
    quant_tables = [e for e in informative if is_jpeg_quantization_observed(e)]

    pending = []  # (source, target, type, description)
    for anomaly in anomalies:
        for prov in verified_provenance:
            pending.append((
                anomaly.id, prov.id, EvidenceRelationshipType.CONFLICTS,
                "Pixel analysis reports error-level differences above threshold (possible localized "
                "modification), while verified provenance indicates the content is intact. These two "
                "evidence states materially disagree and cannot both be taken at face value.",
            ))
        for tag in software_tags:
            pending.append((
                tag.id, anomaly.id, EvidenceRelationshipType.CONSISTENT_WITH,
                "The EXIF Software tag shows the file was processed or saved by software, which is "
                "compatible with the pixel-level error-level anomaly. Neither item alone establishes "
                "manipulation, and the pairing does not establish intent or deception.",
            ))
            for q in quant_tables:
                pending.append((
                    tag.id, q.id, EvidenceRelationshipType.CONSISTENT_WITH,
                    "The EXIF Software tag is consistent with the presence of JPEG quantization parameters.",
                ))

    return [
        EvidenceRelationship(
            id=f"rel_{i:03d}",
            source_evidence_id=src,
            target_evidence_id=tgt,
            relationship_type=rtype,
            description=desc,
        )
        for i, (src, tgt, rtype, desc) in enumerate(pending, start=1)
    ]


def attach_relationship_refs(
    evidence: List[Evidence], relationships: List[EvidenceRelationship]
) -> List[Evidence]:
    """Return copies of the evidence with `Evidence.relationships` populated with
    the IDs of every relationship the item participates in (as source or target)."""
    refs = {e.id: [] for e in evidence}
    for rel in relationships:
        for eid in (rel.source_evidence_id, rel.target_evidence_id):
            if eid in refs and rel.id not in refs[eid]:
                refs[eid].append(rel.id)
    return [e.model_copy(update={"relationships": refs[e.id]}) for e in evidence]
