# Forensic Methodology

PIXORA uses established, verifiable forensic techniques:

## 1. Error Level Analysis (ELA)
- **Domain**: JPEG 8×8 discrete cosine transform (DCT) compression.
- **Principle**: When a JPEG image is modified and re-saved, the modified area has typically undergone a different number of compression cycles compared to the unmodified background.
- **Implementation**: The image is resaved at a calibrated baseline quality (90) and subtracted via pixel difference arithmetic (`ImageChops.difference`).
- **Reporting**: Reports measured maximum error-level difference, mean variance, and localized anomaly bounding box.

## 2. JPEG Quantization Table Analysis
- **Domain**: JPEG header DQT markers.
- **Principle**: Different cameras and software use proprietary luminance and chrominance quantization tables.
- **Implementation**: Reads quantization tables directly from the image header to establish compression lineage.

## 3. Metadata & Container Analysis
- **Domain**: EXIF, TIFF, XMP containers via `exifread`.
- **Principle**: Verifies container structure consistency against file extensions and inspects software/editor headers (e.g. `Image Software`).
- **Safety**: Absence of EXIF metadata is treated as contextual absence, never as proof of tampering.
