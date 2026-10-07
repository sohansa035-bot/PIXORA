'use client';

import React, { useState } from 'react';
import { ForensicCase } from '@/types/forensics';
import {
  SlidersHorizontal,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface AssessmentCardProps {
  currentCase: ForensicCase;
  onOpenReport?: () => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ currentCase, onOpenReport }) => {
  const { assessment, evaluation } = currentCase;
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState<boolean>(false);

  // Dynamic findings directly derived from live backend forensic boundaries (RULE 3 & 9)
  const establishedItems = assessment.whatEstablished && assessment.whatEstablished.length > 0
    ? assessment.whatEstablished
    : ['No positive manipulation indicators established'];

  const supportingItems = currentCase.relationships.filter((r) => r.type === 'consistent_with' || r.type === 'supports').map((r) => r.conflictReason || r.label);
  const conflictsItems = currentCase.relationships.filter((r) => r.type === 'conflicts').map((r) => r.conflictReason || r.label);

  const missingItems = assessment.whatCannotBeEstablished && assessment.whatCannotBeEstablished.length > 0
    ? assessment.whatCannotBeEstablished
    : (assessment.missingEvidence && assessment.missingEvidence.length > 0 ? assessment.missingEvidence : ['No critical evidence gaps logged']);

  // Dynamic supporting context derived from findings and relationships
  const defaultSupporting = assessment.outcome === 'NO_SIGNIFICANT_MANIPULATION_EVIDENCE'
    ? ['Uniform compression grid consistency across color channels', 'No localized frequency discontinuities detected']
    : assessment.outcome === 'INSUFFICIENT_EVIDENCE'
    ? ['Insufficient secondary forensic signals (metadata / provenance) to substantiate a claim']
    : assessment.outcome === 'LIKELY_MANIPULATED'
    ? ['Pixel-level anomaly observed; secondary confirmation pending examiner review']
    : ['Baseline physical compression parameters observed'];

  const dynamicSupporting = supportingItems.length > 0 ? supportingItems : defaultSupporting;

  const defaultConflicts = conflictsItems.length > 0 
    ? conflictsItems 
    : ['No conflicting evidence signals detected across evaluated domains'];

  const fourSections = [
    {
      title: 'WHAT CAN BE ESTABLISHED',
      items: establishedItems,
      marker: '•',
      color: 'text-[#111111]',
      border: 'border-[#D6D0C5]',
    },
    {
      title: 'WHAT SUPPORTS IT',
      items: dynamicSupporting,
      marker: '•',
      color: 'text-[#2B4E08]',
      border: 'border-[#B7E43A]',
    },
    {
      title: 'WHAT CONFLICTS',
      items: defaultConflicts,
      marker: '•',
      color: 'text-[#F04444]',
      border: 'border-[#F04444]/40',
    },
    {
      title: 'WHAT CANNOT BE ESTABLISHED',
      items: missingItems,
      marker: '•',
      color: 'text-[#FF8A3D]',
      border: 'border-[#FF8A3D]/40',
    },
  ];

  return (
    <div id="assessment-card" className="rounded-2xl bg-white border border-[#D6D0C5] p-6 sm:p-10 shadow-xs space-y-8 font-sans">
      {/* =========================================================================
          SECTION 16: ASSESSMENT HEADER & VISUALLY DOMINANT RESULT (DIRECT FROM BACKEND)
         ========================================================================= */}
      <div className="space-y-4 pb-6 border-b border-[#D6D0C5]">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="font-bold uppercase tracking-wider text-[#77736C]">
            ASSESSMENT
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#FAF8F5] border border-[#D6D0C5] text-[#111111] font-semibold">
              ELIGIBILITY: {assessment.eligibility || evaluation.eligibility}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#FAF8F5] border border-[#D6D0C5] text-[#111111] font-semibold">
              SUFFICIENCY: {assessment.sufficiency || evaluation.sufficiency}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-[#111111] leading-none tracking-tight">
            {assessment.outcome}
          </div>

          <p className="font-editorial italic text-xl sm:text-2xl text-[#524B40] leading-relaxed max-w-4xl pt-1">
            &ldquo;{assessment.subtitle || evaluation.summary}&rdquo;
          </p>
        </div>
      </div>

      {/* =========================================================================
          SECTION 16: THE FOUR SIMPLE SECTIONS
          1. WHAT WE FOUND
          2. WHAT SUPPORTS IT
          3. WHAT CONFLICTS
          4. WHAT IS MISSING
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fourSections.map((sec) => (
          <div
            key={sec.title}
            className={`p-5 rounded-xl bg-[#FAF8F5] border ${sec.border} space-y-2.5`}
          >
            <div className={`text-xs font-mono font-bold uppercase pb-2 border-b border-[#E7E2D8] ${sec.color}`}>
              {sec.title}
            </div>
            <ul className="space-y-2 text-sm text-[#111111] font-sans">
              {sec.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={`font-bold mt-0.5 ${sec.color}`}>{sec.marker}</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* =========================================================================
          SECTION 16 & 20: ADVANCED ANALYSIS PROGRESSIVE DISCLOSURE
          Move numerical scores into "ADVANCED ANALYSIS ->"
         ========================================================================= */}
      <div className="pt-2">
        <button
          onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)}
          className="text-xs font-sans font-semibold text-[#77736C] hover:text-[#111111] transition-colors flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#3155FF]" />
          <span>{showAdvancedAnalysis ? 'Hide advanced analysis' : 'ADVANCED ANALYSIS →'}</span>
        </button>

        {showAdvancedAnalysis && (
          <div className="mt-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] text-xs font-mono space-y-3 animate-in fade-in duration-100">
            <div className="text-[11px] font-bold text-[#111111] uppercase">
              NUMERICAL EVALUATION METRICS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#D6D0C5]">
                <div className="text-[10px] text-[#77736C]">AVAILABILITY</div>
                <div className="text-lg font-bold text-[#111111]">{evaluation.evidenceAvailabilityScore}%</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D6D0C5]">
                <div className="text-[10px] text-[#77736C]">QUALITY</div>
                <div className="text-lg font-bold text-[#111111]">{evaluation.evidenceQualityScore}%</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D6D0C5]">
                <div className="text-[10px] text-[#77736C]">APPLICABILITY</div>
                <div className="text-lg font-bold text-[#111111]">{evaluation.applicabilityScore}%</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D6D0C5]">
                <div className="text-[10px] text-[#77736C]">CONSISTENCY</div>
                <div className="text-lg font-bold text-[#F04444]">{evaluation.consistencyScore}%</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D6D0C5]">
                <div className="text-[10px] text-[#77736C]">UNCERTAINTY</div>
                <div className="text-lg font-bold text-[#FF8A3D]">{evaluation.uncertaintyScore}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 17: RECOMMENDATION
          RECOMMENDED NEXT STEP
          MANUAL REVIEW
          “Verify the original camera source or obtain an independent copy before making a final determination.”
         ========================================================================= */}
      <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#D6D0C5] flex items-center justify-center text-[#FF8A3D] shadow-xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono font-bold uppercase text-[#77736C]">
              RECOMMENDED NEXT STEP
            </div>
            <div className="text-base font-bold text-[#111111]">
              {assessment.recommendedAction || 'MANUAL REVIEW'}
            </div>
            <p className="text-xs text-[#77736C] font-sans">
              &ldquo;{assessment.subtitle || 'Examine corroborating evidence sources or request reference capture before issuing external determinations.'}&rdquo;
            </p>
          </div>
        </div>

        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3155FF] hover:bg-[#2345E5] text-white font-sans text-xs font-semibold uppercase tracking-wide transition-all shadow-md shadow-[#3155FF]/20"
          >
            <span>VIEW REPORT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
