'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Scale,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';

export const PhilosophySection: React.FC = () => {
  return (
    <section className="py-24 border-b border-[#1a1d24] relative overflow-hidden bg-[#090a0e]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f59b]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#00f59b]">
              INVESTIGATIVE PRINCIPLES
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#f4f4f6] mb-6">
            &ldquo;Don&apos;t just detect.{' '}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] to-[#00f59b]">
              Determine whether the evidence is sufficient to conclude.&rdquo;
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#8e919b] font-normal leading-relaxed">
            In serious digital image forensics, an arbitrary percentage score is reckless.
            A raw metric cannot differentiate between harmless color balance adjustments,
            compression artifacts, and deceptive localized composite splicing.
          </p>
        </div>

        {/* Side-by-Side Comparison: Generic AI vs PIXORA Forensic Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left: What Generic AI Tools Do */}
          <div className="p-8 rounded-lg bg-[#0e0f14] border border-[#232733] relative group">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1d212c]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#ef4444]">
                <XCircle className="w-4 h-4" />
                <span className="font-bold tracking-wider uppercase">
                  CONVENTIONAL &ldquo;AI DETECTOR&rdquo;
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#585b65] uppercase">
                FRAGILE HEURISTICS
              </span>
            </div>

            {/* Fake generic output mock */}
            <div className="p-6 rounded bg-[#161820] border border-[#292d3b] mb-6 text-center">
              <div className="text-[11px] font-mono uppercase text-[#8e919b] mb-1">
                OUTPUT VERDICT
              </div>
              <div className="text-4xl font-mono font-bold text-[#ef4444] mb-2 tracking-wider">
                FAKE — 94%
              </div>
              <p className="text-xs text-[#8e919b]">
                Uncalibrated black-box scalar. Zero evidentiary provenance.
              </p>
            </div>

            <ul className="space-y-3 font-mono text-xs text-[#8e919b]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#ef4444] font-bold">✕</span>
                <span>Conflates JPEG recompression with malicious digital tampering</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ef4444] font-bold">✕</span>
                <span>Blindsides legal and editorial standards with opaque probability scores</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ef4444] font-bold">✕</span>
                <span>Ignores conflicting hardware C2PA cryptographic provenance manifests</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ef4444] font-bold">✕</span>
                <span>Assumes editing software tag (Photoshop) equals fraud</span>
              </li>
            </ul>
          </div>

          {/* Right: What PIXORA Delivers */}
          <div className="p-8 rounded-lg bg-[#0d1211] border border-[#00f59b]/30 relative shadow-[0_0_40px_rgba(0,245,155,0.06)]">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#00f59b]/20">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00f59b]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold tracking-wider uppercase">
                  PIXORA EVIDENCE-AWARE ARCHITECTURE
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#00f59b] uppercase bg-[#00f59b]/10 px-2 py-0.5 rounded border border-[#00f59b]/30">
                FORENSIC STANDARD
              </span>
            </div>

            {/* PIXORA Rigorous Output Mock */}
            <div className="p-5 rounded bg-[#090e0c] border border-[#00f59b]/25 mb-6">
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <span className="text-[#8e919b]">EVIDENCE SUFFICIENCY:</span>
                <span className="text-[#f59e0b] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                  PARTIAL (CONFLICT UNRESOLVED)
                </span>
              </div>
              <div className="text-sm font-mono text-[#f4f4f6] font-semibold mb-2">
                ASSESSMENT: INCONCLUSIVE (MANUAL REVIEW REQUIRED)
              </div>
              <p className="text-xs text-[#8e919b] font-sans">
                Hardware C2PA capture verified for background; localized pixel anomaly
                detected on Region-01. Automated verdict gated until RAW source corroboration.
              </p>
            </div>

            <ul className="space-y-3 font-mono text-xs text-[#d1d3db]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#00f59b] font-bold">✓</span>
                <span>Explicitly establishes WHAT WAS OBSERVED vs WHAT IS MISSING</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#00f59b] font-bold">✓</span>
                <span>Maps relationships: which signals support, and which conflict</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#00f59b] font-bold">✓</span>
                <span>Gates conclusions through mathematical Evidence Sufficiency thresholds</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#00f59b] font-bold">✓</span>
                <span>Transparently declares what CANNOT be established scientifically</span>
              </li>
            </ul>
          </div>
        </div>

        {/* The Evidentiary Transformation Pipeline Banner */}
        <div className="p-6 rounded-lg bg-[#0c0d12] border border-[#1f222d]">
          <div className="text-xs font-mono uppercase tracking-wider text-[#8e919b] mb-4 text-center">
            THE FORENSIC TRANSFORMATION PIPELINE
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono text-xs text-center">
            {[
              { label: 'IMAGE', desc: 'Raw Raster Decoded' },
              { label: 'OBSERVATION', desc: 'Discontinuities Located' },
              { label: 'EVIDENCE', desc: 'Signals Normalized' },
              { label: 'RELATIONSHIP', desc: 'Support vs Conflict' },
              { label: 'SUFFICIENCY', desc: 'Threshold Gating' },
              { label: 'ELIGIBILITY', desc: 'Pass vs Block' },
              { label: 'ASSESSMENT', desc: 'Calibrated Verdict' },
              { label: 'REPORT', desc: 'Legal Docket' },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.label}>
                <div className="px-3 py-2 rounded bg-[#13151d] border border-[#252836] text-left">
                  <div className="text-[10px] text-[#00f59b] font-bold">{`0${idx + 1}`}</div>
                  <div className="text-xs font-semibold text-[#f4f4f6]">{step.label}</div>
                  <div className="text-[9px] text-[#8e919b] hidden md:block">{step.desc}</div>
                </div>
                {idx < arr.length - 1 && (
                  <span className="text-[#00f59b] font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
