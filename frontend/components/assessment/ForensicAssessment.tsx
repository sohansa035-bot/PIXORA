'use client';

import React from 'react';
import { ForensicCase } from '@/types/forensics';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
} from 'lucide-react';

interface ForensicAssessmentProps {
  currentCase: ForensicCase;
  onOpenReport: () => void;
}

export const ForensicAssessment: React.FC<ForensicAssessmentProps> = ({
  currentCase,
  onOpenReport,
}) => {
  const { assessment } = currentCase;

  const getVerdictBadge = (outcome: string) => {
    switch (outcome) {
      case 'INCONCLUSIVE':
      case 'CONFLICTING EVIDENCE':
        return {
          textColor: 'text-[#f59e0b]',
          bgColor: 'bg-[#f59e0b]/15',
          borderColor: 'border-[#f59e0b]',
          icon: AlertTriangle,
        };
      case 'SUPPORTED MANIPULATION':
      case 'LIKELY MANIPULATED':
        return {
          textColor: 'text-[#ef4444]',
          bgColor: 'bg-[#ef4444]/15',
          borderColor: 'border-[#ef4444]',
          icon: XCircle,
        };
      case 'NO SIGNIFICANT MANIPULATION EVIDENCE':
        return {
          textColor: 'text-[#00f59b]',
          bgColor: 'bg-[#00f59b]/15',
          borderColor: 'border-[#00f59b]',
          icon: CheckCircle2,
        };
      default:
        return {
          textColor: 'text-[#8e919b]',
          bgColor: 'bg-[#1a1d26]',
          borderColor: 'border-[#2d3240]',
          icon: HelpCircle,
        };
    }
  };

  const style = getVerdictBadge(assessment.outcome);
  const VerdictIcon = style.icon;

  return (
    <div id="assessment" className="rounded-lg bg-[#0b0c11] border border-[#232736] p-6 sm:p-10 shadow-2xl relative overflow-hidden font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#1b1f2c]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00f59b]" />
            <span className="text-[11px] uppercase tracking-widest text-[#00f59b]">
              FINAL FORENSIC DELIVERABLE
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4f4f6]">
            FORENSIC ASSESSMENT
          </h3>
          <p className="text-xs text-[#8e919b] font-sans mt-0.5">
            Objective evidentiary findings synthesized under the Scientific Working Group on
            Digital Evidence (SWGDE) guidelines.
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#131620] hover:bg-[#1a1e2c] border border-[#2a2f3f] text-xs text-[#00f59b] font-bold transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>VIEW FULL DOSSIER REPORT</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Calibrated Verdict Banner */}
      <div
        className={`p-6 sm:p-8 rounded-lg border-2 ${style.bgColor} ${style.borderColor} shadow-2xl mb-8 relative`}
      >
        <div className="flex items-start gap-4">
          <VerdictIcon className={`w-8 h-8 ${style.textColor} flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <div className="text-[10px] text-[#8e919b] uppercase mb-1">
              DOCKET VERDICT // {currentCase.caseId}
            </div>
            <div className={`text-2xl sm:text-4xl font-bold tracking-wider mb-2 ${style.textColor}`}>
              {assessment.outcome}
            </div>
            <p className="text-sm font-sans text-[#f4f4f6] leading-relaxed max-w-3xl">
              {assessment.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Dual Column: WHAT WE ESTABLISHED vs WHAT WE CANNOT ESTABLISH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Established Findings */}
        <div className="p-6 rounded-lg bg-[#0e1017] border border-[#1f2330] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00f59b] pb-2 border-b border-[#1b1f2b]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="uppercase">WHAT WE ESTABLISHED (VERIFIED OBSERVATIONS)</span>
          </div>
          <ul className="space-y-3 text-xs text-[#d1d3db]">
            {assessment.whatEstablished.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#00f59b] font-bold mt-0.5">✓</span>
                <span className="font-sans leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Scientific Limitations / What We Cannot Establish */}
        <div className="p-6 rounded-lg bg-[#140e11] border border-[#2d1b22] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#ef4444] pb-2 border-b border-[#2d1b22]">
            <XCircle className="w-4 h-4" />
            <span className="uppercase">WHAT WE CANNOT ESTABLISH (SCIENTIFIC BOUNDS)</span>
          </div>
          <ul className="space-y-3 text-xs text-[#e5b3ba]">
            {assessment.whatCannotBeEstablished.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#ef4444] font-bold mt-0.5">✕</span>
                <span className="font-sans leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Action & Investigator Guidance */}
      <div className="p-5 rounded-lg bg-[#12141d] border border-[#222736] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] text-[#8e919b] uppercase flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#00f59b]" />
            <span>EXAMINER PROTOCOL DIRECTIVE</span>
          </div>
          <div className="text-sm font-bold text-[#f4f4f6]">
            {assessment.recommendedAction}
          </div>
          <div className="text-xs text-[#8e919b] font-sans">
            {assessment.investigatorNotes}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#00f59b] bg-[#00f59b]/10 px-3 py-1.5 rounded border border-[#00f59b]/30">
          <ShieldCheck className="w-4 h-4" />
          <span>CHAIN OF CUSTODY PRESERVED</span>
        </div>
      </div>
    </div>
  );
};
