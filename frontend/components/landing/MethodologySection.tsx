'use client';

import React, { useState } from 'react';
import {
  Binary,
  Layers,
  FileCode,
  ShieldAlert,
  GitBranch,
  Table,
  CheckCircle,
  Award,
  ChevronRight,
  Terminal,
} from 'lucide-react';

interface MethodologyStep {
  number: string;
  id: string;
  title: string;
  tagline: string;
  icon: React.ElementType;
  technicalDetails: {
    inputs: string;
    operations: string[];
    outputs: string;
    scientificBasis: string;
  };
}

const METHODOLOGY_STEPS: MethodologyStep[] = [
  {
    number: '01',
    id: 'ingest',
    title: 'INGEST & BIT-STREAM VALIDATION',
    tagline: 'Cryptographic hashing, container integrity, bit-depth verification',
    icon: Binary,
    technicalDetails: {
      inputs: 'Raw bitstream (JPEG, PNG, WebP, HEIF, TIFF, DNG)',
      operations: [
        'SHA-256, SHA-1, and MD5 cryptographic integrity fingerprinting',
        'Byte marker parser for non-standard payload or steganographic insertion',
        'ICC color profile and gamut boundary verification',
      ],
      outputs: 'Verified raster matrix, immutable case hash ID, format descriptor',
      scientificBasis: 'ISO/IEC 27037 Digital Evidence Handling Standards',
    },
  },
  {
    number: '02',
    id: 'pixel',
    title: 'PIXEL FORENSICS & SPATIAL RESIDUALS',
    tagline: 'Error level analysis, PRNU sensor noise, edge Laplacian discontinuity',
    icon: Layers,
    technicalDetails: {
      inputs: 'Decoded 8-bit / 16-bit raster color planes',
      operations: [
        'Error Level Analysis (ELA) re-compression gradient computation',
        'Photo-Response Non-Uniformity (PRNU) sensor fingerprint extraction',
        'Discrete Cosine Transform (DCT) coefficient double-quantization matrix',
        'Laplacian edge response across boundary transitions',
      ],
      outputs: 'Localized anomaly heatmaps, bounding boxes, spatial variance vector',
      scientificBasis: 'Farid (2009) Digital Image Forensics & Popescu-Farid Double Quantization',
    },
  },
  {
    number: '03',
    id: 'metadata',
    title: 'METADATA & CONTAINER FORENSICS',
    tagline: 'EXIF, XMP, TIFF tags, thumbnail sync, quantization table signatures',
    icon: FileCode,
    technicalDetails: {
      inputs: 'App1, App2, App13 metadata segments & XMP sidecars',
      operations: [
        'Quantization table (DQT) matching against 850+ camera manufacturer baselines',
        'Embedded thumbnail raster vs primary raster structural correlation',
        'Software signature timestamp delta calculation',
      ],
      outputs: 'Software warning indicator, re-encoding generations count',
      scientificBasis: 'NIST Special Publication 800-86 Guide to Integrating Forensic Techniques',
    },
  },
  {
    number: '04',
    id: 'provenance',
    title: 'PROVENANCE & CONTENT CREDENTIALS',
    tagline: 'C2PA cryptographic manifests, hardware enclave roots, signature chain',
    icon: ShieldAlert,
    technicalDetails: {
      inputs: 'JUMBF container segment & C2PA manifest store',
      operations: [
        'X.509 certificate trust anchor validation (Hardware Roots / CAs)',
        'ECDSA signature digest verification across active claim assertions',
        'Action history chain validation (Capture → Edit → Export)',
      ],
      outputs: 'Cryptographic attestation state: Verified, Broken, or Missing',
      scientificBasis: 'Coalition for Content Provenance and Authenticity (C2PA) Specification 2.1',
    },
  },
  {
    number: '05',
    id: 'normalization',
    title: 'EVIDENCE NORMALIZATION',
    tagline: 'Standardizing signal confidence, applicability, and sensor fidelity',
    icon: GitBranch,
    technicalDetails: {
      inputs: 'Disparate spatial, spectral, container, and cryptographic findings',
      operations: [
        'Signal calibration across compression noise thresholds',
        'Harmonization of sensor resolution downsampling penalties',
        'Applicability weighting relative to the specific target inquiry',
      ],
      outputs: 'Uniform evidentiary units with bounded uncertainty intervals',
      scientificBasis: 'Bayesian Evidentiary Belief Filtering',
    },
  },
  {
    number: '06',
    id: 'intelligence',
    title: 'EVIDENCE MATRIX & RELATIONSHIPS',
    tagline: 'Directed evidence graph, conflict detection, mutual corroboration',
    icon: Table,
    technicalDetails: {
      inputs: 'Normalized evidence units',
      operations: [
        'Directed acyclic graph construction (Source → Anomaly → Credential)',
        'Logical conflict mapping (e.g., Authentic C2PA vs Spliced Pixel)',
        'Corroboration reinforcement calculation',
      ],
      outputs: 'Evidence Matrix and conflict relationship vectors',
      scientificBasis: 'Structured Evidentiary Graph Reasoning (Schum Evidence Theory)',
    },
  },
  {
    number: '07',
    id: 'sufficiency',
    title: 'SUFFICIENCY & DECISION ELIGIBILITY',
    tagline: 'Rigorous evaluation threshold against false certainty',
    icon: CheckCircle,
    technicalDetails: {
      inputs: 'Evidence completeness, consistency ratio, uncertainty magnitude',
      operations: [
        'Threshold evaluation: Availability + Quality + Consistency + Uncertainty',
        'Conflict gate evaluation: If critical signals contradict, block verdict',
        'Determination state: PASSED vs FAILED / CONCLUSION BLOCKED',
      ],
      outputs: 'Decision eligibility flag, sufficiency tier (Sufficient/Partial/Insufficient)',
      scientificBasis: 'Daubert Legal Standard of Evidentiary Reliability',
    },
  },
  {
    number: '08',
    id: 'assessment',
    title: 'EXPLAINABLE FORENSIC ASSESSMENT',
    tagline: 'Calibrated findings, explicit limitations, actionable examiner guidance',
    icon: Award,
    technicalDetails: {
      inputs: 'Eligibility outcome, matrix items, established facts',
      operations: [
        'Synthesis of established findings vs unestablished boundaries',
        'Non-binary calibrated determination categorization',
        'Compilation of examiner review docket and chain of custody docket',
      ],
      outputs: 'Forensic assessment docket, PDF export, tamper-evident hash token',
      scientificBasis: 'SWGDE (Scientific Working Group on Digital Evidence) Standards',
    },
  },
];

