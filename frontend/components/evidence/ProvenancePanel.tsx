'use client';

import React from 'react';
import { ProvenanceData } from '@/types/forensics';
import { ShieldCheck, ShieldAlert, KeyRound, CheckCircle2, XCircle, AlertTriangle, Fingerprint } from 'lucide-react';

interface ProvenancePanelProps {
  data: ProvenanceData;
}

export const ProvenancePanel: React.FC<ProvenancePanelProps> = ({ data }) => {
  const getStatusColor = (status: ProvenanceData['status']) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-[#00f59b] bg-[#00f59b]/15 border-[#00f59b]/40';
      case 'INVALID':
        return 'text-[#ef4444] bg-[#ef4444]/15 border-[#ef4444]/40';
      case 'PARTIAL':
        return 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/40';
      default:
        return 'text-[#8e919b] bg-[#1a1d28] border-[#2b3040]';
    }
  };

  return (
    <div className="rounded-lg bg-[#0d0e14] border border-[#222634] p-5 font-mono text-xs shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b1e2a]">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#00f59b]" />
          <span className="font-bold tracking-wider text-[#f4f4f6]">
            CONTENT CREDENTIALS & PROVENANCE
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(
            data.status
          )}`}
        >
          {data.status}
        </span>
      </div>

      {/* Cryptographic Trust Status Card */}
      <div className="p-3.5 rounded bg-[#11131c] border border-[#222635] flex items-start gap-3">
        <div className="mt-0.5">
          {data.status === 'VERIFIED' ? (
            <ShieldCheck className="w-5 h-5 text-[#00f59b]" />
          ) : data.status === 'INVALID' ? (
            <ShieldAlert className="w-5 h-5 text-[#ef4444]" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#f4f4f6]">{data.credentialStatus}</div>
          <div className="text-[11px] text-[#8e919b] truncate">
            ISSUER: {data.issuer || 'Untrusted / No signature anchor'}
          </div>
        </div>
      </div>

      {/* Assertions Docket */}
      <div className="space-y-2">
        <div className="text-[11px] text-[#8e919b] uppercase">MANIFEST ASSERTIONS</div>

        <div className="p-2.5 rounded bg-[#0f1118] border border-[#1e222e] space-y-1">
          <div className="text-[10px] text-[#8e919b] uppercase flex items-center justify-between">
            <span>CREATION ASSERTION</span>
            <span className="text-[#00f59b]">HARDWARE ENCLAVE</span>
          </div>
          <p className="text-xs text-[#f4f4f6] font-sans">
            {data.creationAssertion || 'No cryptographic creation assertion found.'}
          </p>
        </div>

        <div className="p-2.5 rounded bg-[#0f1118] border border-[#1e222e] space-y-1">
          <div className="text-[10px] text-[#8e919b] uppercase flex items-center justify-between">
            <span>EDITING ASSERTION</span>
            <span className="text-[#f59e0b]">CHAIN GAP</span>
          </div>
          <p className="text-xs text-[#f4f4f6] font-sans">
            {data.editingAssertion || 'No downstream edit actions recorded.'}
          </p>
        </div>

        <div className="p-2.5 rounded bg-[#0f1118] border border-[#1e222e] space-y-1">
          <div className="text-[10px] text-[#8e919b] uppercase flex items-center justify-between">
            <span>AI SYNTHESIS ASSERTION</span>
            <span className="text-[#8e919b]">C2PA CLAIM</span>
          </div>
          <p className="text-xs text-[#f4f4f6] font-sans">
            {data.aiRelatedAssertion || 'No generative metadata claimed in manifest.'}
          </p>
        </div>
      </div>

      {/* Digest & Advisory */}
      <div className="pt-2 border-t border-[#1b1f2b] space-y-2">
        <div className="text-[10px] text-[#8e919b] flex items-center justify-between">
          <span>ROOT JUMBF DIGEST:</span>
          <span className="text-[#00f59b] truncate max-w-[200px]" title={data.cryptographicDigest}>
            {data.cryptographicDigest}
          </span>
        </div>
        <p className="text-[11px] text-[#8e919b] font-sans leading-relaxed">
          {data.advisory}
        </p>
      </div>
    </div>
  );
};
