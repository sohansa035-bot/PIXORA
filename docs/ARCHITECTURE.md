# IMAGE-TRACE Architecture

## Concept
The central concept is **Evidence-to-Decision Integrity**. The system does not merely classify images as Real or Fake. It collects evidence, maps it into a normalized format, and explicitly decides if the evidence is sufficient to make a conclusion. If not, it safely abstains.

## Components
- **Ingestion**: Uploads and hashing.
- **Forensic Analyzers**: Pixel and Metadata (more can be added).
- **Engine**: Normalization, Relationship mapping, Sufficiency checking, and Decision.