export const MethodologySection: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const active = METHODOLOGY_STEPS[selectedStep];

  return (
    <section id="methodology" className="py-24 border-b border-[#1a1d24] relative bg-[#080808]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f59b]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#00f59b]">
              RIGOROUS FORENSIC PIPELINE
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#f4f4f6] mb-4">
            How PIXORA investigates evidence.
          </h2>
          <p className="text-sm sm:text-base text-[#8e919b]">
            An eight-stage scientific pipeline built upon established peer-reviewed digital
            forensics, cryptographic provenance protocols, and formal evidentiary reasoning.
          </p>
        </div>

        {/* Interactive Layout: Left Timeline Steps / Right Deep Inspection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Step Selector Nodes */}
          <div className="lg:col-span-5 space-y-2">
            {METHODOLOGY_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = selectedStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedStep(idx)}
                  className={`w-full text-left p-3.5 rounded transition-all duration-200 border flex items-center gap-3.5 group relative ${
                    isSelected
                      ? 'bg-[#12151e] border-[#00f59b]/50 text-[#f4f4f6] shadow-[0_0_20px_rgba(0,245,155,0.08)]'
                      : 'bg-[#0b0c10] border-[#1d202b] text-[#8e919b] hover:border-[#2f3445] hover:bg-[#0f1117]'
                  }`}
                >
                  {/* Step Number */}
                  <div
                    className={`font-mono text-xs font-bold px-2 py-1 rounded transition-colors ${
                      isSelected
                        ? 'bg-[#00f59b] text-black'
                        : 'bg-[#181a24] text-[#8e919b] group-hover:text-[#f4f4f6]'
                    }`}
                  >
                    {step.number}
                  </div>

                  {/* Title & Tagline */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-mono text-xs font-semibold tracking-wide truncate ${
                        isSelected ? 'text-[#00f59b]' : 'text-[#f4f4f6]'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-[11px] text-[#8e919b] truncate font-sans">
                      {step.tagline}
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected
                        ? 'text-[#00f59b] translate-x-1'
                        : 'text-[#393d4f] group-hover:text-[#8e919b]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: Technical Step Deep-Dive Card */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-lg bg-[#0d0e14] border border-[#232735] shadow-2xl relative">
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1b1e2a] text-xs font-mono">
                <div className="flex items-center gap-2 text-[#00f59b]">
                  <Terminal className="w-4 h-4" />
                  <span>
                    PIPELINE STAGE {active.number} {'//'} {active.id.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-[#8e919b]">
                  SCIENTIFIC SPECIFICATION
                </div>
              </div>

              {/* Step Header */}
              <div className="mb-6">
                <div className="text-2xl font-mono font-bold text-[#f4f4f6] mb-1">
                  {active.title}
                </div>
                <p className="text-sm text-[#8e919b] font-sans leading-relaxed">
                  {active.tagline}
                </p>
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="space-y-6">
                {/* Inputs & Outputs Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded bg-[#13151f] border border-[#222533]">
                    <div className="text-[10px] font-mono uppercase text-[#8e919b] mb-1">
                      STAGE INPUTS
                    </div>
                    <div className="text-xs font-mono text-[#f4f4f6]">
                      {active.technicalDetails.inputs}
                    </div>
                  </div>
                  <div className="p-3.5 rounded bg-[#13151f] border border-[#222533]">
                    <div className="text-[10px] font-mono uppercase text-[#00f59b] mb-1">
                      PRIMARY DELIVERABLE
                    </div>
                    <div className="text-xs font-mono text-[#00f59b]">
                      {active.technicalDetails.outputs}
                    </div>
                  </div>
                </div>

                {/* Algorithmic Operations */}
                <div>
                  <div className="text-xs font-mono uppercase text-[#8e919b] tracking-wider mb-3">
                    CORE INVESTIGATIVE PROCEDURES
                  </div>
                  <ul className="space-y-2 font-mono text-xs text-[#d1d3db]">
                    {active.technicalDetails.operations.map((op, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-2 rounded bg-[#10121a] border border-[#1d202d]"
                      >
                        <span className="text-[#00f59b] font-bold">›</span>
                        <span>{op}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scientific Baseline */}
                <div className="pt-4 border-t border-[#1a1d27] flex items-center justify-between text-[11px] font-mono text-[#8e919b]">
                  <span>GOVERNING STANDARD:</span>
                  <span className="text-[#f4f4f6] font-semibold">
                    {active.technicalDetails.scientificBasis}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
