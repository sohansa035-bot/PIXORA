# Evidentiary Boundaries & Limitations

In compliance with forensic best practices, PIXORA explicitly documents the boundaries of its current implementations:

1. **JPEG Domain Boundary for ELA**
   - Error Level Analysis is strictly applicable to lossy JPEG files.
   - For lossless formats such as PNG, ELA is marked `NOT_APPLICABLE`. The system abstains rather than inventing false signals.

2. **Absence of Anomalies ≠ Proven Authenticity**
   - A clean ELA result with uniform error-level distribution allows issuing `NO_SIGNIFICANT_MANIPULATION_EVIDENCE`.
   - The system never claims an image is mathematically "authentic" or "genuine" without cryptographic origin proof.

3. **Software Metadata Context**
   - Software tags (e.g. Photoshop, Lightroom) indicate processing or re-saving, but do not independently prove malicious tampering.
   - Corroboration between software metadata and localized pixel anomalies is required to conclude `SUPPORTED_MANIPULATION`.

4. **Cryptographic Provenance (C2PA)**
   - C2PA manifest verification and root certificate authority validation are not yet implemented in this release.
   - Provenance evidence is explicitly marked `PROVENANCE_NOT_CHECKED` / `UNAVAILABLE`.
