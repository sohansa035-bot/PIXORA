'use client';

import React from 'react';
import { PixelForensicsData, SuspiciousRegion } from '@/types/forensics';
import { Layers, AlertTriangle, Crosshair, Cpu, CheckCircle2 } from 'lucide-react';

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
    <div className="rounded-lg bg-[#0d0e14] border border-[#222634] p-5 font-mono text-xs shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b1e2a]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00f59b]" />
          <span className="font-bold tracking-wider text-[#f4f4f6]">
            PIXEL FORENSICS
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            data.status === 'localized_anomaly'
              ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30'
              : 'bg-[#00f59b]/15 text-[#00f59b] border border-[#00f59b]/30'
          }`}
        >
          {data.statusLabel}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded bg-[#13151f] border border-[#202431]">
          <div className="text-[10px] text-[#8e919b] uppercase">DETECTION CONFIDENCE</div>
          <div className="text-xl font-bold text-[#f4f4f6]">
            {Math.round(data.confidence * 100)}%
          </div>
          <div className="text-[10px] text-[#00f59b]">Statistical Anomaly</div>
        </div>
        <div className="p-3 rounded bg-[#13151f] border border-[#202431]">
          <div className="text-[10px] text-[#8e919b] uppercase">MODEL CERTAINTY</div>
          <div className="text-xl font-bold text-[#f4f4f6]">
            {Math.round(data.modelConfidence * 100)}%
          </div>
          <div className="text-[10px] text-[#8e919b]">Laplacian + ELA</div>
        </div>
      </div>

      {/* Technique */}
      <div className="p-3 rounded bg-[#13151f] border border-[#202431]">
        <div className="text-[10px] text-[#8e919b] uppercase mb-1">
          SUSPECTED MANIPULATION TECHNIQUE
        </div>
        <div className="text-sm font-bold text-[#00f59b]">{data.technique}</div>
      </div>

      {/* Detected Suspicious Regions List */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#8e919b] uppercase mb-2">
          <span>LOCALIZED REGIONS ({data.regions.length})</span>
          <span>SELECT TO HIGHLIGHT</span>
        </div>
        <div className="space-y-2">
          {data.regions.map((region) => {
            const isSelected = selectedRegion?.id === region.id;
            return (
              <button
                key={region.id}
                onClick={() => onSelectRegion(isSelected ? null : region)}
                className={`w-full text-left p-2.5 rounded border transition-all ${
                  isSelected
                    ? 'bg-[#181d28] border-[#ef4444] text-[#f4f4f6] shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-[#101218] border-[#1e222f] text-[#8e919b] hover:border-[#2f3547]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#ef4444] flex items-center gap-1.5">
                    <Crosshair className="w-3 h-3" />
                    <span>{region.id}</span>
                  </span>
                  <span className="text-[10px] text-[#f59e0b]">
                    {Math.round(region.confidence * 100)}%
                  </span>
                </div>
                <div className="text-[11px] text-[#f4f4f6] font-semibold">
                  {region.label}
                </div>
                <div className="text-[10px] text-[#8e919b] truncate">
                  Coords: X:{region.coordinates.x}% Y:{region.coordinates.y}% • {region.technique}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scientific Limitations Notice */}
      <div className="p-3 rounded bg-[#14161f] border border-[#232738] text-[11px] space-y-1">
        <div className="text-[#8e919b] uppercase text-[10px] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
          <span>FORENSIC LIMITATION NOTICE</span>
        </div>
        <p className="text-[#8e919b] font-sans leading-relaxed">
          {data.limitations}
        </p>
      </div>
    </div>
  );
};
