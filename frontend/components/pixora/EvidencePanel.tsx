'use client';

import React, { useState } from 'react';
import { ForensicCase, SuspiciousRegion } from '@/types/forensics';
import { ForensicImageViewer } from './ForensicImageViewer';
import { FilterShaderMode } from './HeatmapOverlay';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

interface EvidencePanelProps {
  currentCase: ForensicCase;
  onViewEvidence?: () => void;
  onOpenSwitchCase?: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  currentCase,
  onViewEvidence,
  onOpenSwitchCase,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<SuspiciousRegion | null>(
    currentCase.pixelForensics.regions[0] || null
  );
  const [viewerMode, setViewerMode] = useState<FilterShaderMode>('HEATMAP');

  // Finding details drawer / expanded panel state (Section 11)
  const [showFindingDrawer, setShowFindingDrawer] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Case Bar technical details toggle (Section 6)
  const [showCaseTechDetails, setShowCaseTechDetails] = useState<boolean>(false);

  const handleOpenEvidence = () => {
    if (onViewEvidence) {
      onViewEvidence();
    } else {
      const el = document.getElementById('evidence');
      if (el) {
        const yOffset = -70;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <div id="image" className="space-y-6">
      {/* =========================================================================
          SECTION 6: COMPACT, CLEAN CASE BAR
          "CASE PX-2026-00142 | Image name | 1920 × 1080 | INCONCLUSIVE"
          Do not show long hashes or multiple status chips by default.
         ========================================================================= */}
      <div className="rounded-2xl bg-white border border-[#D6D0C5] p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 font-sans">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3155FF]" />
              <span className="font-mono text-xs font-bold text-[#111111] tracking-wide">
                CASE {currentCase.caseId}
              </span>
            </div>

            <span className="text-[#D6D0C5] hidden sm:inline">|</span>

            <span className="text-[#111111] font-medium truncate max-w-[280px]">
              {currentCase.originalFileName}
            </span>

            <span className="text-[#D6D0C5] hidden sm:inline">|</span>

            <span className="text-[#77736C] font-mono text-[11px]">
              {currentCase.metadata.dimensions}
            </span>

            <span className="text-[#D6D0C5] hidden sm:inline">|</span>

            <span className="px-2.5 py-0.5 rounded-md bg-[#FFF2E5] border border-[#FF8A3D]/40 text-[#9C4E00] font-semibold text-[11px]">
              {currentCase.assessment.outcome}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenSwitchCase && (
              <button
                onClick={onOpenSwitchCase}
                className="text-[#77736C] hover:text-[#111111] transition-colors text-xs font-sans font-medium"
              >
                Switch Case
              </button>
            )}

            <button
              onClick={() => setShowCaseTechDetails(!showCaseTechDetails)}
              className="text-[#3155FF] hover:underline transition-colors text-xs font-sans font-semibold flex items-center gap-1"
            >
              <span>{showCaseTechDetails ? 'Hide technical details' : 'Technical details'}</span>
              {showCaseTechDetails ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Case Technical Details (Section 6) */}
        {showCaseTechDetails && (
          <div className="mt-3 pt-3 border-t border-[#E7E2D8] text-[11px] font-mono text-[#77736C] grid grid-cols-1 sm:grid-cols-3 gap-2 animate-in fade-in duration-100">
            <div>
              <span className="text-[#111111] font-semibold">SHA-256: </span>
              <span className="truncate">{currentCase.sha256Hash}</span>
            </div>
            <div>
              <span className="text-[#111111] font-semibold">CONTAINER: </span>
              <span>{currentCase.fileFormat.toUpperCase()} ({Math.round(currentCase.fileSizeBytes / 1024)} KB)</span>
            </div>
            <div>
              <span className="text-[#111111] font-semibold">INGESTION TARGET: </span>
              <span>{currentCase.investigationTarget}</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 9: INVESTIGATION WORKSPACE
          LEFT / CENTER: Large image viewer
          RIGHT: Compact "Key finding" panel
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Dominant Image Viewer (8 cols) */}
        <div className="lg:col-span-8">
          <ForensicImageViewer
            currentCase={currentCase}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            viewerMode={viewerMode}
            onChangeMode={setViewerMode}
          />
        </div>

        {/* =========================================================================
            SECTION 10: KEY FINDING PANEL
        {/* =========================================================================
            SECTION 10: KEY FINDING PANEL (Dynamic to currentCase)
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white border border-[#D6D0C5] p-6 shadow-xs space-y-5">
            {/* Header */}
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#77736C] mb-1">
                KEY FINDING
              </div>
              <h3 className="font-editorial text-2xl text-[#111111] leading-tight">
                {currentCase.pixelForensics.regions.length > 0
                  ? (selectedRegion?.label || 'Localized Anomaly')
                  : currentCase.pixelForensics.statusLabel}
              </h3>
            </div>

            {/* Region / Metric & Confidence / Status */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
                <div className="text-[11px] font-mono text-[#77736C] uppercase">
                  {currentCase.pixelForensics.regions.length > 0 ? 'FOCAL REGION' : 'MEASUREMENT DOMAIN'}
                </div>
                <div className="text-sm font-bold text-[#111111] mt-0.5 font-mono truncate">
                  {currentCase.pixelForensics.regions.length > 0 ? (selectedRegion?.id || 'REGION 01') : 'GLOBAL FRAME'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
                <div className="text-[11px] font-mono text-[#77736C] uppercase">
                  {currentCase.pixelForensics.regions.length > 0 ? 'CONFIDENCE' : 'ELA MAX DIFF'}
                </div>
                <div className="text-lg font-bold text-[#3155FF] mt-0.5 font-mono">
                  {currentCase.pixelForensics.regions.length > 0
                    ? `${Math.round((selectedRegion?.confidence || 0.8) * 100)}%`
                    : currentCase.pixelForensics.elaVariance > 0
                    ? `${currentCase.pixelForensics.elaVariance}`
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Why It Matters */}
            <div className="space-y-1.5 pt-2 border-t border-[#E7E2D8]">
              <div className="text-xs font-sans font-semibold text-[#111111]">
                Methodological context:
              </div>
              <p className="text-sm font-sans text-[#77736C] leading-relaxed">
                {currentCase.pixelForensics.regions.length > 0
                  ? (selectedRegion?.observation || currentCase.pixelForensics.limitations)
                  : currentCase.pixelForensics.limitations}
              </p>
            </div>

            {/* Action Buttons: Open Finding Details or Navigate to Evidence */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowFindingDrawer(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#3155FF] hover:bg-[#2345E5] text-white font-sans text-xs font-semibold tracking-wide uppercase transition-all shadow-md shadow-[#3155FF]/20 active:scale-[0.98]"
              >
                <span>VIEW EVIDENCE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 11: FINDING DETAILS DRAWER / EXPANDABLE PANEL
          Opens when user clicks VIEW EVIDENCE.
          WHAT WE FOUND | WHY IT MATTERS | WHAT IT MAY INDICATE | LIMITATION
          SHOW TECHNICAL DETAILS ->
         ========================================================================= */}
      {showFindingDrawer && (
        <div className="rounded-2xl bg-white border border-[#3155FF] p-6 sm:p-8 shadow-lg space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-[#D6D0C5]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3155FF]" />
              <h4 className="font-editorial text-2xl text-[#111111]">
                {currentCase.pixelForensics.regions.length > 0
                  ? `Evidence Breakdown — ${selectedRegion?.label || 'Region'}`
                  : `Evidence Breakdown — ${currentCase.pixelForensics.technique}`}
              </h4>
            </div>

            <button
              onClick={() => setShowFindingDrawer(false)}
              className="p-1 rounded-lg text-[#77736C] hover:text-[#111111] hover:bg-[#FAF8F5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* The 4 Clear Explanations (Section 11) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase text-[#3155FF]">
                WHAT WE FOUND
              </div>
              <p className="text-sm text-[#111111] leading-relaxed">
                {currentCase.pixelForensics.statusLabel}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase text-[#111111]">
                EVIDENTIARY DOMAIN
              </div>
              <p className="text-sm text-[#77736C] leading-relaxed">
                {currentCase.pixelForensics.technique}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase text-[#2B4E08]">
                ASSESSMENT BASIS
              </div>
              <p className="text-sm text-[#111111] leading-relaxed">
                {currentCase.assessment.subtitle}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase text-[#FF8A3D]">
                LIMITATION
              </div>
              <p className="text-sm text-[#77736C] leading-relaxed">
                {currentCase.pixelForensics.limitations}
              </p>
            </div>
          </div>

          {/* Progressive Disclosure: Technical Details (Section 11 & 20) */}
          <div className="pt-2 border-t border-[#E7E2D8] flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#77736C] hover:text-[#111111] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#3155FF]" />
              <span>{showTechnicalDetails ? 'Hide technical details' : 'Show technical details'}</span>
            </button>

            <button
              onClick={handleOpenEvidence}
              className="flex items-center gap-1.5 text-xs font-sans font-bold text-[#3155FF] hover:underline"
            >
              <span>Scroll to full evidence section</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {showTechnicalDetails && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] text-xs font-mono text-[#77736C] space-y-2 animate-in fade-in duration-100">
              <div className="text-[11px] uppercase font-bold text-[#111111] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#3155FF]" />
                <span>TECHNICAL ALGORITHM INTERNAL METRICS</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <span className="block text-[10px] text-[#77736C]">COORDINATES</span>
                  <span className="font-semibold text-[#111111]">[x: 742, y: 381]</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#77736C]">NOISE DIVERGENCE</span>
                  <span className="font-semibold text-[#3155FF]">2.41 σ</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#77736C]">GRADIENT DELTA</span>
                  <span className="font-semibold text-[#F04444]">High-pass spike</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#77736C]">ALGORITHM</span>
                  <span className="font-semibold text-[#111111]">Laplacian ELA v2</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
