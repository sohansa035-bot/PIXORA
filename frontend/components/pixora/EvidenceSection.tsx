'use client';

import React, { useState } from 'react';
import { ForensicCase } from '@/types/forensics';
import { PixelForensicsPanel } from './PixelForensicsPanel';
import { MetadataInspector } from './MetadataInspector';
import { ProvenanceChain } from './ProvenanceChain';
import { SyntheticPanel } from './SyntheticPanel';
import {
  Layers,
  FileCode,
  KeyRound,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Network,
} from 'lucide-react';

interface EvidenceSectionProps {
  currentCase: ForensicCase;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({ currentCase }) => {
  // Expanded detail drawer for the 4 sources (Section 12)
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  // Toggle for conflict details (Section 13)
  const [showConflictDetails, setShowConflictDetails] = useState<boolean>(false);

  // Toggle for relationships diagram (Section 14)
  const [showRelationships, setShowRelationships] = useState<boolean>(false);

  // Toggle for availability explanation (Section 15)
  const [showAvailabilityExplanation, setShowAvailabilityExplanation] = useState<boolean>(false);

  // Derive the 4 evidence sources dynamically from currentCase (RULE 3, 4, 5, 6, 7)
  const isPixelAnomaly = currentCase.pixelForensics.status === 'localized_anomaly';
  const isPixelClean = currentCase.pixelForensics.status === 'clean';
  const isExifPresent = currentCase.metadata.exifIntact;
  const conflictsList = currentCase.relationships.filter((r) => r.type === 'conflicts');
  const consistentList = currentCase.relationships.filter((r) => r.type === 'consistent_with');
  const supportsList = currentCase.relationships.filter((r) => r.type === 'supports');

  const sources = [
    {
      id: 'pixel',
      title: 'PIXELS',
      finding: currentCase.pixelForensics.statusLabel,
      status: isPixelAnomaly ? 'OBSERVED' : isPixelClean ? 'NOT APPLICABLE' : 'UNIFORM',
      statusColor: isPixelAnomaly 
        ? 'bg-[#FF8A3D]/20 text-[#9C4E00] border-[#FF8A3D]/40'
        : 'bg-[#FAF8F5] text-[#77736C] border-[#D6D0C5]',
      icon: Layers,
      iconColor: 'text-[#3155FF]',
    },
    {
      id: 'metadata',
      title: 'METADATA',
      finding: isExifPresent 
        ? (currentCase.metadata.software ? `Software tag: ${currentCase.metadata.software}` : 'EXIF container present')
        : 'EXIF Absent — No metadata container (contextual; does not imply manipulation)',
      status: isExifPresent ? 'VERIFIED' : 'ABSENT',
      statusColor: isExifPresent
        ? 'bg-[#B7E43A]/25 text-[#2B4E08] border-[#B7E43A]'
        : 'bg-[#FAF8F5] text-[#77736C] border-[#D6D0C5]',
      icon: FileCode,
      iconColor: 'text-[#FF8A3D]',
    },
    {
      id: 'provenance',
      title: 'PROVENANCE',
      finding: currentCase.provenance.credentialStatus || 'C2PA verification unavailable / Not checked in this release',
      status: 'UNAVAILABLE',
      statusColor: 'bg-[#FAF8F5] text-[#77736C] border-[#D6D0C5]',
      icon: KeyRound,
      iconColor: 'text-[#77736C]',
    },
    {
      id: 'synthetic',
      title: 'SYNTHETIC ANALYSIS',
      finding: currentCase.synthetic.detail || 'Context / Claim verification evaluation',
      status: currentCase.synthetic.status === 'NO_SYNTHETIC_MARKERS' ? 'NOT CONFIGURED' : 'FLAGGED',
      statusColor: 'bg-[#FAF8F5] text-[#77736C] border-[#D6D0C5]',
      icon: Sparkles,
      iconColor: 'text-[#3155FF]',
    },
  ];

  const handleToggleRow = (id: string) => {
    setExpandedSource(expandedSource === id ? null : id);
  };

  const evidenceStatusText = 
    currentCase.assessment.eligibility === 'CONFLICTING' ? 'CONFLICTING' :
    currentCase.assessment.eligibility === 'ABSTAIN' ? 'INSUFFICIENT' :
    currentCase.assessment.outcome === 'SUPPORTED_MANIPULATION' || currentCase.assessment.outcome === 'SUPPORTED MANIPULATION' ? 'CORROBORATED' :
    currentCase.assessment.outcome === 'LIKELY_MANIPULATED' || currentCase.assessment.outcome === 'LIKELY MANIPULATED' ? 'INDICATED' :
    'EVALUATED';

  const evidenceStatusBadgeColor = 
    evidenceStatusText === 'CONFLICTING' ? 'text-[#F04444] bg-[#FFF8F8] border-[#F04444]/30' :
    evidenceStatusText === 'INSUFFICIENT' ? 'text-[#9C4E00] bg-[#FFF9F5] border-[#FF8A3D]/30' :
    'text-[#2B4E08] bg-[#F5FAF0] border-[#B7E43A]';

  return (
    <div id="evidence" className="rounded-2xl bg-white border border-[#D6D0C5] p-6 sm:p-8 shadow-xs space-y-8 font-sans">
      {/* =========================================================================
          SECTION 12: HEADER & SIMPLE SUMMARY
         ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D6D0C5]">
        <div>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#111111] tracking-tight">
            Evidence
          </h2>
          <p className="text-sm text-[#77736C] mt-1 font-sans">
            Signals found during the investigation.
          </p>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${evidenceStatusBadgeColor}`}>
          <span className="text-[#77736C] font-mono text-[11px] uppercase">EVIDENCE STATUS:</span>
          <span className="font-bold font-mono text-[11px] tracking-wide">
            {evidenceStatusText}
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 12: ONLY FOUR EVIDENCE SOURCES (SIMPLE HORIZONTAL ROWS)
          PIXELS | METADATA | PROVENANCE | SYNTHETIC ANALYSIS
          Each row: icon, source, one-line finding, status
         ========================================================================= */}
      <div className="space-y-2.5">
        {sources.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedSource === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#D6D0C5] bg-white overflow-hidden transition-all shadow-xs"
            >
              {/* Simple Horizontal Row */}
              <button
                onClick={() => handleToggleRow(item.id)}
                className={`w-full p-4 flex items-center justify-between gap-4 text-left transition-colors ${
                  isExpanded ? 'bg-[#FAF8F5]' : 'hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#D6D0C5] flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-[#111111] font-mono">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#77736C] truncate mt-0.5 font-sans">
                      {item.finding}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${item.statusColor}`}>
                    {item.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#77736C]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#77736C]" />
                  )}
                </div>
              </button>

              {/* Expandable Details on Click (Section 12 & 20) */}
              {isExpanded && (
                <div className="p-5 border-t border-[#D6D0C5] bg-[#FAF8F5] animate-in fade-in duration-100">
                  {item.id === 'pixel' && (
                    <PixelForensicsPanel
                      data={currentCase.pixelForensics}
                      selectedRegion={currentCase.pixelForensics.regions[0] || null}
                      onSelectRegion={() => {}}
                    />
                  )}
                  {item.id === 'metadata' && (
                    <MetadataInspector data={currentCase.metadata} />
                  )}
                  {item.id === 'provenance' && (
                    <ProvenanceChain data={currentCase.provenance} />
                  )}
                  {item.id === 'synthetic' && (
                    <SyntheticPanel data={currentCase.synthetic} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          SECTION 13: SUBTLE CONFLICT HANDLING OR SUFFICIENCY STATUS (DYNAMIC)
         ========================================================================= */}
      {conflictsList.length > 0 ? (
        <div className="p-5 rounded-xl bg-[#FFF9F5] border border-[#FF8A3D]/30 space-y-3">
          <div className="flex items-center gap-2 text-[#9C4E00]">
            <AlertCircle className="w-4 h-4 text-[#FF8A3D]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wide">
              EVIDENCE CONFLICT DETECTED
            </span>
          </div>

          <p className="text-xs text-[#77736C] font-sans">
            Independent forensic signals materially contradict each other. Manual human review is required.
          </p>

          <div className="space-y-2 pt-1 text-xs">
            {conflictsList.map((c, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-[#D6D0C5] space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-[#F04444]">
                  CONFLICT [{c.from} ⇄ {c.to}]
                </span>
                <div className="text-xs text-[#111111]">{c.conflictReason}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-[#77736C]">
            <strong className="text-[#111111] font-semibold">Therefore: </strong>
            The system cannot safely issue an automated conclusion without examiner intervention.
          </div>
        </div>
      ) : currentCase.assessment.eligibility === 'ABSTAIN' ? (
        <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-2">
          <div className="flex items-center gap-2 text-[#77736C]">
            <HelpCircle className="w-4 h-4 text-[#3155FF]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wide text-[#111111]">
              EVIDENTIARY ABSTENTION
            </span>
          </div>
          <p className="text-xs text-[#77736C] font-sans leading-relaxed">
            {currentCase.assessment.subtitle || 'Evidence is insufficient to reach a conclusive determination. In accordance with forensic protocol, PIXORA abstains rather than speculating.'}
          </p>
        </div>
      ) : null}

      {/* =========================================================================
          SECTION 14: EVIDENCE RELATIONSHIPS (DYNAMIC)
         ========================================================================= */}
      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono font-bold uppercase text-[#77736C]">
              HOW THE EVIDENCE RELATES
            </div>
            <div className="text-xs sm:text-sm font-sans text-[#111111]">
              {currentCase.relationships.length > 0
                ? `${supportsList.length} supporting · ${conflictsList.length} conflicting · ${consistentList.length} consistent`
                : 'No cross-signal relationship pairs established (isolated signals)'}
            </div>
          </div>

          {currentCase.relationships.length > 0 && (
            <button
              onClick={() => setShowRelationships(!showRelationships)}
              className="text-xs font-sans font-semibold text-[#3155FF] hover:underline flex items-center gap-1"
            >
              <Network className="w-3.5 h-3.5" />
              <span>{showRelationships ? 'Hide relationships' : 'VIEW RELATIONSHIPS →'}</span>
            </button>
          )}
        </div>

        {/* Dynamic Relationships Detail Drawer */}
        {showRelationships && currentCase.relationships.length > 0 && (
          <div className="mt-3 space-y-2 pt-3 border-t border-[#D6D0C5] animate-in fade-in duration-100 font-mono text-xs">
            {currentCase.relationships.map((rel, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-[#D6D0C5] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3155FF]">{rel.label}</span>
                  <span className="text-[10px] text-[#77736C] uppercase">{rel.type}</span>
                </div>
                <p className="text-xs text-[#77736C] font-sans">{rel.conflictReason}</p>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* =========================================================================
          SECTION 15: EVIDENCE COMPLETENESS / AVAILABILITY
          "EVIDENCE AVAILABILITY — Some information is missing."
          Available: Metadata · Provenance · Image pixels
          Missing: Original RAW file · Independent source
          WHY THIS MATTERS ->
         ========================================================================= */}
      <div className="p-5 rounded-xl bg-white border border-[#D6D0C5] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono font-bold uppercase text-[#77736C]">
              EVIDENCE AVAILABILITY
            </div>
            <div className="text-xs sm:text-sm font-sans text-[#111111]">
              Some information is missing.
            </div>
          </div>

          <button
            onClick={() => setShowAvailabilityExplanation(!showAvailabilityExplanation)}
            className="text-xs font-sans font-semibold text-[#3155FF] hover:underline flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showAvailabilityExplanation ? 'Hide explanation' : 'WHY THIS MATTERS →'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans pt-1">
          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#D6D0C5]">
            <span className="text-[11px] font-mono font-semibold text-[#2B4E08] uppercase block mb-1">
              Available signals:
            </span>
            <span className="text-[#111111]">
              {currentCase.completeness.items.filter((i) => i.status === 'AVAILABLE').map((i) => i.name).join(' · ') || 'Container raster bytes'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#D6D0C5]">
            <span className="text-[11px] font-mono font-semibold text-[#FF8A3D] uppercase block mb-1">
              Missing evidence:
            </span>
            <span className="text-[#77736C]">
              {(currentCase.assessment.missingEvidence && currentCase.assessment.missingEvidence.length > 0
                ? currentCase.assessment.missingEvidence.join(' · ')
                : currentCase.completeness.items.filter((i) => i.status === 'MISSING').map((i) => i.name).join(' · ')) || 'None logged'}
            </span>
          </div>
        </div>

        {showAvailabilityExplanation && (
          <div className="mt-2 p-3 bg-[#FAF8F5] rounded-lg border border-[#D6D0C5] text-xs text-[#77736C] leading-relaxed animate-in fade-in duration-100">
            {currentCase.assessment.limitations && currentCase.assessment.limitations.length > 0
              ? currentCase.assessment.limitations.join(' ')
              : 'Missing evidence limits the scope of forensic conclusions. PIXORA applies sufficiency threshold gates to avoid ungrounded determinations.'}
          </div>
        )}
      </div>
    </div>
  );
};
