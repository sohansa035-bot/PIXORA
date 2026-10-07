"""
Raw observation layer.

A RawObservation records ONLY what a forensic analyzer actually measured or
failed to measure. It deliberately has NO fields for inference, reliability,
applicability, or conclusions. Those are assigned later by the evidence
normalizer (backend/engine/normalizer.py), so that evidence interpretation is
never silently coupled to an individual analyzer.

Example
    observation: "High localized error-level differences detected (max diff: 87)."
    (no inference here -- "may be consistent with local editing" is attached by
    the normalizer, and no conclusion is ever attached at this layer.)
"""
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from .evidence import EvidenceType


class ObservationType(str, Enum):
    """Closed vocabulary of things the current analyzers can observe.

    Adding a member here requires adding a matching rule in the normalizer
    (enforced by tests/test_normalizer.py).
    """
    # Metadata analyzer (exifread)
    EXIF_ABSENT = "EXIF_ABSENT"
    EXIF_SOFTWARE_TAG_PRESENT = "EXIF_SOFTWARE_TAG_PRESENT"
    EXIF_PRESENT_NO_SOFTWARE_TAG = "EXIF_PRESENT_NO_SOFTWARE_TAG"
    METADATA_STRUCTURAL_INCONSISTENCY = "METADATA_STRUCTURAL_INCONSISTENCY"
    METADATA_STRUCTURAL_CONSISTENCY = "METADATA_STRUCTURAL_CONSISTENCY"
    # Pixel analyzer (ELA)
    ELA_DIFFERENCE_ABOVE_THRESHOLD = "ELA_DIFFERENCE_ABOVE_THRESHOLD"
    ELA_DIFFERENCE_BELOW_THRESHOLD = "ELA_DIFFERENCE_BELOW_THRESHOLD"
    JPEG_QUANTIZATION_OBSERVED = "JPEG_QUANTIZATION_OBSERVED"
    JPEG_QUANTIZATION_NOT_APPLICABLE = "JPEG_QUANTIZATION_NOT_APPLICABLE"
    # Provenance (C2PA is NOT implemented; this records that no check was performed)
    PROVENANCE_NOT_CHECKED = "PROVENANCE_NOT_CHECKED"
    # Any analyzer
    ANALYSIS_FAILED = "ANALYSIS_FAILED"


class ObservationStatus(str, Enum):
    """What happened when the analyzer ran -- not what it means."""
    OBSERVED = "OBSERVED"            # Analyzer ran and measured something.
    ABSENT = "ABSENT"                # Analyzer ran; the data it looks for does not exist in the file.
    FAILED = "FAILED"                # Analyzer raised an error; result is unknown.
    NOT_PERFORMED = "NOT_PERFORMED"  # Capability is not implemented / check was not run.


class RawObservation(BaseModel):
    id: str = Field(default="")
    source: str
    evidence_type: EvidenceType
    observation_type: ObservationType
    status: ObservationStatus
    observation: str
    observed_value: Optional[Any] = None
    raw_details: Dict[str, Any] = Field(default_factory=dict)
    limitations: List[str] = Field(default_factory=list)
