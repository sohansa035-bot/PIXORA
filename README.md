# 🔎 PIXORA

### Evidence-Aware Digital Image Forensic Investigation

> **Don't just detect. Determine whether the evidence is sufficient to conclude.**

[![Status](https://img.shields.io/badge/Status-Research%20%2B%20Development-0f172a?style=for-the-badge)](#)
[![Domain](https://img.shields.io/badge/Domain-Digital%20Forensics-1e3a8a?style=for-the-badge)](#)
[![AI/ML](https://img.shields.io/badge/AI%2FML-Forensic%20Analysis-312e81?style=for-the-badge)](#)

---

## 🧠 What is PIXORA?

**PIXORA** is an evidence-aware digital image forensic investigation system that combines established forensic evidence sources and evaluates whether the available evidence is **sufficient, consistent, applicable, complete, and reliable** enough to support a forensic conclusion.

Instead of:

```text
Image → AI Model → REAL / EDITED
```

PIXORA follows:

```text
Image + Question
      ↓
Forensic Ingestion
      ↓
Pixel + Metadata + Provenance
      ↓
Optional Evidence Sources
      ↓
Evidence Normalization
      ↓
Evidence-to-Decision Engine
      ↓
Sufficiency + Decision Eligibility
      ↓
Forensic Assessment
      ↓
Explainable Report
```

---

## 🏛️ Monorepo Architecture

PIXORA is organized as a monorepo containing:
- **`backend/`**: Python FastAPI forensic engine powered by Pillow, ExifRead, and custom analytical pipelines (pixel ELA variance, quantization matrix analysis, metadata heuristics, provenance audit, and a formal decision engine).
- **`frontend/`**: Next.js 16 (React 19, TypeScript, Tailwind CSS) forensic workstation UI with real-time analysis streaming, evidence relationship graphs, and traceable forensic boundaries.
- **`tests/`**: Automated test suite (77/77 tests passing) enforcing decision rules, abstention thresholds, and API contract integrity.
- **`docs/`**: Architecture diagrams, forensic boundaries, and verification reports.

```
PIXORA/
├── backend/                  # FastAPI Application & Decision Engine
│   ├── api/                  # Ingestion endpoints (POST /api/investigate)
│   ├── engine/               # Normalization, relationship, and decision logic
│   ├── forensics/            # Pixel ELA, EXIF metadata, and provenance analyzers
│   ├── models/               # Pydantic schemas (Investigation, Evidence, etc.)
│   ├── requirements.txt      # Python dependencies
│   └── main.py               # Application entrypoint
├── frontend/                 # Next.js 16 Forensic Workstation
│   ├── app/                  # App router (workstation page, styles, layout)
│   ├── components/pixora/    # Forensic image viewer, evidence panel, assessment
│   ├── lib/api/              # Live FastAPI client & forensic adapters
│   ├── types/                # Forensic domain TypeScript interfaces
│   └── public/               # Static assets & test vectors
├── tests/                    # Backend unit & integration test suite
└── docs/                     # Architectural & specification documents
```

---

## 🚀 Getting Started

### 1. Backend Setup & Run (FastAPI)

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server (runs on http://localhost:8000)
uvicorn backend.main:app --reload --port 8000

# 5. Run test suite
pytest
```

The backend API will be live at `http://localhost:8000`.  
Interactive Swagger docs: `http://localhost:8000/docs`.

### 2. Frontend Setup & Run (Next.js)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server (runs on http://localhost:3000)
npm run dev

# 4. Build for production
npm run build
npm run start
```

The frontend workstation connects directly to `http://localhost:8000/api/investigate` via `NEXT_PUBLIC_API_URL`.

---

## 🎯 The Problem

An image may be legitimately edited, maliciously manipulated, partially manipulated, AI-generated/edited, repeatedly processed, stripped of metadata, accompanied by misleading context, supported by conflicting evidence, or impossible to determine conclusively.

Therefore PIXORA asks:

> **What can actually be established about this image from the evidence available?**

---

## 💡 Core USP — Evidence-to-Decision Intelligence

PIXORA does not blindly combine detector scores.

```text
Evidence
  ↓
Quality
  ↓
Applicability
  ↓
Relationships
  ↓
Conflicts
  ↓
Completeness
  ↓
Uncertainty
  ↓
Sufficiency
  ↓
Decision Eligibility
  ↓
Forensic Assessment
```

**The goal is not merely to detect manipulation, but to determine what the evidence collectively justifies.**

---

## 🏗️ Investigative Data Flow

```text
                    IMAGE + QUESTION
                          ↓
                  FORENSIC INGESTION
                          ↓
       ┌──────────────────┼──────────────────┐
       ↓                  ↓                  ↓
  PIXEL FORENSICS   METADATA FORENSICS   PROVENANCE
       └──────────────────┼──────────────────┘
                          ↓
                 EVIDENCE NORMALIZATION
                          ↓
            ╔════════════════════════════╗
            ║ EVIDENCE-TO-DECISION       ║
            ║ INTELLIGENCE               ║
            ║                            ║
            ║ Quality • Applicability    ║
            ║ Relationships • Conflicts  ║
            ║ Completeness • Uncertainty ║
            ║ Sufficiency • Eligibility  ║
            ╚═══════════════╤════════════╝
                          ↓
                 FORENSIC ASSESSMENT
                          ↓
                  EXPLAINABLE REPORT
                          ↓
                  HUMAN INVESTIGATOR
```

---

## 🔬 Forensic Evidence Sources

### 🧬 Pixel Forensics

* Manipulation detection & localization
* Splicing / copy-move detection
* Object removal / inpainting
* Noise inconsistencies
* Compression inconsistencies
* Resampling artifacts
* Potential integrations: **TruFor, MVSS-Net**, classical techniques, and other validated/open implementations.

### 🗂️ Metadata & File Forensics

Analyzes **EXIF, JPEG structure, software identifiers, timestamps, camera information, file structure, thumbnails, color profiles, and compression**.

> **Metadata is evidence, not truth.**

Photoshop metadata indicates associated processing evidence; it does not automatically prove malicious manipulation.

### 🔐 Provenance

Leverages established infrastructure such as **C2PA / Content Credentials**:

* Signed manifests
* Credential chains
* Creation/editing assertions
* AI-related assertions

```text
PROVENANCE VALIDITY ≠ REAL-WORLD EVENT TRUTH
```

### 🧩 Optional Evidence

* Synthetic-media analysis
* Manipulation-history reconstruction
* Context / claim analysis
* External references

---

## 📦 Evidence Normalization

All forensic sources produce a common evidence representation:

```json
{
  "source": "pixel_forensics",
  "observation": "localized_anomaly",
  "region": [420,180,210,190],
  "confidence": 0.84,
  "status": "OBSERVED",
  "limitations": ["compression_sensitive"]
}
```

This allows heterogeneous forensic systems to communicate through one evidence model.

---

## 🧠 Evidence Intelligence

### Quality

`VERIFIED` • `SUPPORTED` • `WEAK` • `UNVERIFIED` • `UNKNOWN`

### Applicability

Determines whether evidence actually answers the investigative question.

### Relationships

`SUPPORTS` • `CONFLICTS` • `CONSISTENT WITH` • `DOES NOT ESTABLISH` • `MISSING` • `UNKNOWN`

### Completeness

Identifies missing evidence such as:

```text
Original Image → MISSING
Provenance     → MISSING
Metadata       → PARTIAL
Independent Source → MISSING
```

---

## ⚖️ Evidence Sufficiency Engine

PIXORA asks:

> **Do we have enough evidence to make the requested decision?**

```text
Availability + Quality + Applicability
+ Consistency + Completeness + Uncertainty
                    ↓
            Evidence Sufficiency
```

Possible states:

`SUFFICIENT` • `PARTIALLY SUFFICIENT` • `INSUFFICIENT` • `CONFLICTING` • `UNKNOWN`

---

## 🚦 Decision Eligibility Gate

Before producing a strong conclusion, PIXORA checks whether the evidence justifies it.

```text
Pixel Detector     → SUSPICIOUS
Metadata           → MISSING
Provenance         → MISSING
Original Image     → MISSING
Detector Agreement → LOW
```

Instead of:

```text
FAKE — 87%
```

PIXORA can produce:

```text
DECISION ELIGIBILITY → FAILED
Reason: Evidence insufficient and conflicting.

→ INCONCLUSIVE
```

> **Abstention is a valid forensic outcome.**

---

## 📋 Explainable Assessment

PIXORA communicates:

```text
WHAT WAS OBSERVED
        ↓
WHAT IT MEANS
        ↓
WHAT SUPPORTS IT
        ↓
WHAT CONFLICTS
        ↓
WHAT IS MISSING
        ↓
WHAT CAN / CANNOT BE ESTABLISHED
        ↓
RECOMMENDED ACTION
```

Possible outcomes:

`No Significant Manipulation Evidence` • `Supported Manipulation` • `Likely Manipulated` • `Conflicting Evidence` • `Insufficient Evidence` • `Unknown` • `Inconclusive` • `Manual Review Required`

---

## 🛡️ Core Forensic Principles

1. **Evidence-Aware Non-Binary Decisions**:
   - `SUPPORTED_MANIPULATION`: Multiple independent, corroborating evidence signals with zero unresolvable conflicts.
   - `INSUFFICIENT_EVIDENCE`: Isolated anomalies lacking corroboration (e.g. uncorroborated ELA variance or stripped EXIF).
   - `CONFLICTING_EVIDENCE`: Contradictory evidence signals requiring manual forensic review.
   - `ABSTAIN`: Analysis blocked due to format limitations (e.g. ELA on lossless PNG) or insufficient data.
2. **Epistemological Traceability**:
   - `OBSERVATION`: Raw measurable data (e.g. `ELA_MAX_DIFF = 62.4`, `SOFTWARE_TAG = Adobe Photoshop`).
   - `INFERENCE`: Contextual interpretation (e.g. compression artifact vs editing artifact).
   - `CONCLUSION`: Corroborated verdict strictly bounded by what can and cannot be proven.
3. **Zero Silent Simulation**:
   - If the forensic backend is offline or an ingestion error occurs, the workstation halts and explicitly displays `FORENSIC BACKEND UNAVAILABLE` rather than fabricating simulated evidence.
4. **Honest Spatial Evidence**:
   - Global frame metrics are clearly labeled as `GLOBAL FRAME MEASUREMENT` without fabricating artificial spatial bounding boxes.

---

## 🆚 PIXORA vs Conventional Detection

| Conventional                  | PIXORA                    |
| ----------------------------- | ------------------------- |
| Real / Fake                   | Evidence-aware assessment |
| Single detector               | Multiple evidence sources |
| Model confidence              | Quality + uncertainty     |
| Black-box result              | Explainable reasoning     |
| Signals treated independently | Evidence relationships    |
| Conflicts ignored             | Conflicts represented     |
| Missing evidence ignored      | Completeness analysis     |
| Always concludes              | Can abstain               |
| Score → Decision              | Eligibility → Decision    |
| Detection-focused             | Investigation-focused     |

---

## ⚠️ Responsible Forensics

PIXORA assists human investigators; it does not replace expert judgment.

Evidence should be distinguished as:

`OBSERVED` • `SUPPORTED` • `INFERRED` • `UNKNOWN` • `NOT ESTABLISHED`

The system must not present unsupported conclusions as absolute truth.

---

# 🎯 Final USP

## **Don't just detect. Determine whether the evidence is sufficient to conclude.**

> **Existing forensic technologies generate evidence. PIXORA determines what that evidence collectively justifies.**

---

<p align="center">

### 🔎 PIXORA

**Evidence-Aware Digital Image Forensic Investigation**

**Detect less blindly. Investigate more intelligently.**

</p>
