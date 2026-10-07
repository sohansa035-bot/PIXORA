'use client';

import React, { useState } from 'react';
import { ForensicCase } from '@/types/forensics';
import {
  FileText,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  Shield,
  ArrowUp,
} from 'lucide-react';

interface ForensicReportProps {
  currentCase: ForensicCase;
  onClose: () => void;
}

export const ForensicReport: React.FC<ForensicReportProps> = ({ currentCase, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentCase, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentCase.caseId}_FORENSIC_DOSSIER.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `https://pixora.forensics/dockets/${currentCase.caseId}?hash=${currentCase.sha256Hash.substring(0, 16)}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="report" className="rounded-lg bg-[#0d0e14] border border-[#232736] p-6 sm:p-12 shadow-2xl relative font-mono text-xs">
      {/* Action Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#1f222f] no-print">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00f59b]" />
          <span className="text-sm font-bold tracking-wider text-[#f4f4f6]">
            OFFICIAL FORENSIC DOSSIER // {currentCase.caseId}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#13151f] hover:bg-[#1a1d2b] border border-[#232738] text-[#d1d3db] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#13151f] hover:bg-[#1a1d2b] border border-[#232738] text-[#d1d3db] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>DOWNLOAD PDF / PRINT</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#00f59b] hover:bg-[#10ffaa] text-black font-bold transition-all"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>COPIED DOSSIER LINK</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE REPORT</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#13151f] hover:bg-[#1a1d2b] border border-[#232738] text-[#8e919b] hover:text-[#f4f4f6] transition-colors"
            title="Return to Evidence Workspace"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>RETURN TO DECK</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Body */}
      <div className="bg-[#08090d] border border-[#202330] rounded-lg p-6 sm:p-10 space-y-8 text-[#d1d3db] shadow-inner">
        {/* Formal Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b-2 border-[#202330]">
          <div>
            <div className="text-2xl font-bold tracking-widest text-[#f4f4f6] mb-1">
              PIXORA FORENSIC SYSTEMS
            </div>
            <div className="text-xs uppercase text-[#00f59b] tracking-wider mb-2">
              DIGITAL IMAGE EVIDENCE ASSESSMENT DOCKET
            </div>
            <div className="text-[11px] text-[#8e919b] font-sans">
              Standards Compliance: ISO/IEC 27037:2012 • C2PA Specifications 2.1 • SWGDE
            </div>
          </div>

          <div className="text-right space-y-1 text-xs">
            <div>
              <span className="text-[#8e919b]">CASE ID:</span>{' '}
              <strong className="text-[#00f59b] text-sm">{currentCase.caseId}</strong>
            </div>
            <div>
              <span className="text-[#8e919b]">INGESTION TIMESTAMP:</span>{' '}
              <span className="text-[#f4f4f6]">{currentCase.uploadedAt}</span>
            </div>
            <div>
              <span className="text-[#8e919b]">SECURITY CLASSIFICATION:</span>{' '}
              <span className="text-[#f59e0b] font-semibold">CONFIDENTIAL INVESTIGATION</span>
            </div>
          </div>
        </div>

        {/* Evidence Artifact Metadata Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 rounded bg-[#0f1118] border border-[#1e222e]">
          <div className="md:col-span-4">
            <div className="aspect-video rounded overflow-hidden border border-[#292d3b] bg-black">
              <img
                src={currentCase.imageUrl}
                alt={currentCase.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-8 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[#8e919b]">EVIDENCE FILENAME:</span>{' '}
                <div className="text-[#f4f4f6] font-semibold truncate">
                  {currentCase.originalFileName}
                </div>
              </div>
              <div>
                <span className="text-[#8e919b]">BYTE SIZE & FORMAT:</span>{' '}
                <div className="text-[#f4f4f6]">
                  {(currentCase.fileSizeBytes / 1024).toFixed(1)} KB ({currentCase.fileFormat})
                </div>
              </div>
            </div>
            <div>
              <span className="text-[#8e919b]">SHA-256 INTEGRITY DIGEST:</span>{' '}
              <div className="text-[#00f59b] text-[10px] break-all font-mono">
                {currentCase.sha256Hash}
              </div>
            </div>
            <div>
              <span className="text-[#8e919b]">PRIMARY INQUIRY TARGET:</span>{' '}
              <div className="text-[#f4f4f6] font-sans text-xs">
                {currentCase.investigationTarget}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Verdict Summary */}
        <div className="p-5 rounded bg-[#13151f] border border-[#232738] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-[#202433]">
            <span className="text-[#8e919b] uppercase">FINAL EVIDENTIARY VERDICT</span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                currentCase.assessment.outcome === 'INCONCLUSIVE'
                  ? 'text-[#f59e0b] bg-[#f59e0b]/15 border border-[#f59e0b]/30'
                  : 'text-[#00f59b] bg-[#00f59b]/15 border border-[#00f59b]/30'
              }`}
            >
              {currentCase.assessment.outcome}
            </span>
          </div>
          <p className="text-sm text-[#f4f4f6] font-sans leading-relaxed">
            {currentCase.assessment.subtitle}
          </p>
        </div>

        {/* Section 1: Established vs Unestablished Boundaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#00f59b] uppercase">
              1.1 ESTABLISHED OBSERVATIONS
            </div>
            <ul className="space-y-2 text-xs">
              {currentCase.assessment.whatEstablished.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#00f59b] font-bold">✓</span>
                  <span className="font-sans text-[#f4f4f6]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-[#ef4444] uppercase">
              1.2 SCIENTIFIC LIMITATIONS (CANNOT BE ESTABLISHED)
            </div>
            <ul className="space-y-2 text-xs">
              {currentCase.assessment.whatCannotBeEstablished.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#ef4444] font-bold">✕</span>
                  <span className="font-sans text-[#e5b3ba]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 2: Evidentiary Multi-Source Matrix */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#f4f4f6] uppercase">
            2.0 EVIDENCE MATRIX
          </div>
          <div className="overflow-x-auto rounded border border-[#1f222f]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12141c] text-[#8e919b] text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">SOURCE</th>
                  <th className="p-2.5">OBSERVED ANOMALY / ATTESTATION</th>
                  <th className="p-2.5">QUALITY</th>
                  <th className="p-2.5">RELATIONSHIP</th>
                  <th className="p-2.5 text-right">FINDING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181a24] text-[11px]">
                {currentCase.matrix.map((row) => (
                  <tr key={row.id}>
                    <td className="p-2.5 font-bold text-[#f4f4f6]">{row.source}</td>
                    <td className="p-2.5 text-[#d1d3db] font-sans">{row.observation}</td>
                    <td className="p-2.5">{row.quality}</td>
                    <td className="p-2.5 font-bold">
                      <span
                        className={
                          row.relationship === 'SUPPORTS'
                            ? 'text-[#00f59b]'
                            : row.relationship === 'CONFLICT'
                            ? 'text-[#ef4444]'
                            : 'text-[#8e919b]'
                        }
                      >
                        {row.relationship}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-[#00f59b]">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Recommended Examiner Directive */}
        <div className="p-4 rounded bg-[#0f1118] border border-[#1f222e] space-y-1">
          <div className="text-xs font-bold text-[#f59e0b] uppercase">
            3.0 RECOMMENDED INVESTIGATOR ACTION
          </div>
          <div className="text-xs font-sans text-[#f4f4f6] leading-relaxed">
            {currentCase.assessment.recommendedAction}
          </div>
        </div>

        {/* Formal Signature & Chain of Custody Stamp */}
        <div className="pt-6 border-t-2 border-[#202330] grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
          <div className="space-y-1.5 text-[11px]">
            <div className="text-[#8e919b] uppercase">EXAMINER ATTESTATION:</div>
            <div className="text-[#f4f4f6] font-semibold">
              PIXORA Autonomous Forensics Engine v2.6.4
            </div>
            <div className="text-[#8e919b]">
              Evidence Verification System
            </div>
            <div className="text-[#00f59b] text-[10px]">
              DOCKET SEAL: VALIDATED CRYPTOGRAPHICALLY
            </div>
          </div>

          <div className="p-3 rounded border border-[#2b3040] bg-[#0c0d12] text-right font-mono text-[10px] space-y-1">
            <div className="text-[#8e919b]">DIGITAL SIGNATURE FINGERPRINT</div>
            <div className="text-[#00f59b] truncate">
              SIG:ECDSA-P256:{currentCase.sha256Hash.substring(0, 32)}
            </div>
            <div className="text-[#585b65]">TIMESTAMP: {currentCase.uploadedAt}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
