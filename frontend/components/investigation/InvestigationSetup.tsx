'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  HelpCircle,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { ForensicCase } from '@/types/forensics';
import { StartInvestigationOptions } from '@/lib/api/forensics';

interface InvestigationSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAnalysis: (options: StartInvestigationOptions) => void;
  presetCases: ForensicCase[];
}

const INVESTIGATION_QUESTIONS = [
  'Was this image manipulated?',
  'Does this image contain suspicious regions?',
  'Can the image\'s provenance be verified?',
  'Does the available evidence support the associated claim?',
  'Custom investigation',
];

export const InvestigationSetup: React.FC<InvestigationSetupProps> = ({
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
  } | null>(null);

  const [selectedQuestion, setSelectedQuestion] = useState<string>(INVESTIGATION_QUESTIONS[0]);
  const [customQuestionText, setCustomQuestionText] = useState<string>('');
  const [claimContext, setClaimContext] = useState<string>('');
  const [sourceAttribution, setSourceAttribution] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      setCustomFile({
        file,
        previewUrl,
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
      });
      setSelectedPresetId('');
    };
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    const targetQuestion =
      selectedQuestion === 'Custom investigation'
        ? customQuestionText || 'Custom forensic hypothesis'
        : selectedQuestion;

    if (customFile) {
      onStartAnalysis({
        file: {
          name: customFile.file.name,
          size: customFile.file.size,
          type: customFile.file.type,
          url: customFile.previewUrl,
          width: customFile.width,
          height: customFile.height,
        },
        investigationTarget: targetQuestion,
        claimContext: claimContext || 'Analyst direct upload via drop zone.',
        sourceAttribution: sourceAttribution || 'Primary Ingestion Terminal',
      });
    } else {
      onStartAnalysis({
        sampleId: selectedPresetId,
        investigationTarget: targetQuestion,
        claimContext: claimContext || undefined,
        sourceAttribution: sourceAttribution || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0b0c11] border border-[#232736] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c202d] bg-[#08090d]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00f59b] animate-pulse" />
            <span className="font-mono text-sm font-bold tracking-wider text-[#f4f4f6]">
              BEGIN INVESTIGATION // INGESTION TERMINAL
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8e919b] hover:text-[#f4f4f6] hover:bg-[#151722] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
          {/* Quick Preset Selector */}
          <div>
            <div className="flex items-center justify-between text-[#8e919b] mb-2 uppercase text-[11px]">
              <span>OPTION A: SELECT PRESET FORENSIC DOCKET</span>
              <span>STANDARD BENCHMARKS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presetCases.map((preset) => {
                const isSelected = selectedPresetId === preset.id && !customFile;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomFile(null);
                    }}
                    className={`p-3 rounded border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#121620] border-[#00f59b] text-[#f4f4f6] shadow-[0_0_15px_rgba(0,245,155,0.15)]'
                        : 'bg-[#0e0f15] border-[#1f222d] text-[#8e919b] hover:border-[#2f3547]'
                    }`}
                  >
                    <img
                      src={preset.imageUrl}
                      alt={preset.title}
                      className="w-16 h-12 rounded object-cover border border-[#222530]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#00f59b]">{preset.caseId}</span>
                        <span className="text-[10px] text-[#585b65] uppercase">
                          {preset.fileFormat}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#f4f4f6] truncate font-sans">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-[#8e919b] truncate">
                        {preset.assessment.outcome}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#1b1e28]"></div>
            <span className="flex-shrink mx-4 text-[#585b65] text-[10px] uppercase">
              OR UPLOAD NEW ARTIFACT
            </span>
            <div className="flex-grow border-t border-[#1b1e28]"></div>
          </div>

          {/* Upload Drop Zone */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                customFile
                  ? 'border-[#00f59b] bg-[#0c1310]'
                  : isDragging
                  ? 'border-[#00f59b] bg-[#0f151b]'
                  : 'border-[#222533] hover:border-[#333a4c] bg-[#0a0b0f]'
              }`}
            >
              {customFile ? (
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={customFile.previewUrl}
                    alt="Upload preview"
                    className="w-20 h-14 object-cover rounded border border-[#00f59b]"
                  />
                  <div className="text-left font-mono">
                    <div className="text-xs text-[#00f59b] font-bold">
                      {customFile.file.name}
                    </div>
                    <div className="text-[11px] text-[#8e919b]">
                      {(customFile.file.size / 1024).toFixed(1)} KB • {customFile.width} ×{' '}
                      {customFile.height} px
                    </div>
                    <div className="text-[10px] text-[#585b65]">Click to replace image</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#13151f] flex items-center justify-center text-[#00f59b] border border-[#232738]">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-[#f4f4f6]">
                    DROP IMAGE HERE OR CLICK TO BROWSE
                  </div>
                  <div className="text-[11px] text-[#8e919b]">
                    Supported formats: JPG, JPEG, PNG, WEBP (Up to 50MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investigation Target Question */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-[#8e919b] uppercase text-[11px]">
              <span>WHAT ARE YOU TRYING TO DETERMINE?</span>
              <span className="text-[#00f59b]">HYPOTHESIS SELECTION</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INVESTIGATION_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSelectedQuestion(q)}
                  className={`p-2.5 rounded border text-left transition-all text-xs font-mono flex items-center justify-between ${
                    selectedQuestion === q
                      ? 'bg-[#151926] border-[#00f59b] text-[#f4f4f6]'
                      : 'bg-[#0d0e14] border-[#1d202b] text-[#8e919b] hover:border-[#2e3344]'
                  }`}
                >
                  <span className="truncate">{q}</span>
                  {selectedQuestion === q && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00f59b] flex-shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>

            {selectedQuestion === 'Custom investigation' && (
              <input
                type="text"
                placeholder="Enter specific custom forensic hypothesis..."
                value={customQuestionText}
                onChange={(e) => setCustomQuestionText(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0d0e14] border border-[#00f59b] text-[#f4f4f6] text-xs font-mono focus:outline-none"
              />
            )}
          </div>

          {/* Optional Investigation Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] text-[#8e919b] uppercase mb-1">
                ASSOCIATED CAPTION / CLAIM (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g. 'Photo depicts live drone test over central plaza'"
                value={claimContext}
                onChange={(e) => setClaimContext(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0d0e14] border border-[#1f222d] text-[#f4f4f6] text-xs font-mono focus:border-[#00f59b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8e919b] uppercase mb-1">
                SOURCE / CHAIN OF CUSTODY (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g. 'Investigative Newsroom Intake #301'"
                value={sourceAttribution}
                onChange={(e) => setSourceAttribution(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0d0e14] border border-[#1f222d] text-[#f4f4f6] text-xs font-mono focus:border-[#00f59b] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1c202d] bg-[#08090d]">
          <div className="text-[11px] font-mono text-[#8e919b]">
            PIXORA v2.6 • ZERO UNBOUNDED INFERENCE
          </div>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#00f59b] hover:bg-[#10ffaa] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,245,155,0.3)] active:scale-[0.98]"
          >
            <span>BEGIN ANALYSIS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
