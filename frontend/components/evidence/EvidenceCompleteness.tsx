'use client';

import React from 'react';
import { ForensicCase, CompletenessItem } from '@/types/forensics';
import { CheckCircle2, AlertCircle, XCircle, HelpCircle, Layers } from 'lucide-react';

interface EvidenceCompletenessProps {
  currentCase: ForensicCase;
}

export const EvidenceCompleteness: React.FC<EvidenceCompletenessProps> = ({ currentCase }) => {
  const { overallPercentage, items } = currentCase.completeness;

  const getStatusBadge = (status: CompletenessItem['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="text-[10px] font-bold text-[#00f59b] bg-[#00f59b]/15 px-2 py-0.5 rounded border border-[#00f59b]/30">
            AVAILABLE
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/15 px-2 py-0.5 rounded border border-[#f59e0b]/30">
            PARTIAL
          </span>
        );
      case 'MISSING':
        return (
          <span className="text-[10px] font-bold text-[#ef4444] bg-[#ef4444]/15 px-2 py-0.5 rounded border border-[#ef4444]/30">
            MISSING
          </span>
        );
    }
  };

  return (
    <div className="rounded-lg bg-[#0b0c11] border border-[#232736] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1b1f2c]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00f59b]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#00f59b]">
              EVIDENCE COMPLETENESS AUDIT
            </span>
          </div>
          <h3 className="text-xl font-mono font-bold text-[#f4f4f6]">
            DOCKET COMPLETENESS ANALYSIS
          </h3>
          <p className="text-xs text-[#8e919b] font-sans">
            Quantifies the presence and absence of evidentiary components. This is not an
            arbitrary &ldquo;trust score&rdquo;—it is structural evidence availability.
          </p>
        </div>

        {/* Circular / Big Metric Display */}
        <div className="flex items-center gap-4 bg-[#11131c] px-4 py-2.5 rounded-lg border border-[#202433]">
          <div className="text-right font-mono">
            <div className="text-[10px] text-[#8e919b] uppercase">COMPLETENESS INDEX</div>
            <div className="text-2xl font-bold text-[#00f59b]">{overallPercentage}%</div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#1a1d28]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#00f59b] transition-all duration-1000"
                strokeDasharray={`${overallPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress Bars Breakdown */}
      <div className="space-y-3 font-mono text-xs">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded bg-[#0f1118] border border-[#1e222e] space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#f4f4f6]">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#8e919b]">WEIGHT: {item.weight}%</span>
                {getStatusBadge(item.status)}
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 rounded-full bg-[#171924] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  item.status === 'AVAILABLE'
                    ? 'bg-[#00f59b]'
                    : item.status === 'PARTIAL'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#ef4444]'
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>

            <p className="text-[11px] text-[#8e919b] font-sans">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
