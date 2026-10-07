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

## 🏗️ Architecture

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
            ╚═══════════════╤══════════════╝
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

## 🧪 Evaluation

PIXORA should be evaluated on:

* Detection & localization
* Evidence consistency
* Conflict handling
* Missing-evidence identification
* Evidence sufficiency
* Decision eligibility
* Abstention quality
* Explainability
* Generalization
* Controlled evidence-state experiments

---

## 🧱 Technology Direction

```text
FORENSIC LAYER
Pixel • Metadata • Provenance • AI • History • Context
                         ↓
INTELLIGENCE LAYER
Normalization • Quality • Applicability • Relationships
Completeness • Conflict • Sufficiency • Eligibility
                         ↓
PRESENTATION LAYER
Dashboard • Evidence Visualization • Assessment • Reports
```

---

## 🛣️ Roadmap

**Phase 1 — Foundation**

* [ ] Image ingestion
* [ ] File hashing
* [ ] Metadata extraction
* [ ] Evidence schema
* [ ] Investigation lifecycle

**Phase 2 — Forensics**

* [ ] Pixel analysis
* [ ] Manipulation localization
* [ ] Metadata/file analysis
* [ ] Provenance
* [ ] Evidence normalization

**Phase 3 — Intelligence**

* [ ] Quality & applicability
* [ ] Evidence graph
* [ ] Conflict detection
* [ ] Completeness
* [ ] Uncertainty

**Phase 4 — Decision**

* [ ] Sufficiency engine
* [ ] Decision Eligibility Gate
* [ ] Conclude / Abstain
* [ ] Explainable assessment

**Phase 5 — Investigation UX**

* [ ] Dashboard
* [ ] Evidence timeline
* [ ] Manipulation heatmap
* [ ] Evidence visualization
* [ ] Report generation

**Phase 6 — Validation**

* [ ] Benchmark dataset
* [ ] Detector comparison
* [ ] Conflict/missing-evidence scenarios
* [ ] Abstention evaluation

---

## 🔬 Existing Technology vs PIXORA

| Capability                           | Position                        |
| ------------------------------------ | ------------------------------- |
| Manipulation detection/localization  | Existing technology             |
| Metadata analysis                    | Existing technology             |
| C2PA                                 | Existing standard               |
| AI detection                         | Existing research               |
| Manipulation history                 | Existing research               |
| Evidence fusion/graphs               | Existing research               |
| Uncertainty/conflict handling        | Existing research               |
| **Evidence-to-Decision Framework**   | **Proposed contribution**       |
| **Decision Eligibility Gate**        | **Proposed mechanism**          |
| **Evidence Sufficiency Evaluation**  | **Proposed research direction** |
| **Controlled justification testing** | **Potential contribution**      |

> Novelty is a research claim to validate, not an assumption.

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
