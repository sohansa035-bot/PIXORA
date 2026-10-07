'use client';

import React from 'react';
import { SyntheticAnalysisData } from '@/types/forensics';
import { Sparkles, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SyntheticPanelProps {
  data: SyntheticAnalysisData;
}

export const SyntheticPanel: React.FC<SyntheticPanelProps> = ({ data }) => {
  return (
    <div className="rounded-lg bg-[#0d0e14] border border-[#222634] p-5 font-mono text-xs shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1b1e2a]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00f59b]" />
          <span className="font-bold tracking-wider text-[#f4f4f6]">
            SYNTHETIC MEDIA & DIFFUSION FORENSICS
          </span>
        </div>
        <span className="text-[10px] text-[#00f59b] px-2 py-0.5 rounded bg-[#00f59b]/10 border border-[#00f59b]/30">
          FREQUENCY SPECTRA
        </span>
      </div>

      <div className="p-3.5 rounded bg-[#11131c] border border-[#202431] space-y-1">
        <div className="text-[10px] text-[#8e919b] uppercase">SPECTRAL STATUS</div>
        <div className="text-sm font-bold text-[#f4f4f6]">{data.label}</div>
        <p className="text-[11px] text-[#8e919b] font-sans pt-1">
          {data.detail}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded bg-[#13151f] border border-[#202431]">
          <div className="text-[10px] text-[#8e919b] uppercase">GEN PROBABILITY</div>
          <div className="text-lg font-bold text-[#f4f4f6]">
            {Math.round(data.generatorProbability * 100)}%
          </div>
        </div>
        <div className="p-3 rounded bg-[#13151f] border border-[#202431]">
          <div className="text-[10px] text-[#8e919b] uppercase">FOURIER ANOMALY</div>
          <div className="text-lg font-bold text-[#f59e0b]">
            {Math.round(data.frequencyDomainAnomaly * 100)}%
          </div>
        </div>
        <div className="p-3 rounded bg-[#13151f] border border-[#202431]">
          <div className="text-[10px] text-[#8e919b] uppercase">TEXTURE DISCONT.</div>
          <div className="text-lg font-bold text-[#ef4444]">
            {Math.round(data.textureDiscontinuity * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
