# 🔎 PIXORA

### Evidence-Aware Digital Image Forensic Investigation

> **Don't just detect. Determine whether the evidence is sufficient to conclude.**

[![Status](https://img.shields.io/badge/Status-Research%20%2B%20Development-0f172a?style=for-the-badge)](#)
[![Domain](https://img.shields.io/badge/Domain-Digital%20Forensics-1e3a8a?style=for-the-badge)](#)
[![Tests](https://img.shields.io/badge/Tests-84%2F84%20Passing-10b981?style=for-the-badge)](#)

---

## 1. Project Overview

**PIXORA** is an evidence-aware digital image forensic investigation system. Most contemporary forensic and deepfake detection tools attempt binary classification (`Real` vs `Fake`) outputting opaque confidence scores without evaluating whether the available signals justify that claim.

PIXORA reframes digital image forensics around **evidentiary justification**:
1. It gathers factual forensic observations across available analytical domains.
2. It normalizes observations into structured evidence with explicit applicability and reliability bounds.
3. It constructs an explicit evidence relationship graph.
4. It evaluates **evidence sufficiency** and **decision eligibility** before issuing a conclusion.
5. If the available evidence is incomplete, inapplicable, or uncorroborated, PIXORA **safely abstains** rather than issuing an unsubstantiated verdict.

---

## 2. Problem Statement

Automated forensic detectors frequently suffer from core methodological failure modes:

- **Epistemic Overreach**: Forcing every image into binary classification regardless of evidentiary certainty.
- **Absence Conflation**: Treating the absence of metadata (e.g. stripped EXIF from messaging apps) as proof of malicious manipulation.
- **Domain Mismatch**: Applying compression-sensitive tools (like Error Level Analysis) to unsupported formats (like lossless PNG) and reporting artifacts as tampering.
- **Uncorroborated Accusations**: Treating a single localized anomaly (such as edge contrast noise) as conclusive proof of forgery without secondary corroboration.
- **Opaque Confidence Metrics**: Generating arbitrary percentages (e.g. "87% Fake") without mathematically validated probabilistic calibration.

---

## 3. PIXORA Approach

PIXORA enforces formal boundaries between forensic stages:

```text
IMAGE INPUT
    ↓
1. ANALYZERS           (RawObservation: pure factual measurements)
    ↓
2. NORMALIZER          (Evidence: standardized reliability & bounds)
    ↓
3. RELATIONSHIP GRAPH  (EvidenceRelationship: explicit pairwise links)
    ↓
4. SUFFICIENCY GATE    (SufficiencyState: evaluates evidence completeness)
    ↓
5. DECISION ENGINE     (DecisionAssessment: bounded forensic claim)
    ↓
INVESTIGATION DOCKET   (Structured, traceable, explainable report)
```

- **Separation of Measurement and Meaning**: Forensic analyzers report only measurable facts (e.g., maximum compression error difference). They never emit verdicts.
- **Explicit Relationship Mapping**: Inferences require explicit relationships (`CONSISTENT_WITH`, `CONFLICTS`, `SUPPORTS`) between distinct evidentiary findings.
- **Safe Abstention as a First-Class State**: If evidence is insufficient, PIXORA explicitly concludes `INSUFFICIENT_EVIDENCE` and halts further speculation.

---

## 4. Current Architecture

PIXORA is built as a modular client-server forensic workstation:

- **Backend Core (FastAPI / Python 3.11)**:
  - High-performance asynchronous API service.
  - Analyzer pipeline for Error Level Analysis (ELA), JPEG quantization tables, and EXIF container forensics.
  - Deterministic normalizer, graph-based relationship engine, and rule-bounded decision maker.
- **Frontend Workstation (Next.js 16 / React 19 / TypeScript)**:
  - Interactive investigative console for forensic image inspection.
  - Dynamic compression variance overlays, metadata inspectors, and evidence relationship cards.
  - Strict contract enforcement: zero mock data fallback, zero silent client-side simulation.

---

## 5. Repository Structure

The repository is organized as a clean, production-ready monorepo:

```text
PIXORA/
├── frontend/                         # Next.js 16 Forensic Workstation
│   ├── app/                          # App router (workstation page, styles, layout)
│   ├── components/                   # UI components (pixora, analysis, assessment)
│   ├── lib/                          # API clients & type-safe forensic adapters
│   ├── public/                       # Static assets & test images
│   ├── types/                        # Forensic domain TypeScript interfaces
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── tsconfig.json
│   └── eslint.config.mjs
│
├── backend/                          # FastAPI Forensic Engine & Decision Core
│   ├── api/
│   │   └── ingest.py                 # Endpoint: POST /api/investigate
│   ├── engine/
│   │   ├── decision_maker.py         # Forensic integrity & sufficiency engine
│   │   ├── evidence_predicates.py    # Fact-checking predicates
│   │   ├── normalizer.py             # RawObservation -> Evidence normalizer
│   │   ├── pipeline.py               # Deterministic pipeline coordinator
│   │   └── relationship_engine.py    # Explicit relationship graph builder
│   ├── forensics/
│   │   ├── metadata_analyzer.py      # EXIF & structure analysis
│   │   ├── pixel_analyzer.py         # JPEG Error Level Analysis & DQT tables
│   │   └── provenance_analyzer.py    # Provenance tracking boundary
│   ├── models/
│   │   ├── decision.py               # DecisionAssessment & state enums
│   │   ├── evidence.py               # Evidence & EvidenceRelationship schemas
│   │   ├── investigation.py          # Investigation docket schema
│   │   └── observation.py            # RawObservation schema
│   ├── tests/                        # 84 automated backend tests
│   │   ├── fixtures.py               # Synthetic test image vectors
│   │   ├── test_decision_engine.py
│   │   ├── test_ela_applicability.py
│   │   ├── test_forensic_safety.py
│   │   ├── test_investigate_api.py
│   │   ├── test_pipeline.py
│   │   └── ...
│   ├── requirements.txt              # Backend dependencies
│   └── main.py                       # FastAPI entrypoint & Root Console
│
├── docs/                             # Technical documentation & assets
│   ├── architecture/
│   │   ├── system-architecture.md
│   │   └── forensic-pipeline.md
│   ├── forensic/
│   │   ├── methodology.md
│   │   ├── evidence-model.md
│   │   └── limitations.md
│   ├── screenshots/                  # Workstation & assessment screenshots
│   └── submission/
│
├── scripts/                          # Reusable development & validation scripts
│   ├── validation/
│   │   ├── validate_images.py        # 5-image test against /api/investigate
│   │   └── validate_api.py           # HTTP status & docket inspection
│   └── development/
│       ├── test_browser_flow.py      # Playwright end-to-end automation
│       └── capture_localhost.py      # Automated screenshot generator
│
├── .gitignore                        # Monorepo ignore configuration
├── AGENTS.md                         # Next.js agent operational rules
├── README.md                         # Project documentation
├── LICENSE                           # MIT License
└── pytest.ini                        # Pytest monorepo test configuration
```

---

## 6. Implemented Forensic Methods

The following forensic methods and evaluation stages are active and fully operational in the current release:

### 1. Error Level Analysis (ELA)
- **Module**: `backend/forensics/pixel_analyzer.py`
- **Domain**: Lossy JPEG 8×8 DCT compression.
- **Methodology**: Resaves the raster at a calibrated baseline quality factor (90) and measures pixel error disparities (`ImageChops.difference`).
- **Measurements**: Measures maximum error difference, mean difference, variance, and localized anomaly bounding box.
- **Safety Boundary**: Non-JPEG formats (e.g., PNG) are strictly flagged as `ELA_NOT_APPLICABLE` (`ObservationStatus.ABSENT`). ELA is not executed on unsupported compression domains.

### 2. JPEG Compression & Quantization Matrix Analysis
- **Module**: `backend/forensics/pixel_analyzer.py`
- **Methodology**: Extracts luminance and chrominance quantization matrices from JPEG DQT markers.
- **Inference**: Confirms whether the file has undergone lossy JPEG compression and exposes quantization table counts.

### 3. EXIF & Metadata Forensics (Software/Editor Indicators)
- **Module**: `backend/forensics/metadata_analyzer.py`
- **Methodology**: Decodes EXIF structures via `exifread` and cross-references raster headers against file extensions.
- **Observations**:
  - `METADATA_STRUCTURAL_CONSISTENCY`: Format matches extension.
  - `METADATA_STRUCTURAL_INCONSISTENCY`: Extension mismatch indicating renaming or masking.
  - `EXIF_PRESENT_NO_SOFTWARE_TAG`: Hardware camera capture device preserved (e.g., Canon EOS 5D Mark IV).
  - `EXIF_SOFTWARE_TAG_PRESENT`: Software signature identified (e.g., Adobe Photoshop, GIMP).
  - `EXIF_ABSENT`: No EXIF header found. Treated as missing metadata, **not** as evidence of tampering.

### 4. SHA-256 Identification & Raster Input Validation
- **Module**: `backend/api/ingest.py`
- **Methodology**: Computes SHA-256 digests on ingest for immutable chain-of-custody tracking. Validates raster integrity, dimensions, and byte bounds using Pillow before pipeline execution. Rejects empty or corrupt files with HTTP 400.

### 5. Evidence Normalization
- **Module**: `backend/engine/normalizer.py`
- **Methodology**: Maps raw analyzer measurements (`RawObservation`) into standardized `Evidence` models with explicit confidence ratings, applicability bounds, and reliability tiers (`VERIFIED`, `SUPPORTED`, `UNVERIFIED`).

### 6. Evidence Relationship Graph
- **Module**: `backend/engine/relationship_engine.py`
- **Methodology**: Constructs directional pairwise links (`SUPPORTS`, `CONFLICTS`, `CONSISTENT_WITH`, `DOES_NOT_ESTABLISH`) between distinct evidentiary findings to identify corroboration or contradiction.

### 7. Evidence Sufficiency & Decision Eligibility
- **Module**: `backend/engine/decision_maker.py`
- **Methodology**: Evaluates whether available observations meet formal sufficiency requirements. Checks whether analytical coverage is complete or blocked by domain mismatches.

### 8. Explainable Forensic Assessment & Safe Abstention
- **Module**: `backend/engine/decision_maker.py`
- **Methodology**: Generates human-readable, auditable conclusions detailing observations, inferences, supporting signals, conflicting signals, and explicit epistemic boundaries. Safely abstains (`INSUFFICIENT_EVIDENCE`) when evidence cannot support a definitive finding.

---

## 7. Evidence-to-Decision Pipeline

The decision engine (`backend/engine/decision_maker.py`) applies a strict hierarchy of evidentiary gates:

1. **Completeness & Boundaries**: Identifies missing evidence (e.g., missing EXIF, unverified provenance) and establishes what *cannot* be proven.
2. **Conflict Gate**: Evaluates explicit `CONFLICTS` relationships from the graph. If verified provenance and pixel anomalies materially contradict each other, it returns `CONFLICTING_EVIDENCE` for manual examiner review.
3. **Sufficiency Gate**: Checks whether valid analytical methods executed. If all applicable methods failed or are inapplicable, it safely abstains (`INSUFFICIENT_EVIDENCE`).
4. **Corroboration Engine**:
   - Localized ELA anomaly + Software metadata tag -> `SUPPORTED_MANIPULATION`.
   - Localized ELA anomaly alone without corroboration -> `LIKELY_MANIPULATED` (with explicit caveat that compression variance alone does not prove malicious intent).
   - Software metadata tag alone without pixel anomaly -> `LIKELY_MANIPULATED` (does not upgrade to `SUPPORTED_MANIPULATION`).
   - Clean uniform ELA across compression grid -> `NO_SIGNIFICANT_MANIPULATION_EVIDENCE` (explicitly noting that absence of detected anomalies is not proof of authenticity).

---

## 8. Detection Outcome Matrix

| Scenario | Input Format | Forensic Evidence State | Final Decision | Sufficiency | Eligibility | Core Explanation Summary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01 — Camera JPEG** | JPEG | Clean ELA + Camera EXIF | `NO_SIGNIFICANT_MANIPULATION_EVIDENCE` | `SUFFICIENT` | `CONCLUSION_MAY_BE_ISSUED` | Uniform compression error levels; does not prove origin authenticity. |
| **02 — Metadata-Stripped JPEG** | JPEG | Clean ELA + No EXIF | `NO_SIGNIFICANT_MANIPULATION_EVIDENCE` | `SUFFICIENT` | `CONCLUSION_MAY_BE_ISSUED` | Clean ELA; metadata absence noted; does not block conclusion. |
| **03 — Re-Encoded / Flat JPEG** | JPEG | Clean ELA | `NO_SIGNIFICANT_MANIPULATION_EVIDENCE` | `SUFFICIENT` | `CONCLUSION_MAY_BE_ISSUED` | No anomalous compression variance detected. |
| **04 — Localized Pixel Alteration** | JPEG | ELA Anomaly + No EXIF | `LIKELY_MANIPULATED` | `SUFFICIENT` | `CONCLUSION_MAY_BE_ISSUED` | Compression disparity detected; note: alone does not prove malicious tampering. |
| **05 — Edited + Software Trace** | JPEG | ELA Anomaly + Software Tag | `SUPPORTED_MANIPULATION` | `SUFFICIENT` | `CONCLUSION_MAY_BE_ISSUED` | Consistent signals: pixel anomaly corroborated by software traces. |
| **06 — Software Trace Alone** | JPEG | Clean ELA + Software Tag | `LIKELY_MANIPULATED` | `SUFFICIENT` | `CONCLUSION_MAY_BE_ISSUED` | Software traces found; not upgraded to SUPPORTED without pixel corroboration. |
| **07 — Lossless Image (PNG)** | PNG | ELA Inapplicable + No EXIF | `INSUFFICIENT_EVIDENCE` | `INSUFFICIENT` | `ABSTAIN` | ELA method inapplicable to format; no other evidence available. |
| **08 — Analyzer Crash** | Any | Analyzer Exception | `ANALYSIS_FAILED` | `INSUFFICIENT` | `ABSTAIN` | Technical execution failure; separated from forensic uncertainty. |
| **09 — Corrupt / Empty File** | Any | Failed Validation / 0 Bytes | `HTTP 400 Bad Request` | N/A | N/A | Technical rejection before forensic ingestion. |

---

## 9. Installation

### Prerequisites
- **Python**: Version 3.11 or higher
- **Node.js**: Version 18.18 or higher (Node 20+ recommended)
- **Package Manager**: `npm`

### Clone Repository
```bash
git clone https://github.com/ys8619984-code/PIXORA.git
cd PIXORA
```

---

## 10. Backend Development

```bash
# 1. Create and activate a Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI development server
python -m uvicorn backend.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Root Status Console: `http://localhost:8000/`

---

## 11. Frontend Development

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Start Next.js development server
npm run dev -- -p 3000

# 4. Build for production validation
npm run build
```

- Workstation UI: `http://localhost:3000`

---

## 12. API Endpoints

| Method | Endpoint | Description | Payload / Parameters | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Forensic Status Console | None | HTML status dashboard or formatted JSON |
| `GET` | `/api/health` | Health Check | None | `{"status": "ok", "message": "IMAGE-TRACE core is running."}` |
| `POST` | `/api/investigate` | Ingestion & Investigation | `file`: Multipart upload | Full `Investigation` JSON docket |
| `GET` | `/docs` | OpenAPI Documentation | None | Interactive Swagger UI |

---

## 13. Environment Configuration

### Frontend (`frontend/.env.local` or environment variables)
```bash
# Production backend API URL (Must NOT fall back to localhost in production)
NEXT_PUBLIC_API_URL=https://pixora-325f.onrender.com
```

### Backend
Backend runs with zero mandatory external environment variables for local development. Set `PORT` in cloud environments (Render automatically injects `$PORT`).

---

## 14. Testing

### Run All Backend Tests (84 tests)
Executed from repository root:
```bash
python -m pytest -q backend/tests
```

### Run Multi-Image Live API Validation
Validates live `/api/investigate` against 5 genuinely distinct images:
```bash
python scripts/validation/validate_images.py
```

### Run End-to-End Browser Flow (Playwright)
Executes automated ingestion, scanning, modal navigation, and docket verification:
```bash
python scripts/development/test_browser_flow.py
```

---

## 15. Production Deployment

### Backend (Render)
- **Environment**: Python
- **Root Directory**: `.` (Repository root)
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Environment Variable**: `NEXT_PUBLIC_API_URL` set to the deployed Render backend URL.

---

## 16. Current Limitations

1. **Format Scope of ELA**: Error Level Analysis is mathematically bounded to lossy JPEG files. Lossless formats (PNG) cannot be evaluated using ELA and will abstain unless secondary metadata/provenance is present.
2. **Absence of Evidence is Not Evidence of Absence**: Clean ELA across an image does not prove it is an authentic capture. It only proves that no localized compression disparities were detected.
3. **Classical ELA Limitations**: ELA is subject to false positives on sharp high-contrast edges and false negatives on uniformly re-compressed multi-generation saves.
4. **Unimplemented Provenance**: Cryptographic provenance (C2PA) verification is not yet implemented. Provenance state is currently unverified.

---

## 17. Future Work

The following advanced capabilities are designated for future releases:

- **Deep Learning Spatial Analyzers**: Integration of trained feature-inconsistency architectures (e.g. TruFor, MVSS-Net).
- **C2PA Manifest Verification**: Cryptographic parsing of C2PA JUMBF boxes, signature validation, and certificate chain validation.
- **Copy-Move & Inpainting Detection**: Keypoint matching (SIFT/ORB) and dense patch similarity analysis for duplicate region localization.
- **Synthetic Media Detection**: Frequency-domain Fourier analysis and generative artifact detectors.

---

## 18. Responsible Forensic Use

- **Human-in-the-Loop**: PIXORA is an investigative aid designed to assist qualified forensic examiners, journalists, and researchers. It does not replace expert human judgment.
- **No Magic Numbers**: The system intentionally avoids emitting uncalibrated percentage scores (e.g. "94% Authentic") to prevent misleading court or newsroom decisions.
- **Epistemic Humility**: A finding of `NO_SIGNIFICANT_MANIPULATION_EVIDENCE` must never be cited as mathematical proof of real-world authenticity.

---

## 19. Project Status

- **Status**: Research & Development Prototype (v1.0.0)
- **Test Coverage**: 84 passing automated unit and integration tests.
- **License**: MIT License (see [`LICENSE`](LICENSE)).
