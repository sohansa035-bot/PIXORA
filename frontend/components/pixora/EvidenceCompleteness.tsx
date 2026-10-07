'use client';

import React from 'react';
import { ForensicCase } from '@/types/forensics';

interface EvidenceCompletenessProps {
  currentCase: ForensicCase;
}

export const EvidenceCompleteness: React.FC<EvidenceCompletenessProps> = ({ currentCase }) => {
  const auditItems = [
    { name: 'ORIGINAL IMAGE', status: 'MISSING', note: 'Primary RAW / DNG camera sensor file not supplied' },
    { name: 'METADATA', status: 'AVAILABLE', note: 'EXIF, XMP, and quantization tables intact' },
    { name: 'PROVENANCE', status: 'AVAILABLE', note: 'C2PA hardware enclave root signature present' },
    { name: 'INDEPENDENT SOURCE', status: 'MISSING', note: 'No secondary viewpoint or sensor telemetry corroborated' },
    { name: 'CONTEXT', status: 'AVAILABLE', note: 'Investigative claim and custody source logged' },
  ];

  const completenessPercentage = 62;

  return (
    <div id="available-evidence" className="rounded-2xl bg-white border border-[#D6D0C5] p-6 sm:p-8 shadow-sm space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D6D0C5]">
        <div>
          <h3 className="text-2xl font-bold text-[#111111] tracking-tight">
            Available Evidence
          </h3>
          <p className="text-xs text-[#77736C] font-sans mt-0.5">
            Record of which evidentiary sources are available versus missing for this case docket.
          </p>
        </div>

        {/* 62% Indicator */}
        <div className="flex items-center gap-4 bg-[#FAF8F5] px-4 py-2.5 rounded-xl border border-[#D6D0C5]">
          <div className="text-right">
            <div className="text-[10px] text-[#77736C] uppercase font-bold">AVAILABLE</div>
            <div className="text-2xl font-bold text-[#3155FF]">{completenessPercentage}%</div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E7E2D8]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#3155FF]"
                strokeDasharray={`${completenessPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* The 5 Key Required / Useful Evidence Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {auditItems.map((item) => {
          const isAvail = item.status === 'AVAILABLE';
          return (
            <div
              key={item.name}
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                isAvail
                  ? 'bg-[#F6FCEB] border-[#B7E43A]'
                  : 'bg-[#FAF8F5] border-[#D6D0C5]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#111111] truncate">{item.name}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    isAvail
                      ? 'bg-[#B7E43A]/25 border-[#B7E43A] text-[#2B4E08]'
                      : 'bg-[#FAF8F5] border-[#D6D0C5] text-[#77736C]'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-[11px] text-[#77736C] font-sans leading-snug">
                {item.note}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
