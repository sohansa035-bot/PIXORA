'use client';

import React, { useState } from 'react';
import { ProvenanceData } from '@/types/forensics';
import {
  ShieldCheck,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ProvenanceChainProps {
  data: ProvenanceData;
}

interface ChainStep {
  id: string;
  title: string;
  actor: string;
  status: 'VERIFIED' | 'WARNING' | 'GAP' | 'MISSING';
  assertion: string;
  details: string[];
}

export const ProvenanceChain: React.FC<ProvenanceChainProps> = ({ data }) => {
  const [expandedStep, setExpandedStep] = useState<string>('CREATION');

  const steps: ChainStep[] = [
    {
      id: 'CREATOR',
      title: 'CREATOR IDENTITY',
      actor: 'Hardware Security Enclave (Leica Camera AG)',
      status: data.status === 'VERIFIED' ? 'VERIFIED' : 'MISSING',
      assertion: 'Root X.509 Trust Anchor verified with manufacturer public key.',
      details: [
        'Certificate Serial: 0x48a1...99bc',
        'Key Algorithm: ECDSA P-256 with SHA-256',
        'Hardware Security Module: Embedded TPM 2.0',
      ],
    },
    {
      id: 'CREATION',
      title: 'CREATION ASSERTION',
      actor: 'Sensor Capture Subsystem',
      status: data.status === 'VERIFIED' ? 'VERIFIED' : 'MISSING',
      assertion: data.creationAssertion || 'Direct optical sensor capture attested.',
      details: [
        'Exposure Time: 1/125s • ISO: 400 • Aperture: f/2.8',
        'Hardware Timestamp: 2026-10-06 18:31:04 UTC',
        'Bayer Color Filter Array Pattern Intact',
      ],
    },
    {
      id: 'EDIT',
      title: 'EDIT ASSERTION (CHAIN GAP)',
      actor: 'Secondary Raster Editor',
      status: 'WARNING',
      assertion: data.editingAssertion || 'Intermediate editing steps omitted from manifest.',
      details: [
        'Notice: Post-capture composite injection detected via pixel forensics',
        'C2PA chain lacks signed edit assertion from Photoshop session',
        'Quantization table desynchronization matches unrecorded modification',
      ],
    },
    {
      id: 'EXPORT',
      title: 'EXPORT & DISTRIBUTION',
      actor: 'File Container Ingestion Pipeline',
      status: 'VERIFIED',
      assertion: 'JUMBF manifest container extracted without structural tampering.',
      details: [
        'Container MIME: image/jpeg',
        `Manifest Digest: ${data.cryptographicDigest.substring(0, 28)}...`,
        'Manifest Signature State: Validated against C2PA Spec 2.1',
      ],
    },
  ];

  const getStatusBadge = (status: ChainStep['status']) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="text-[10px] text-[#2B4E08] bg-[#B7E43A]/25 border border-[#B7E43A] px-2 py-0.5 rounded font-bold">✓ VERIFIED</span>;
      case 'WARNING':
      case 'GAP':
        return <span className="text-[10px] text-[#9C4E00] bg-[#FFF2E5] border border-[#FF8A3D] px-2 py-0.5 rounded font-bold">⚠ CHAIN GAP</span>;
      default:
        return <span className="text-[10px] text-[#77736C] bg-[#FAF8F5] border border-[#D6D0C5] px-2 py-0.5 rounded">MISSING</span>;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-[#D6D0C5] p-5 font-mono text-xs shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D6D0C5]">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#3155FF]" />
          <span className="font-bold tracking-wider text-[#111111]">
            CONTENT CREDENTIALS & PROVENANCE CHAIN
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            data.status === 'VERIFIED'
              ? 'text-[#2B4E08] bg-[#B7E43A]/25 border-[#B7E43A]'
              : 'text-[#9C4E00] bg-[#FFF2E5] border-[#FF8A3D]'
          }`}
        >
          {data.status}
        </span>
      </div>

      {/* Top Advisory */}
      <div className="p-3.5 rounded-xl bg-[#F6FCEB] border border-[#B7E43A] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#3E6B08] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-sm font-bold text-[#111111]">{data.credentialStatus}</div>
          <p className="text-[11px] text-[#77736C] font-sans leading-relaxed">
            A verified Content Credential validates the camera root signature, but cannot
            guarantee absence of subsequent modifications if raster is edited outside a trusted enclave.
          </p>
        </div>
      </div>

      {/* Vertical Provenance Chain */}
      <div className="space-y-2 relative pt-2">
        <div className="text-[10px] uppercase text-[#77736C] tracking-wider mb-2 font-bold">
          VERTICAL PROVENANCE CHAIN (C2PA 2.1)
        </div>

        {steps.map((step, idx) => {
          const isExpanded = expandedStep === step.id;
          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => setExpandedStep(isExpanded ? '' : step.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isExpanded
                    ? 'bg-white border-[#3155FF] shadow-md shadow-[#3155FF]/10 ring-1 ring-[#3155FF]'
                    : 'bg-[#FAF8F5] border-[#D6D0C5] hover:border-[#111111]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#3155FF]">0{idx + 1}</span>
                    <span className="font-semibold text-xs text-[#111111]">{step.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(step.status)}
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#77736C]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#77736C]" />
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-[#77736C] truncate font-sans">
                  {step.actor}
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#D6D0C5] space-y-2 font-mono text-[11px]">
                    <p className="text-xs text-[#111111] font-sans leading-snug">
                      {step.assertion}
                    </p>
                    <ul className="space-y-1 text-[#77736C] bg-[#FAF8F5] p-3 rounded-lg border border-[#D6D0C5]">
                      {step.details.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <span className="text-[#3155FF] font-bold">›</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {idx < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-[1px] h-3 bg-[#D6D0C5]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
