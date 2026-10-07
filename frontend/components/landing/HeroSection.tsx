'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ForensicCase } from '@/types/forensics';
import {
  Shield,
  ArrowRight,
  Crosshair,
  Maximize2,
  Cpu,
  Layers,
  Terminal,
  FileCheck,
  Search,
  AlertTriangle,
} from 'lucide-react';

interface HeroSectionProps {
  currentCase: ForensicCase;
  onStartInvestigation: () => void;
  onOpenWorkstation: () => void;
  onSelectCase: (caseId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentCase,
  onStartInvestigation,
  onOpenWorkstation,
  onSelectCase,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 420, y: 180, relX: 52, relY: 24 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeInspectMode, setActiveInspectMode] = useState<'scan' | 'ela' | 'laplacian'>('scan');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const relX = Math.round((x / rect.width) * 100);
    const relY = Math.round((y / rect.height) * 100);
    setCursorPos({ x: Math.round(x), y: Math.round(y), relX, relY });
  };

  return (
    <section className="relative pt-28 pb-20 overflow-hidden border-b border-[#1a1d24]">
      {/* Background Subtle Forensic Grid */}
      <div className="absolute inset-0 forensic-grid pointer-events-none opacity-40" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#00f59b]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Top Eyebrow */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00f59b] animate-ping" />
            <span className="text-xs font-mono tracking-widest text-[#00f59b] uppercase">
              EVIDENCE-AWARE DIGITAL IMAGE FORENSICS
            </span>
            <span className="text-xs font-mono text-[#585b65]">•</span>
            <span className="text-xs font-mono text-[#8e919b]">
              EVIDENCE-AWARE INVESTIGATION
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-[#8e919b]">
            <span>SYSTEM STATUS: CALIBRATED</span>
            <span>C2PA SPEC 2.1: MOUNTED</span>
            <span>PIXEL DISCONTINUITY MATRIX: ACTIVE</span>
          </div>
        </div>

        {/* Hero Grid: Editorial Header + Cinematic Image Workstation Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Editorial Headline & Messaging */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-sans font-light tracking-tight text-[#f4f4f6] leading-[1.05] mb-6">
              Every image <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#00f59b] to-[#a3f7d4]">
                leaves evidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#8e919b] leading-relaxed mb-8 max-w-xl font-normal">
              Investigate manipulation, provenance, metadata, and visual anomalies through
              evidence-aware multi-source analysis. We don&apos;t just detect—we determine
              whether the evidence is sufficient to conclude.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={onStartInvestigation}
                className="group flex items-center gap-3 px-6 py-3.5 rounded bg-[#00f59b] hover:bg-[#10ffaa] text-[#080808] font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(0,245,155,0.25)] hover:shadow-[0_0_35px_rgba(0,245,155,0.4)]"
              >
                <span>START INVESTIGATION</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenWorkstation}
                className="flex items-center gap-2 px-6 py-3.5 rounded bg-[#0f1117] hover:bg-[#161822] border border-[#242836] hover:border-[#383e52] text-xs font-mono text-[#d1d3db] transition-all"
              >
                <span>OPEN WORKSPACE</span>
              </button>
            </div>

            {/* Core Philosophy Stat Strip */}
            <div className="pt-6 border-t border-[#1d202b] grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#8e919b] mb-1">
                  OBSERVATION
                </div>
                <div className="text-sm font-mono text-[#f4f4f6] font-semibold">
                  Multi-Channel
                </div>
                <p className="text-[11px] text-[#585b65]">Spatial & Spectral</p>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-[#8e919b] mb-1">
                  PROVENANCE
                </div>
                <div className="text-sm font-mono text-[#00f59b] font-semibold">
                  Cryptographic
                </div>
                <p className="text-[11px] text-[#585b65]">Hardware Enclave</p>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-[#8e919b] mb-1">
                  CONCLUSION
                </div>
                <div className="text-sm font-mono text-[#f59e0b] font-semibold">
                  Evidence-Gated
                </div>
                <p className="text-[11px] text-[#585b65]">Zero False Certainty</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Live Forensic Overlay */}
          <div className="lg:col-span-7">
            <div className="relative rounded-lg border border-[#222633] bg-[#0c0d12] p-2.5 shadow-2xl overflow-hidden group">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#1b1e28] bg-[#090a0e] text-xs font-mono mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00f59b]/80" />
                  <span className="ml-2 text-[#8e919b] text-[11px]">
                    FORENSIC RASTER VIEWER // {currentCase.caseId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-[#8e919b]">FILTER:</span>
                  {(['scan', 'ela', 'laplacian'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setActiveInspectMode(mode)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono transition-colors ${
                        activeInspectMode === mode
                          ? 'bg-[#00f59b]/20 text-[#00f59b] border border-[#00f59b]/40'
                          : 'text-[#8e919b] hover:text-[#f4f4f6]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                  <button
                    onClick={onOpenWorkstation}
                    className="text-[#00f59b] hover:underline flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Main Interactive Image Frame */}
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onOpenWorkstation}
                className="relative aspect-video rounded overflow-hidden cursor-crosshair select-none bg-black"
              >
                {/* Image */}
                <img
                  src={currentCase.imageUrl}
                  alt={currentCase.title}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    activeInspectMode === 'ela'
                      ? 'contrast-200 saturate-150 brightness-90 filter hue-rotate-30'
                      : activeInspectMode === 'laplacian'
                      ? 'filter invert contrast-250 grayscale'
                      : ''
                  }`}
                />

                {/* Analytical Overlays */}
                <div className="absolute inset-0 forensic-dot-grid opacity-30 pointer-events-none" />

                {/* Animated Horizontal Scanline */}
                {activeInspectMode === 'scan' && (
                  <div className="animate-scanline pointer-events-none" />
                )}

                {/* Center Crosshair and Reticle */}
                <div className="absolute inset-0 pointer-events-none border border-white/5">
                  {/* Quadrant Markers */}
                  <div className="absolute top-4 left-4 font-mono text-[9px] text-[#00f59b] bg-black/60 px-1.5 py-0.5 rounded border border-[#00f59b]/30">
                    Q1 // SENSOR ATTRIBUTION: LEICA M11-P
                  </div>
                  <div className="absolute top-4 right-4 font-mono text-[9px] text-[#f59e0b] bg-black/60 px-1.5 py-0.5 rounded border border-[#f59e0b]/30">
                    ANOMALY RISK: 84% LOCALIZED
                  </div>
                  <div className="absolute bottom-4 left-4 font-mono text-[9px] text-[#8e919b] bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                    DIM: {currentCase.metadata.dimensions}
                  </div>
                  <div className="absolute bottom-4 right-4 font-mono text-[9px] text-[#00f59b] bg-black/60 px-1.5 py-0.5 rounded border border-[#00f59b]/30">
                    C2PA: VALID HARDWARE SIGNATURE
                  </div>
                </div>

                {/* Suspicious Bounding Box in drone area */}
                <div
                  className="absolute border-2 border-[#ef4444] rounded-sm pointer-events-none transition-all duration-300"
                  style={{
                    left: `${currentCase.pixelForensics.regions[0]?.coordinates.x || 50}%`,
                    top: `${currentCase.pixelForensics.regions[0]?.coordinates.y || 22}%`,
                    width: `${currentCase.pixelForensics.regions[0]?.coordinates.width || 18}%`,
                    height: `${currentCase.pixelForensics.regions[0]?.coordinates.height || 12}%`,
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <div className="absolute -top-6 left-0 flex items-center gap-1 bg-[#ef4444] text-black font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-t">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>REGION #01: SPLICED INSERTION</span>
                  </div>
                  <div className="absolute -bottom-5 right-0 bg-black/80 text-[#ef4444] font-mono text-[8px] px-1 py-0.5 rounded border border-[#ef4444]/40">
                    CONFIDENCE: 84%
                  </div>
                </div>

                {/* Cursor Tracking Reticle and Loupe */}
                {isHovered && (
                  <div
                    className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                    style={{ left: cursorPos.x, top: cursorPos.y }}
                  >
                    <div className="w-16 h-16 rounded-full border border-[#00f59b]/80 bg-[#00f59b]/5 backdrop-blur-[1px] relative flex items-center justify-center">
                      <Crosshair className="w-4 h-4 text-[#00f59b] opacity-80" />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 px-1.5 py-0.5 rounded border border-[#00f59b]/40 font-mono text-[8px] text-[#00f59b]">
                        X:{cursorPos.relX}% Y:{cursorPos.relY}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Telemetry Bar */}
              <div className="mt-2.5 px-3 py-2 bg-[#08090d] rounded border border-[#1b1e27] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-4">
                  <span className="text-[#8e919b]">
                    HASH:{' '}
                    <span className="text-[#f4f4f6]">
                      {currentCase.sha256Hash.substring(0, 16)}...
                    </span>
                  </span>
                  <span className="text-[#8e919b] hidden sm:inline">
                    METHOD:{' '}
                    <span className="text-[#00f59b]">
                      {currentCase.pixelForensics.technique}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#8e919b]">
                    SUFFICIENCY:{' '}
                    <span className="text-[#f59e0b] font-semibold">
                      {currentCase.evaluation.sufficiency}
                    </span>
                  </span>
                  <button
                    onClick={onOpenWorkstation}
                    className="text-[#00f59b] hover:text-[#10ffaa] flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>LAUNCH WORKSPACE</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Case Switcher Pill Row */}
            <div className="mt-3 flex items-center justify-between px-2 text-xs font-mono text-[#8e919b]">
              <span className="text-[11px]">INVESTIGATIVE PRESETS:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectCase('PX-2026-00142')}
                  className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                    currentCase.id === 'PX-2026-00142'
                      ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10'
                      : 'border-[#222530] text-[#8e919b] hover:border-[#383e52]'
                  }`}
                >
                  CASE 01: SPLICED DRONE (CONFLICT)
                </button>
                <button
                  onClick={() => onSelectCase('PX-2026-00143')}
                  className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                    currentCase.id === 'PX-2026-00143'
                      ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10'
                      : 'border-[#222530] text-[#8e919b] hover:border-[#383e52]'
                  }`}
                >
                  CASE 02: SYNTHETIC LAB (INPAINT)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
