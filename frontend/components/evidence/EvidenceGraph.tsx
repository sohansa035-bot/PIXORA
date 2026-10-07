'use client';

import React, { useState } from 'react';
import { ForensicCase, EvidenceRelationship } from '@/types/forensics';
import {
  ShieldAlert,
  FileCode,
  Layers,
  Sparkles,
  Eye,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';

interface EvidenceGraphProps {
  currentCase: ForensicCase;
  activePanel: 'pixel' | 'metadata' | 'provenance' | 'synthetic';
  onSelectPanel: (panel: 'pixel' | 'metadata' | 'provenance' | 'synthetic') => void;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({
  currentCase,
  activePanel,
  onSelectPanel,
}) => {
  const [selectedRel, setSelectedRel] = useState<EvidenceRelationship | null>(
    currentCase.relationships[0] || null
  );

  const getRelationshipColor = (type: EvidenceRelationship['type']) => {
    switch (type) {
      case 'supports':
        return '#00f59b';
      case 'conflicts':
        return '#ef4444';
      case 'consistent_with':
        return '#00f59b';
      case 'not_established':
        return '#8e919b';
      default:
        return '#8e919b';
    }
  };

  return (
    <div className="rounded-lg bg-[#0b0c11] border border-[#232736] p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#1b1f2c] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f59b] animate-pulse" />
          <span className="font-bold tracking-wider text-[#f4f4f6]">
            EVIDENCE RELATIONSHIP TOPOLOGY
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#8e919b]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00f59b]" />
            <span>CORROBORATION</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span>CRITICAL CONFLICT</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8e919b]" />
            <span>UNESTABLISHED</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Topological Node Network */}
      <div className="relative w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center select-none">
        {/* SVG Relationship Vectors Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker
              id="arrow-green"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00f59b" />
            </marker>
            <marker
              id="arrow-red"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Center to Top (Image <--> Provenance) */}
          <line
            x1="50%"
            y1="50%"
            x2="50%"
            y2="18%"
            stroke={currentCase.provenance.status === 'VERIFIED' ? '#00f59b' : '#ef4444'}
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-pulse"
          />

          {/* Center to Bottom (Image <--> Synthetic) */}
          <line
            x1="50%"
            y1="50%"
            x2="50%"
            y2="82%"
            stroke="#00f59b"
            strokeWidth="2"
          />

          {/* Center to Left (Image <--> Metadata) */}
          <line
            x1="50%"
            y1="50%"
            x2="18%"
            y2="50%"
            stroke="#f59e0b"
            strokeWidth="2"
          />

          {/* Center to Right (Image <--> Pixel) */}
          <line
            x1="50%"
            y1="50%"
            x2="82%"
            y2="50%"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Cross Vector: Pixel <---> Provenance (Conflict line) */}
          <path
            d="M 80% 50% Q 65% 25% 50% 18%"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            className="animate-pulse"
          />
        </svg>

        {/* TOP NODE: Provenance */}
        <div className="z-10 mb-8 sm:mb-12">
          <button
            onClick={() => onSelectPanel('provenance')}
            className={`px-4 py-3 rounded-lg border font-mono text-xs transition-all flex items-center gap-3 shadow-lg ${
              activePanel === 'provenance'
                ? 'bg-[#151c24] border-[#00f59b] text-[#f4f4f6] ring-2 ring-[#00f59b]/30'
                : 'bg-[#0f1118] border-[#222736] text-[#8e919b] hover:border-[#333a4c]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#00f59b]" />
            <div className="text-left">
              <div className="text-[10px] text-[#8e919b]">PROVENANCE (C2PA)</div>
              <div className="font-bold text-[#f4f4f6]">
                {currentCase.provenance.status}
              </div>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                currentCase.provenance.status === 'VERIFIED'
                  ? 'bg-[#00f59b]/20 text-[#00f59b]'
                  : 'bg-[#ef4444]/20 text-[#ef4444]'
              }`}
            >
              {currentCase.provenance.status === 'VERIFIED' ? 'SIGNED' : 'MISSING'}
            </span>
          </button>
        </div>

        {/* MIDDLE ROW: Left (Metadata) --- Center (Image) --- Right (Pixel Forensics) */}
        <div className="z-10 w-full flex items-center justify-between gap-4 my-2">
          {/* LEFT NODE: Metadata */}
          <button
            onClick={() => onSelectPanel('metadata')}
            className={`px-4 py-3 rounded-lg border font-mono text-xs transition-all flex items-center gap-3 shadow-lg ${
              activePanel === 'metadata'
                ? 'bg-[#171a24] border-[#f59e0b] text-[#f4f4f6] ring-2 ring-[#f59e0b]/30'
                : 'bg-[#0f1118] border-[#222736] text-[#8e919b] hover:border-[#333a4c]'
            }`}
          >
            <FileCode className="w-4 h-4 text-[#f59e0b]" />
            <div className="text-left">
              <div className="text-[10px] text-[#8e919b]">METADATA / EXIF</div>
              <div className="font-bold text-[#f4f4f6]">
                {currentCase.metadata.software ? 'TAG DETECTED' : 'CLEAN'}
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#f59e0b]/20 text-[#f59e0b]">
              WARN
            </span>
          </button>

          {/* CENTER NODE: Image Core Raster */}
          <div className="p-3.5 rounded-lg bg-[#141620] border-2 border-[#00f59b] shadow-[0_0_25px_rgba(0,245,155,0.2)] text-center font-mono">
            <div className="w-10 h-10 mx-auto rounded overflow-hidden mb-1.5 border border-[#2b3040]">
              <img
                src={currentCase.imageUrl}
                alt="Center Artifact"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-[11px] font-bold text-[#f4f4f6]">CENTRAL RASTER</div>
            <div className="text-[9px] text-[#00f59b]">{currentCase.caseId}</div>
          </div>

          {/* RIGHT NODE: Pixel Forensics */}
          <button
            onClick={() => onSelectPanel('pixel')}
            className={`px-4 py-3 rounded-lg border font-mono text-xs transition-all flex items-center gap-3 shadow-lg ${
              activePanel === 'pixel'
                ? 'bg-[#1e1518] border-[#ef4444] text-[#f4f4f6] ring-2 ring-[#ef4444]/30'
                : 'bg-[#0f1118] border-[#222736] text-[#8e919b] hover:border-[#333a4c]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#ef4444]" />
            <div className="text-left">
              <div className="text-[10px] text-[#8e919b]">PIXEL FORENSICS</div>
              <div className="font-bold text-[#ef4444]">
                ANOMALY: {Math.round(currentCase.pixelForensics.confidence * 100)}%
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#ef4444]/20 text-[#ef4444]">
              FLAGGED
            </span>
          </button>
        </div>

        {/* BOTTOM NODE: Synthetic Media */}
        <div className="z-10 mt-8 sm:mt-12">
          <button
            onClick={() => onSelectPanel('synthetic')}
            className={`px-4 py-3 rounded-lg border font-mono text-xs transition-all flex items-center gap-3 shadow-lg ${
              activePanel === 'synthetic'
                ? 'bg-[#151c24] border-[#00f59b] text-[#f4f4f6] ring-2 ring-[#00f59b]/30'
                : 'bg-[#0f1118] border-[#222736] text-[#8e919b] hover:border-[#333a4c]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#00f59b]" />
            <div className="text-left">
              <div className="text-[10px] text-[#8e919b]">SYNTHETIC SPECTRA</div>
              <div className="font-bold text-[#f4f4f6]">
                {currentCase.synthetic.status}
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#00f59b]/20 text-[#00f59b]">
              CONSISTENT
            </span>
          </button>
        </div>
      </div>

      {/* Relationship Vectors Selector & Explainer */}
      <div className="mt-6 pt-4 border-t border-[#1c202d] font-mono text-xs">
        <div className="text-[11px] text-[#8e919b] uppercase mb-3">
          DETECTED EVIDENTIARY RELATIONSHIPS ({currentCase.relationships.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {currentCase.relationships.map((rel, idx) => {
            const isSelected = selectedRel?.label === rel.label;
            const isConflict = rel.type === 'conflicts';
            return (
              <button
                key={idx}
                onClick={() => setSelectedRel(rel)}
                className={`p-2.5 rounded border text-left transition-all ${
                  isSelected
                    ? isConflict
                      ? 'bg-[#201316] border-[#ef4444] text-[#f4f4f6]'
                      : 'bg-[#12191f] border-[#00f59b] text-[#f4f4f6]'
                    : 'bg-[#0e1017] border-[#1d202d] text-[#8e919b] hover:border-[#2f3547]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-bold text-[10px] uppercase ${
                      isConflict ? 'text-[#ef4444]' : 'text-[#00f59b]'
                    }`}
                  >
                    {rel.type.replace('_', ' ')}
                  </span>
                  {isConflict && <AlertTriangle className="w-3 h-3 text-[#ef4444]" />}
                </div>
                <div className="text-[11px] text-[#f4f4f6] font-semibold truncate">
                  {rel.label}
                </div>
                <div className="text-[9px] text-[#8e919b] truncate">
                  {rel.from} → {rel.to}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Relationship Deep Dive Card */}
        {selectedRel && (
          <div
            className={`mt-3 p-3.5 rounded border text-xs font-mono ${
              selectedRel.type === 'conflicts'
                ? 'bg-[#1c0f13] border-[#ef4444]/60 text-[#f4f4f6]'
                : 'bg-[#0f1418] border-[#00f59b]/40 text-[#f4f4f6]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold flex items-center gap-1.5">
                {selectedRel.type === 'conflicts' ? (
                  <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#00f59b]" />
                )}
                <span>
                  {selectedRel.from} ⟷ {selectedRel.to}: {selectedRel.label}
                </span>
              </span>
              <span className="text-[10px] text-[#8e919b] uppercase">
                RELATIONSHIP VECTOR
              </span>
            </div>
            <p className="text-[#d1d3db] font-sans text-xs leading-relaxed">
              {selectedRel.conflictReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
