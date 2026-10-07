'use client';

import React from 'react';
import { PixelForensicsData, SuspiciousRegion } from '@/types/forensics';
import { Layers, Crosshair, AlertTriangle, Info } from 'lucide-react';

interface PixelForensicsPanelProps {
  data: PixelForensicsData;
  selectedRegion: SuspiciousRegion | null;
  onSelectRegion: (region: SuspiciousRegion | null) => void;
}

export const PixelForensicsPanel: React.FC<PixelForensicsPanelProps> = ({
  data,
  selectedRegion,
  onSelectRegion,
}) => {
  return (
    <div className="rounded-2xl bg-white border border-[#D6D0C5] p-5 font-mono text-xs shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D6D0C5]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#3155FF]" />
          <span className="font-bold tracking-wider text-[#111111]">
            PIXEL FORENSICS
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEECEC] text-[#F04444] border border-[#F04444]/40">
          ANOMALY DETECTED
        </span>
      </div>

      {/* Primary Status & Technique */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">STATUS</div>
          <div className="text-sm font-bold text-[#F04444]">LOCALIZED ANOMALY</div>
          <div className="text-[10px] text-[#77736C] mt-0.5">Spatial Gradient Spike</div>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">TECHNIQUE</div>
          <div className="text-sm font-bold text-[#3155FF]">SPLICING</div>
          <div className="text-[10px] text-[#77736C] mt-0.5">Composite Insertion</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[9px] text-[#77736C] uppercase">CONFIDENCE</div>
          <div className="text-lg font-bold text-[#3155FF]">0.84</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[9px] text-[#77736C] uppercase">REGION</div>
          <div className="text-sm font-bold text-[#111111] truncate">742 × 381</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[9px] text-[#77736C] uppercase">LIMITATION</div>
          <div className="text-xs font-bold text-[#FF8A3D] truncate">Compression</div>
        </div>
      </div>

      {/* Evidentiary Admonition */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] text-[11px] space-y-1">
        <div className="text-[#3155FF] font-bold flex items-center gap-1.5 text-[10px] uppercase">
          <Info className="w-3.5 h-3.5" />
          <span>EVIDENTIARY PRINCIPLE</span>
        </div>
        <p className="text-[#77736C] font-sans leading-relaxed">
          &ldquo;Localized pixel inconsistencies are consistent with manipulation, but this signal
          alone does not establish malicious editing.&rdquo;
        </p>
      </div>

      {/* Localized Anomaly Regions Selector */}
      <div className="space-y-2">
        <div className="text-[10px] text-[#77736C] uppercase flex items-center justify-between">
          <span>SUSPICIOUS REGIONS ({data.regions.length})</span>
          <span>CLICK TO FOCUS</span>
        </div>
        {data.regions.map((region) => {
          const isSelected = selectedRegion?.id === region.id;
          return (
            <button
              key={region.id}
              onClick={() => onSelectRegion(isSelected ? null : region)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-white border-[#3155FF] ring-2 ring-[#3155FF]/20 text-[#111111] shadow-md shadow-[#3155FF]/10'
                  : 'bg-[#FAF8F5] border-[#D6D0C5] text-[#77736C] hover:border-[#111111] hover:text-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-[#F04444] flex items-center gap-1">
                  <Crosshair className="w-3 h-3" />
                  <span>{region.id}: {region.label}</span>
                </span>
                <span className="text-[10px] font-bold text-[#3155FF]">
                  Conf: {region.confidence}
                </span>
              </div>
              <div className="text-[10px] text-[#77736C] truncate">
                Coord: X {region.coordinates.x}% Y {region.coordinates.y}% • {region.technique}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
