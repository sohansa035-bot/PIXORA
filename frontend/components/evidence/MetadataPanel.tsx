'use client';

import React from 'react';
import { MetadataForensicsData } from '@/types/forensics';
import { FileCode, AlertTriangle, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface MetadataPanelProps {
  data: MetadataForensicsData;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({ data }) => {
  return (
    <div className="rounded-lg bg-[#0d0e14] border border-[#222634] p-5 font-mono text-xs shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b1e2a]">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#00f59b]" />
          <span className="font-bold tracking-wider text-[#f4f4f6]">
            METADATA & CONTAINER FORENSICS
          </span>
        </div>
        <span className="text-[10px] text-[#8e919b] px-2 py-0.5 rounded bg-[#13151f] border border-[#202431]">
          EXIF • XMP • DQT
        </span>
      </div>

      {/* Mandatory Forensic Advisory Box */}
      <div className="p-3.5 rounded bg-[#16130b] border border-[#f59e0b]/40 text-[#f59e0b] space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>WARNING: EDITING SOFTWARE IDENTIFIER DETECTED</span>
        </div>
        <div className="text-[11px] text-[#f4f4f6]">
          Software signature: <span className="text-[#00f59b] font-bold">{data.software}</span>
        </div>
        <p className="text-[11px] text-[#d4b47a] font-sans leading-relaxed pt-1 border-t border-[#f59e0b]/20">
          <strong>Evidentiary Rule:</strong> Metadata is evidence, not independent proof of
          malicious manipulation. Authentic images are regularly exported or resized in photo
          editors without deceptive alteration.
        </p>
      </div>

      {/* Technical Metadata Table */}
      <div className="overflow-x-auto rounded border border-[#1f222f] bg-[#090a0f]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#11131a] text-[#8e919b] border-b border-[#1f222f] text-[10px] uppercase">
            <tr>
              <th className="p-2.5">HEADER ATTRIBUTE</th>
              <th className="p-2.5">INSPECTED VALUE</th>
              <th className="p-2.5 text-right">STATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181a24]">
            <tr>
              <td className="p-2.5 text-[#8e919b]">CONTAINER FORMAT</td>
              <td className="p-2.5 text-[#f4f4f6] font-semibold">{data.format}</td>
              <td className="p-2.5 text-right text-[#00f59b]">VALID</td>
            </tr>
            <tr>
              <td className="p-2.5 text-[#8e919b]">RASTER DIMENSIONS</td>
              <td className="p-2.5 text-[#f4f4f6]">{data.dimensions}</td>
              <td className="p-2.5 text-right text-[#00f59b]">INTACT</td>
            </tr>
            <tr>
              <td className="p-2.5 text-[#8e919b]">CAMERA HARDWARE</td>
              <td className="p-2.5 text-[#f4f4f6]">{data.cameraMakeModel}</td>
              <td className="p-2.5 text-right text-[#00f59b]">RECORDED</td>
            </tr>
            <tr>
              <td className="p-2.5 text-[#8e919b]">CAPTURE TIMESTAMP</td>
              <td className="p-2.5 text-[#f4f4f6]">{data.timestamp}</td>
              <td className="p-2.5 text-right text-[#8e919b]">TAGGED</td>
            </tr>
            <tr>
              <td className="p-2.5 text-[#8e919b]">COLOR PROFILE</td>
              <td className="p-2.5 text-[#f4f4f6]">{data.colorProfile}</td>
              <td className="p-2.5 text-right text-[#00f59b]">VERIFIED</td>
            </tr>
            <tr>
              <td className="p-2.5 text-[#8e919b]">JPEG QUANTIZATION (DQT)</td>
              <td className="p-2.5 text-[#f59e0b] text-[11px]">{data.jpegCharacteristics}</td>
              <td className="p-2.5 text-right text-[#f59e0b]">DUAL Q</td>
            </tr>
            <tr>
              <td className="p-2.5 text-[#8e919b]">THUMBNAIL SYNC CHECK</td>
              <td className="p-2.5 text-[#f4f4f6]">
                {data.thumbnailMatch ? 'Matched primary raster' : 'Mismatch with main frame'}
              </td>
              <td className="p-2.5 text-right">
                {data.thumbnailMatch ? (
                  <span className="text-[#00f59b]">SYNCED</span>
                ) : (
                  <span className="text-[#ef4444]">DESYNC</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="p-2.5 text-[#8e919b]">FILE SHA-256 HASH</td>
              <td className="p-2.5 text-[#00f59b] text-[10px] truncate max-w-[200px]" title={data.fileHashSha256}>
                {data.fileHashSha256.substring(0, 24)}...
              </td>
              <td className="p-2.5 text-right text-[#00f59b]">SEALED</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
