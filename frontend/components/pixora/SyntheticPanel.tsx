'use client';

import React from 'react';
import { SyntheticAnalysisData } from '@/types/forensics';
import { Sparkles } from 'lucide-react';

interface SyntheticPanelProps {
  data: SyntheticAnalysisData;
}

export const SyntheticPanel: React.FC<SyntheticPanelProps> = ({ data }) => {
  return (
    <div className="rounded-2xl bg-white border border-[#D6D0C5] p-5 font-mono text-xs shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D6D0C5]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#3155FF]" />
          <span className="font-bold tracking-wider text-[#111111]">
            SYNTHETIC MEDIA & DIFFUSION FORENSICS
          </span>
        </div>
        <span className="text-[10px] text-[#3155FF] px-2 py-0.5 rounded bg-[#3155FF]/10 border border-[#3155FF]/30 font-bold">
          FREQUENCY SPECTRA
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-1">
        <div className="text-[10px] text-[#77736C] uppercase font-bold">SPECTRAL STATUS</div>
        <div className="text-sm font-bold text-[#111111]">{data.label}</div>
        <p className="text-[11px] text-[#77736C] font-sans pt-1">
          {data.detail}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">GEN PROBABILITY</div>
          <div className="text-lg font-bold text-[#111111]">
            {Math.round(data.generatorProbability * 100)}%
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">FOURIER ANOMALY</div>
          <div className="text-lg font-bold text-[#FF8A3D]">
            {Math.round(data.frequencyDomainAnomaly * 100)}%
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">TEXTURE DISCONT.</div>
          <div className="text-lg font-bold text-[#F04444]">
            {Math.round(data.textureDiscontinuity * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
