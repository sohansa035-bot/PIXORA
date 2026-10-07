# PIXORA Forensic Pipeline

The PIXORA pipeline executes in a deterministic, evidence-aware sequence:

```text
IMAGE BYTES
    ↓
1. ANALYZERS           (RawObservation)        backend/forensics/*
    ↓
2. NORMALIZER          (Evidence)              backend/engine/normalizer.py
    ↓
3. RELATIONSHIPS       (EvidenceRelationship)  backend/engine/relationship_engine.py
    ↓
4. DECISION INTEGRITY  (DecisionAssessment)    backend/engine/decision_maker.py
    ↓
5. INVESTIGATION DOCKET                        backend/models/investigation.py
```

## Stage Guarantees

1. **Analyzers**: Never emit inferences, reliability values, or verdicts. They only report measured facts (e.g., JPEG ELA maximum difference, EXIF tag presence).
2. **Normalizer**: Translates raw observations into standardized `Evidence` structures with explicit reliability, applicability, and validity bounds.
3. **Relationship Engine**: Establishes explicit links (`CONSISTENT_WITH`, `CONFLICTS`, `SUPPORTS`) based strictly on observed factual pairings (e.g. software tag + pixel anomaly).
4. **Decision Integrity Engine**: Evaluates evidence sufficiency and consistency. If evidence is insufficient, it safely abstains (`INSUFFICIENT_EVIDENCE`).
5. **Investigation Object**: A complete, serializable docket containing the full evidentiary trail, limitations, and forensic boundaries.
