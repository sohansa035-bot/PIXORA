'use client';

import React from 'react';
import { ForensicCase } from '@/types/forensics';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface DecisionGateProps {
  currentCase: ForensicCase;
}

export const DecisionGate: React.FC<DecisionGateProps> = ({ currentCase }) => {
  const evalData = currentCase.evaluation;
  const hasConflicts = evalData.consistencyScore < 70;

  const metrics = [
    { label: 'AVAILABILITY', score: evalData.evidenceAvailabilityScore, threshold: '≥ 50%', passed: true },
    { label: 'QUALITY', score: evalData.evidenceQualityScore, threshold: '≥ 70%', passed: true },
    { label: 'APPLICABILITY', score: evalData.applicabilityScore, threshold: '≥ 75%', passed: true },
    { label: 'CONSISTENCY', score: evalData.consistencyScore, threshold: '≥ 75%', passed: !hasConflicts },
    { label: 'UNCERTAINTY', score: evalData.uncertaintyScore, threshold: '≤ 35%', passed: !hasConflicts },
  ];

  return (
    <div id="conflicts" className="rounded-2xl bg-white border border-[#D6D0C5] p-6 sm:p-8 shadow-sm font-mono text-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D6D0C5]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111]">
            Conflicts
          </h2>
          <p className="text-xs text-[#77736C] font-sans mt-0.5">
            Cross-referencing observed signals to detect discrepancies between physical pixels, metadata, and provenance credentials.
          </p>
        </div>

        {/* Conflict Status Badge */}
        <div
          className={`px-3.5 py-1.5 rounded-xl border font-bold flex items-center gap-2 ${
            hasConflicts
              ? 'bg-[#FEECEC] border-[#F04444] text-[#F04444]'
              : 'bg-[#F6FCEB] border-[#B7E43A] text-[#2B4E08]'
          }`}
        >
          {hasConflicts ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>UNRESOLVED CONFLICT DETECTED</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>SIGNALS CONSISTENT</span>
            </>
          )}
        </div>
      </div>

      {/* Primary Conflict Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conflict 1 */}
        <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#F04444]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#F04444] font-bold text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>PIXEL RESIDUALS ⚡ PROVENANCE MANIFEST</span>
            </span>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#FEECEC] text-[#F04444] font-bold border border-[#F04444]/30">
              DIRECT CONFLICT
            </span>
          </div>
          <p className="text-xs text-[#522026] font-sans leading-relaxed">
            Pixel forensics indicates localized splicing on Region #03 (84% confidence), while the C2PA hardware manifest certifies an authentic camera capture without any subsequent signed edit assertions.
          </p>
        </div>

        {/* Supporting Signal */}
        <div className="p-4 rounded-xl bg-[#F6FCEB] border border-[#B7E43A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#2B4E08] font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6B08]" />
              <span>METADATA SOFTWARE ↔ PIXEL RESIDUALS</span>
            </span>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#B7E43A]/25 text-[#2B4E08] font-bold border border-[#B7E43A]">
              CORROBORATING SIGNAL
            </span>
          </div>
          <p className="text-xs text-[#2A4418] font-sans leading-relaxed">
            Quantization table mismatch and Adobe Photoshop XMP tags in metadata corroborate secondary compression around Region #03, supporting the localized edit observation.
          </p>
        </div>
      </div>

      {/* Signal Consistency Metrics */}
      <div className="space-y-2">
        <div className="text-[10px] text-[#77736C] uppercase font-bold">
          SIGNAL EVALUATION METRICS
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`p-3.5 rounded-xl border transition-all ${
                m.passed
                  ? 'bg-[#FAF8F5] border-[#D6D0C5]'
                  : 'bg-[#FFF8F8] border-[#F04444]/50'
              }`}
            >
              <div className="text-[9px] text-[#77736C] uppercase mb-1">{m.label}</div>
              <div
                className={`text-xl font-bold ${
                  m.passed ? 'text-[#111111]' : 'text-[#F04444]'
                }`}
              >
                {m.score}%
              </div>
              <div className="text-[9px] text-[#77736C] flex items-center justify-between mt-1 pt-1.5 border-t border-[#E7E2D8]">
                <span>REQ: {m.threshold}</span>
                <span className={`font-bold ${m.passed ? 'text-[#2B4E08]' : 'text-[#F04444]'}`}>
                  {m.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Impact Notice */}
      <div className="p-4 rounded-xl bg-[#FFF9F2] border border-[#FF8A3D]/40 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#FF8A3D] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#111111]">
            IMPACT ON ASSESSMENT
          </div>
          <p className="text-xs text-[#77736C] font-sans leading-relaxed">
            Because observed pixel signals conflict with provenance credentials, an automated single-verdict conclusion cannot be reliably drawn without secondary independent source corroboration.
          </p>
        </div>
      </div>
    </div>
  );
};
