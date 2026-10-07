'use client';

import React from 'react';
import { MetadataForensicsData } from '@/types/forensics';
import { FileCode, AlertTriangle } from 'lucide-react';

interface MetadataInspectorProps {
  data: MetadataForensicsData;
}

export const MetadataInspector: React.FC<MetadataInspectorProps> = ({ data }) => {
  return (
    <div className="rounded-2xl bg-white border border-[#D6D0C5] p-5 font-mono text-xs shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D6D0C5]">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#3155FF]" />
          <span className="font-bold tracking-wider text-[#111111]">
            METADATA & FILE FORENSICS
          </span>
        </div>
        <span className="text-[10px] text-[#77736C] px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#D6D0C5]">
          EXIF • XMP • DQT
        </span>
      </div>

      {/* Editorial Admonition */}
      <div className="p-3.5 rounded-xl bg-[#FFF9F2] border border-[#FF8A3D]/40 text-[#9C4E00] space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF8A3D]" />
          <span>&ldquo;METADATA IS EVIDENCE, NOT TRUTH.&rdquo;</span>
        </div>
        <p className="text-[11px] text-[#77736C] font-sans leading-relaxed">
          The presence of an editing software signature (e.g., Adobe Photoshop) indicates file
          re-encoding, but does not independently establish malicious editing. Never conflate export
          processing with deceptive manipulation.
        </p>
      </div>

      {/* Metadata Attributes Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">FORMAT</div>
          <div className="text-xs font-bold text-[#111111]">{data.format}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">DIMENSIONS</div>
          <div className="text-xs font-bold text-[#111111]">{data.dimensions}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">COLOR PROFILE</div>
          <div className="text-xs font-bold text-[#111111]">{data.colorProfile}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">SOFTWARE</div>
          <div className="text-xs font-bold text-[#3155FF] truncate">{data.software}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">TIMESTAMP</div>
          <div className="text-xs font-bold text-[#111111]">{data.timestamp}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">CAMERA</div>
          <div className="text-xs font-bold text-[#111111] truncate">{data.cameraMakeModel}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">THUMBNAIL RASTER</div>
          <div className="text-xs font-bold text-[#FF8A3D]">
            {data.thumbnailMatch ? 'Matched' : 'Desynchronized'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5]">
          <div className="text-[10px] text-[#77736C] uppercase">FILE SHA-256 HASH</div>
          <div className="text-xs font-bold text-[#3155FF] truncate" title={data.fileHashSha256}>
            {data.fileHashSha256.substring(0, 14)}...
          </div>
        </div>
      </div>

      {/* Quantization Characteristics */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-1">
        <div className="text-[10px] text-[#77736C] uppercase font-bold">QUANTIZATION CHARACTERISTICS</div>
        <p className="text-[11px] text-[#111111] font-sans leading-relaxed">
          {data.jpegCharacteristics}
        </p>
      </div>
    </div>
  );
};
