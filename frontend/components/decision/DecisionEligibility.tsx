'use client';

import React, { useState } from 'react';
import { ForensicCase } from '@/types/forensics';
import {
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowDown,
  ShieldAlert,
  Sliders,
  Lock,
  Unlock,
} from 'lucide-react';

interface DecisionEligibilityProps {
  currentCase: ForensicCase;
}

export const DecisionEligibility: React.FC<DecisionEligibilityProps> = ({ currentCase }) => {
  const evalData = currentCase.evaluation;
  const isPassed = evalData.eligibility === 'PASSED';

  const metrics = [
    { label: 'AVAILABILITY', val: evalData.evidenceAvailabilityScore, target: '≥ 50%' },
    { label: 'QUALITY', val: evalData.evidenceQualityScore, target: '≥ 70%' },
    { label: 'APPLICABILITY', val: evalData.applicabilityScore, target: '≥ 75%' },
    { label: 'CONSISTENCY', val: evalData.consistencyScore, target: '≥ 75%' },
    { label: 'COMPLETENESS', val: evalData.completenessScore, target: '≥ 60%' },
    { label: 'UNCERTAINTY', val: evalData.uncertaintyScore, target: '≤ 35%', invert: true },
  ];

  return (
    <div id="eligibility" className="rounded-lg bg-[#0a0b10] border border-[#232736] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Accent glow depending on outcome */}
      <div
        className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20 ${
          isPassed ? 'bg-[#00f59b]' : 'bg-[#ef4444]'
        }`}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#1b1f2c] relative z-10 font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isPassed ? 'bg-[#00f59b]' : 'bg-[#ef4444]'
              } animate-ping`}
            />
            <span className="text-[11px] uppercase tracking-widest text-[#00f59b]">
              RIGOROUS ASSESSMENT GATING
            </span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#f4f4f6]">
            DECISION ELIGIBILITY
          </h3>
          <p className="text-xs text-[#8e919b] font-sans mt-1">
            Evidence-aware threshold engine. Automated conclusions are strictly blocked if
            underlying signals contain critical unresolved contradictions.
          </p>
        </div>

        {/* State Badge */}
        <div
          className={`px-4 py-2 rounded-lg border font-mono text-xs font-bold flex items-center gap-2.5 ${
            isPassed
              ? 'bg-[#00f59b]/15 border-[#00f59b] text-[#00f59b] shadow-[0_0_20px_rgba(0,245,155,0.2)]'
              : 'bg-[#ef4444]/15 border-[#ef4444] text-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.2)]'
          }`}
        >
          {isPassed ? (
            <>
              <Unlock className="w-4 h-4" />
              <span>DECISION ELIGIBILITY: PASSED</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>DECISION ELIGIBILITY: FAILED — CONCLUSION BLOCKED</span>
            </>
          )}
        </div>
      </div>

      {/* The 6 Calibrated Evaluation Inputs */}
      <div className="relative z-10 mb-8">
        <div className="text-[11px] font-mono text-[#8e919b] uppercase mb-3 flex items-center justify-between">
          <span>EVIDENTIARY INPUT METRICS</span>
          <span>THRESHOLD FORMULA EVALUATION</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((m) => {
            const meets = m.invert ? m.val <= 35 : m.val >= 70;
            return (
              <div
                key={m.label}
                className={`p-3.5 rounded border font-mono transition-all ${
                  meets
                    ? 'bg-[#0f121a] border-[#222736]'
                    : 'bg-[#181114] border-[#ef4444]/50'
                }`}
              >
                <div className="text-[10px] text-[#8e919b] uppercase mb-1">{m.label}</div>
                <div
                  className={`text-xl font-bold ${
                    meets ? 'text-[#f4f4f6]' : 'text-[#ef4444]'
                  }`}
                >
                  {m.val}%
                </div>
                <div className="text-[10px] text-[#585b65] flex items-center justify-between mt-1 pt-1 border-t border-[#1d202c]">
                  <span>REQ: {m.target}</span>
                  <span className={meets ? 'text-[#00f59b]' : 'text-[#ef4444]'}>
                    {meets ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Downward Transformation Flow */}
      <div className="relative z-10 flex flex-col items-center justify-center py-2 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#8e919b]">
          <span>EVALUATE CONSISTENCY & UNCERTAINTY BOUNDS</span>
          <ArrowDown className="w-4 h-4 text-[#00f59b] animate-bounce" />
        </div>

        {/* Sufficiency Level Card */}
        <div className="w-full max-w-xl p-4 rounded bg-[#10131d] border border-[#232838] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#8e919b] uppercase">INTERMEDIATE EVALUATION</div>
            <div className="text-sm font-bold text-[#f4f4f6]">EVIDENCE SUFFICIENCY</div>
          </div>
          <span
            className={`px-3 py-1 rounded text-xs font-bold border ${
              evalData.sufficiency === 'SUFFICIENT'
                ? 'bg-[#00f59b]/15 text-[#00f59b] border-[#00f59b]/40'
                : 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40'
            }`}
          >
            {evalData.sufficiency}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#8e919b]">
          <span>APPLY DECISION ELIGIBILITY PROTOCOL</span>
          <ArrowDown className="w-4 h-4 text-[#00f59b]" />
        </div>
      </div>

      {/* Eligibility Decision Result Card */}
      <div
        className={`relative z-10 mt-6 p-6 rounded-lg border font-mono text-xs shadow-xl ${
          isPassed
            ? 'bg-[#0b1411] border-[#00f59b]/40 text-[#d1f2e6]'
            : 'bg-[#180f12] border-[#ef4444]/40 text-[#f7d5da]'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {isPassed ? (
              <CheckCircle2 className="w-6 h-6 text-[#00f59b]" />
            ) : (
              <XCircle className="w-6 h-6 text-[#ef4444]" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-bold tracking-wide text-[#f4f4f6]">
                {isPassed
                  ? 'DECISION ELIGIBILITY: PASSED — VERDICT PERMITTED'
                  : 'DECISION ELIGIBILITY: FAILED — CONCLUSION BLOCKED'}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40 border border-current">
                DAUBERT RELIABILITY STANDARD
              </span>
            </div>

            {evalData.blockReason && (
              <div className="p-3 rounded bg-black/50 border border-[#ef4444]/50 text-xs text-[#ff99a8]">
                <strong>GATING EXPLANATION:</strong> {evalData.blockReason}
              </div>
            )}

            <p className="text-xs font-sans text-[#c4c7d4] leading-relaxed">
              {evalData.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
