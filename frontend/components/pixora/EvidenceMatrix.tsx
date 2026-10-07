'use client';

import React, { useState } from 'react';
import { ForensicCase } from '@/types/forensics';
import {
  Layers,
  FileCode,
  KeyRound,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EvidenceMatrixProps {
  currentCase: ForensicCase;
  onHoverRow?: (sourceType: string | null) => void;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({ currentCase, onHoverRow }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getSourceIcon = (source: string) => {
    if (source.includes('PIXEL')) return <Layers className="w-3.5 h-3.5 text-[#3155FF]" />;
    if (source.includes('METADATA')) return <FileCode className="w-3.5 h-3.5 text-[#FF8A3D]" />;
    if (source.includes('PROVENANCE')) return <KeyRound className="w-3.5 h-3.5 text-[#B7E43A]" />;
    return <Sparkles className="w-3.5 h-3.5 text-[#3155FF]" />;
  };

  return (
    <div id="evidence" className="rounded-2xl bg-white border border-[#D6D0C5] p-6 sm:p-8 shadow-sm space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D6D0C5]">
        <div>
          <h3 className="text-2xl font-bold text-[#111111] tracking-tight">
            Evidence
          </h3>
          <p className="text-xs text-[#77736C] font-sans mt-0.5">
            Observed evidentiary signals across pixels, file headers, and provenance records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#77736C]">
          <span>EVALUATED SIGNALS:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#3155FF] font-bold border border-[#D6D0C5]">
            {currentCase.matrix.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#D6D0C5] bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] text-[#77736C] border-b border-[#D6D0C5] text-[10px] uppercase tracking-wider">
            <tr>
              <th className="p-3.5">SOURCE</th>
              <th className="p-3.5">OBSERVATION</th>
              <th className="p-3.5">QUALITY</th>
              <th className="p-3.5">APPLICABILITY</th>
              <th className="p-3.5">RELATIONSHIP</th>
              <th className="p-3.5 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E2D8]">
            {currentCase.matrix.map((row) => {
              const isExpanded = expandedRow === row.id;
              const isConflict = row.relationship === 'CONFLICT';
              return (
                <React.Fragment key={row.id}>
                  <tr
                    onMouseEnter={() => onHoverRow?.(row.source)}
                    onMouseLeave={() => onHoverRow?.(null)}
                    onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded
                        ? 'bg-[#FAF8F5]'
                        : isConflict
                        ? 'bg-[#FFF8F8] hover:bg-[#FEECEC]'
                        : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2 font-bold text-[#111111]">
                        {getSourceIcon(row.source)}
                        <span>{row.source}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-[#111111] max-w-sm">
                      <div className="line-clamp-1">{row.observation}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-[#3155FF] font-semibold">{row.quality}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="text-[#111111]">{row.applicability}</span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isConflict
                            ? 'bg-[#FEECEC] text-[#F04444] border border-[#F04444]/40'
                            : 'bg-[#B7E43A]/25 text-[#2B4E08] border border-[#B7E43A]'
                        }`}
                      >
                        {row.relationship}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-bold text-[#77736C]">
                          OBSERVED
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#77736C]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#77736C]" />
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row Detail */}
                  {isExpanded && (
                    <tr className="bg-[#FAF8F5] border-b border-[#D6D0C5]">
                      <td colSpan={6} className="p-4">
                        <div className="p-4 rounded-xl bg-white border border-[#D6D0C5] space-y-2 shadow-sm">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#3155FF] font-bold">
                              EVIDENTIARY DEEP-DIVE // {row.id}
                            </span>
                            <span className="text-[#77736C]">
                              APPLICABILITY: {row.applicability} • QUALITY: {row.quality}
                            </span>
                          </div>
                          <p className="text-xs text-[#111111] font-sans leading-relaxed">
                            {row.detail}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
