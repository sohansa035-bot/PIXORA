'use client';

import React, { useState } from 'react';
import { ForensicCase, EvidenceMatrixItem } from '@/types/forensics';
import {
  Table,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sliders,
  Shield,
  Layers,
  FileCode,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface EvidenceIntelligenceProps {
  currentCase: ForensicCase;
}

export const EvidenceIntelligence: React.FC<EvidenceIntelligenceProps> = ({ currentCase }) => {
  const [expandedId, setExpandedId] = useState<string | null>(currentCase.matrix[0]?.id || null);

  const getSourceIcon = (source: EvidenceMatrixItem['source']) => {
    switch (source) {
      case 'PIXEL FORENSICS':
        return <Layers className="w-3.5 h-3.5 text-[#00f59b]" />;
      case 'METADATA':
        return <FileCode className="w-3.5 h-3.5 text-[#f59e0b]" />;
      case 'PROVENANCE':
        return <KeyRound className="w-3.5 h-3.5 text-[#00f59b]" />;
      case 'SYNTHETIC ANALYSIS':
        return <Sparkles className="w-3.5 h-3.5 text-[#a3f7d4]" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-[#8e919b]" />;
    }
  };

  const getStatusBadge = (status: EvidenceMatrixItem['status']) => {
    switch (status) {
      case 'VERIFIED':
      case 'SUPPORTED':
        return (
          <span className="flex items-center gap-1 text-[#00f59b] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠</span>
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="flex items-center gap-1 text-[#ef4444] font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>✕ CONFLICT</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[#8e919b]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>UNTESTED</span>
          </span>
        );
    }
  };

  const getQualityBadge = (level: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (level) {
      case 'HIGH':
        return <span className="text-[#00f59b] font-semibold">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[#f59e0b] font-semibold">MEDIUM</span>;
      case 'LOW':
        return <span className="text-[#8e919b]">LOW</span>;
    }
  };

  return (
    <div id="intelligence" className="rounded-lg bg-[#0b0c11] border border-[#232736] p-6 shadow-2xl space-y-6">
      {/* Section Eyebrow & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1b1f2c]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00f59b]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#00f59b]">
              CORE USP // MULTI-SIGNAL SYNTHESIS
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-mono font-bold text-[#f4f4f6]">
            EVIDENCE MATRIX
          </h3>
          <p className="text-xs text-[#8e919b] font-sans">
            Every evidentiary signal is calibrated by quality, relevance, and logical relationship
            before reaching decision eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#8e919b]">DOCKET ITEMS:</span>
          <span className="px-2 py-0.5 rounded bg-[#161822] text-[#00f59b] font-bold border border-[#00f59b]/30">
            {currentCase.matrix.length} EVALUATED
          </span>
        </div>
      </div>

      {/* Interactive Matrix Table */}
      <div className="overflow-x-auto rounded border border-[#1f222f] bg-[#090a0f]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#12141c] text-[#8e919b] border-b border-[#1f222f] text-[10px] uppercase">
            <tr>
              <th className="p-3">SOURCE</th>
              <th className="p-3">OBSERVATION</th>
              <th className="p-3">QUALITY</th>
              <th className="p-3">APPLICABILITY</th>
              <th className="p-3">RELATIONSHIP</th>
              <th className="p-3 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181a24]">
            {currentCase.matrix.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded
                        ? 'bg-[#151924]'
                        : item.status === 'CONFLICT'
                        ? 'bg-[#181014] hover:bg-[#1f141a]'
                        : 'hover:bg-[#11131a]'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-[#f4f4f6] font-semibold">
                        {getSourceIcon(item.source)}
                        <span>{item.source}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#d1d3db] max-w-md">
                      <div className="line-clamp-1">{item.observation}</div>
                    </td>
                    <td className="p-3">{getQualityBadge(item.quality)}</td>
                    <td className="p-3">{getQualityBadge(item.applicability)}</td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.relationship === 'SUPPORTS'
                            ? 'bg-[#00f59b]/15 text-[#00f59b]'
                            : item.relationship === 'CONFLICT'
                            ? 'bg-[#ef4444]/15 text-[#ef4444]'
                            : item.relationship === 'CONSISTENT'
                            ? 'bg-[#00f59b]/10 text-[#00f59b]'
                            : 'bg-[#1a1d28] text-[#8e919b]'
                        }`}
                      >
                        {item.relationship}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getStatusBadge(item.status)}
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#8e919b]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#8e919b]" />
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {isExpanded && (
                    <tr className="bg-[#10131d] border-b border-[#232738]">
                      <td colSpan={6} className="p-4">
                        <div className="p-3 rounded bg-[#090b10] border border-[#1f2230] space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#00f59b] font-bold">
                              EVIDENTIARY DEEP-DIVE // {item.id}
                            </span>
                            <span className="text-[#8e919b]">
                              APPLICABILITY: {item.applicability} • QUALITY: {item.quality}
                            </span>
                          </div>
                          <p className="text-xs text-[#d1d3db] font-sans leading-relaxed">
                            {item.detail}
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
