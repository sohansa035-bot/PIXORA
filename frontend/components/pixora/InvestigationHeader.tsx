'use client';

import React, { useState, useRef } from 'react';
import { ForensicCase } from '@/types/forensics';
import { StartInvestigationOptions } from '@/lib/api/forensics';
import {
  UploadCloud,
  ArrowRight,
  X,
  FileImage,
} from 'lucide-react';

interface InvestigationHeaderProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAnalysis: (options: StartInvestigationOptions) => void;
  presetCases: ForensicCase[];
}

export const InvestigationHeader: React.FC<InvestigationHeaderProps> = ({
  isOpen,
  onClose,
  onStartAnalysis,
  presetCases,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('PX-2026-00142');
  const [customFile, setCustomFile] = useState<{
    file: File;
    previewUrl: string;
    width: number;
    height: number;
    sha256?: string;
  } | null>(null);

  const [selectedQuestion, setSelectedQuestion] = useState<string>('Was this image edited?');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setCustomFile(null);
      setSelectedPresetId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const previewUrl = URL.createObjectURL(file);
    
    // Set customFile synchronously immediately
    setSelectedPresetId('');
    setCustomFile({
      file,
      previewUrl,
      width: 1920,
      height: 1080,
    });

    // Asynchronously resolve natural dimensions
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      setCustomFile((prev) => prev ? {
        ...prev,
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
      } : null);
    };

    // Asynchronously calculate real SHA-256 hash
    file.arrayBuffer().then((buffer) => {
      crypto.subtle.digest('SHA-256', buffer).then((hashBuffer) => {
        const hashHex = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        setCustomFile((prev) => prev ? { ...prev, sha256: hashHex } : null);
      });
    }).catch(() => {});
  };

  const handleSubmit = () => {
    if (customFile) {
      onStartAnalysis({
        rawFile: customFile.file,
        file: {
          name: customFile.file.name,
          size: customFile.file.size,
          type: customFile.file.type,
          url: customFile.previewUrl,
          width: customFile.width,
          height: customFile.height,
        },
        investigationTarget: selectedQuestion,
      });
    } else {
      onStartAnalysis({
        sampleId: selectedPresetId,
        investigationTarget: selectedQuestion,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md font-mono text-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#F4F0E8] border border-[#D6D0C5] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D6D0C5] bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3155FF] animate-pulse" />
            <span className="text-sm font-bold tracking-wider text-[#111111]">
              INGEST IMAGE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#77736C] hover:text-[#111111] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Central Simplified Drop Zone (Section 4) */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp,image/tiff"
              className="hidden"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleProcessFile(e.dataTransfer.files[0]);
              }}
              className={`p-8 sm:p-10 border-2 border-dashed rounded-2xl text-center transition-all ${
                customFile
                  ? 'border-[#3155FF] bg-white shadow-sm'
                  : isDragging
                  ? 'border-[#3155FF] bg-white'
                  : 'border-[#D6D0C5] hover:border-[#3155FF] bg-white'
              }`}
            >
              {customFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={customFile.previewUrl}
                      alt="Upload Preview"
                      className="w-20 h-16 object-cover rounded-lg border border-[#3155FF]"
                    />
                    <div className="text-left space-y-0.5">
                      <div className="text-xs text-[#3155FF] font-bold truncate max-w-xs">
                        {customFile.file.name}
                      </div>
                      <div className="text-[11px] text-[#77736C]">
                        {customFile.width} × {customFile.height} px • {(customFile.file.size / 1024).toFixed(1)} KB
                      </div>
                      <div className="text-[10px] text-[#2B4E08] font-bold">
                        READY FOR SCANNING
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCustomFile(null);
                      setSelectedPresetId('PX-2026-00142');
                    }}
                    className="text-[11px] text-[#77736C] hover:text-[#F04444] underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#3155FF] border border-[#D6D0C5]">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-base font-bold text-[#111111]">
                      DROP AN IMAGE TO INVESTIGATE
                    </div>
                    <div className="text-xs text-[#77736C]">
                      or
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F0E8] border border-[#D6D0C5] text-[#111111] font-semibold text-xs transition-colors shadow-xs"
                  >
                    CHOOSE IMAGE
                  </button>

                  <div className="text-xs text-[#77736C] pt-1">
                    JPEG · PNG · WEBP · TIFF
                  </div>

                  {/* One-Click Real Forensic Test Samples */}
                  <div className="pt-3 border-t border-[#E7E2D8] w-full max-w-md">
                    <div className="text-[10px] font-mono font-bold text-[#77736C] uppercase mb-2">
                      OR LOAD TEST EVIDENCE FILE:
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await fetch('/test_assets/test_camera_photo.jpg');
                          const blob = await res.blob();
                          handleProcessFile(new File([blob], 'test_camera_photo.jpg', { type: 'image/jpeg' }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D6D0C5] hover:border-[#3155FF] hover:text-[#3155FF] text-[11px] font-mono text-[#111111] transition-colors"
                      >
                        test_camera_photo.jpg
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await fetch('/test_assets/test_valid.png');
                          const blob = await res.blob();
                          handleProcessFile(new File([blob], 'test_valid.png', { type: 'image/png' }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D6D0C5] hover:border-[#3155FF] hover:text-[#3155FF] text-[11px] font-mono text-[#111111] transition-colors"
                      >
                        test_valid.png
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await fetch('/test_assets/test_tampered_software.jpg');
                          const blob = await res.blob();
                          handleProcessFile(new File([blob], 'test_tampered_software.jpg', { type: 'image/jpeg' }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D6D0C5] hover:border-[#3155FF] hover:text-[#3155FF] text-[11px] font-mono text-[#111111] transition-colors"
                      >
                        test_tampered_software.jpg
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await fetch('/test_assets/test_noise_noexif.jpg');
                          const blob = await res.blob();
                          handleProcessFile(new File([blob], 'test_noise_noexif.jpg', { type: 'image/jpeg' }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D6D0C5] hover:border-[#3155FF] hover:text-[#3155FF] text-[11px] font-mono text-[#111111] transition-colors"
                      >
                        test_noise_noexif.jpg
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Pre-Configured Benchmark Cases */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#77736C] uppercase font-bold">
              <span>OR SELECT BENCHMARK CASE</span>
              <span>1-CLICK INGEST</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presetCases.map((preset) => {
                const isSelected = selectedPresetId === preset.id && !customFile;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomFile(null);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-white border-[#3155FF] ring-2 ring-[#3155FF]/20 text-[#111111] shadow-sm'
                        : 'bg-white border-[#D6D0C5] text-[#77736C] hover:border-[#111111]'
                    }`}
                  >
                    <img
                      src={preset.imageUrl}
                      alt={preset.title}
                      className="w-12 h-10 rounded-lg object-cover border border-[#D6D0C5] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3155FF] text-[11px]">{preset.caseId}</span>
                        <span className="text-[9px] uppercase font-bold text-[#77736C]">{preset.fileFormat}</span>
                      </div>
                      <div className="text-[11px] text-[#111111] truncate font-sans font-medium">
                        {preset.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#D6D0C5] bg-white">
          <div className="text-[10px] text-[#77736C] flex items-center gap-1.5">
            <FileImage className="w-3.5 h-3.5" />
            <span>Digital Evidence Preservation Standard</span>
          </div>

          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3155FF] hover:bg-[#2345E5] text-white font-bold uppercase tracking-wider transition-all shadow-md shadow-[#3155FF]/20 active:scale-[0.98]"
          >
            <span>START INVESTIGATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
