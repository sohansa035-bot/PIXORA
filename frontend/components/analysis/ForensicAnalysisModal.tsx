'use client';

import React, { useEffect, useState } from 'react';
import { ForensicCase, AnalysisStageStatus } from '@/types/forensics';
import { FORENSIC_STAGES } from '@/lib/api/forensics';
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Shield,
  Terminal,
  Crosshair,
} from 'lucide-react';

interface ForensicAnalysisModalProps {
  isOpen: boolean;
  targetCase: ForensicCase;
  onAnalysisComplete: () => void;
}

export const ForensicAnalysisModal: React.FC<ForensicAnalysisModalProps> = ({
  isOpen,
  targetCase,
  onAnalysisComplete,
}) => {
  const [stages, setStages] = useState<AnalysisStageStatus[]>(() =>
    FORENSIC_STAGES.map((s) => ({
      ...s,
      status: 'QUEUED',
      progress: 0,
    }))
  );

  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 50);

    let currentIndex = 0;
    const stageDuration = 380; // realistic processing time

    const interval = setInterval(() => {
      setStages((prev) => {
        const next = [...prev];
        // Mark past as complete
        for (let i = 0; i < currentIndex; i++) {
          next[i] = { ...next[i], status: 'COMPLETE', progress: 100 };
        }
        // Mark current as analyzing
        if (currentIndex < next.length) {
          next[currentIndex] = { ...next[currentIndex], status: 'ANALYZING', progress: 70 };
        }
        return next;
      });

      setCurrentStageIdx(currentIndex);
      currentIndex++;

      if (currentIndex > FORENSIC_STAGES.length) {
        clearInterval(interval);
        clearInterval(timerInterval);
        setTimeout(() => {
          onAnalysisComplete();
        }, 500);
      }
    }, stageDuration);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [isOpen, onAnalysisComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-[#090a0e] border border-[#232736] rounded-lg shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle Background Grid */}
        <div className="absolute inset-0 forensic-grid pointer-events-none opacity-20" />

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-[#1b1e2a] relative z-10 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f59b] animate-ping" />
            <span className="font-bold text-sm tracking-wider text-[#f4f4f6]">
              EXECUTION PIPELINE // MULTI-SOURCE FORENSIC INGESTION
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#8e919b]">
            <span>CASE: <strong className="text-[#00f59b]">{targetCase.caseId}</strong></span>
            <span>STATUS: <strong className="text-[#f59e0b]">PROCESSING</strong></span>
            <span>TIME: <strong className="text-[#f4f4f6]">{elapsedMs}ms</strong></span>
          </div>
        </div>

        {/* Center: Image Scan Window + Around Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 mb-6">
          {/* Left Stage Pipeline Status */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8e919b] mb-2">
              ANALYSIS PIPELINE STAGES
            </div>
            {stages.map((stage, idx) => {
              const isCurrent = stage.status === 'ANALYZING';
              const isComplete = stage.status === 'COMPLETE';
              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded border transition-all text-xs font-mono flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#151a24] border-[#00f59b] text-[#00f59b] shadow-[0_0_15px_rgba(0,245,155,0.15)]'
                      : isComplete
                      ? 'bg-[#0e1117] border-[#1d222e] text-[#f4f4f6]'
                      : 'bg-[#0a0b0e] border-[#161821] text-[#585b65]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[10px] opacity-70">0{idx + 1}</span>
                    <span className="truncate">{stage.name}</span>
                  </div>

                  <div>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#00f59b]/20 text-[#00f59b] animate-pulse">
                        ANALYZING...
                      </span>
                    )}
                    {isComplete && (
                      <span className="flex items-center gap-1 text-[10px] text-[#00f59b]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>OK</span>
                      </span>
                    )}
                    {stage.status === 'QUEUED' && (
                      <span className="text-[10px] text-[#585b65]">QUEUED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center: Image Raster with Real Scanline Animation */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#232736] bg-black shadow-2xl">
              <img
                src={targetCase.imageUrl}
                alt="Forensic Artifact"
                className="w-full h-full object-cover filter contrast-125 brightness-90"
              />

              {/* Grid & Reticles */}
              <div className="absolute inset-0 forensic-dot-grid opacity-40 pointer-events-none" />
              <div className="animate-scanline pointer-events-none" />

              {/* Target Bounding Box Animation */}
              <div
                className="absolute border border-[#00f59b] rounded pointer-events-none animate-pulse"
                style={{
                  left: `${targetCase.pixelForensics.regions[0]?.coordinates.x || 50}%`,
                  top: `${targetCase.pixelForensics.regions[0]?.coordinates.y || 22}%`,
                  width: `${targetCase.pixelForensics.regions[0]?.coordinates.width || 18}%`,
                  height: `${targetCase.pixelForensics.regions[0]?.coordinates.height || 12}%`,
                  boxShadow: '0 0 20px rgba(0, 245, 155, 0.4)',
                }}
              >
                <div className="absolute -top-5 left-0 font-mono text-[8px] bg-[#00f59b] text-black px-1 font-bold">
                  SPECTRAL SAMPLING // ROI-01
                </div>
              </div>

              {/* Coordinate Readout Overlays */}
              <div className="absolute bottom-3 left-3 bg-black/80 border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-[#00f59b]">
                FAST FOURIER TRANSFORM: EVALUATING RESIDUALS
              </div>
              <div className="absolute top-3 right-3 bg-black/80 border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-[#8e919b]">
                C2PA JUMBF: VALIDATING MANIFEST TREE
              </div>
            </div>
          </div>
        </div>

        {/* Technical Telemetry Strip */}
        <div className="p-4 rounded bg-[#0d0e14] border border-[#1d202d] grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-mono">
          <div>
            <div className="text-[10px] text-[#8e919b] uppercase">CASE IDENTIFIER</div>
            <div className="text-[#00f59b] font-bold">{targetCase.caseId}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8e919b] uppercase">SHA-256 HASH</div>
            <div className="text-[#f4f4f6] truncate font-mono">
              {targetCase.sha256Hash.substring(0, 14)}...
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#8e919b] uppercase">DIMENSIONS</div>
            <div className="text-[#f4f4f6]">{targetCase.metadata.dimensions}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8e919b] uppercase">CONTAINER FORMAT</div>
            <div className="text-[#f4f4f6]">{targetCase.fileFormat}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8e919b] uppercase">ANALYSIS CLOCK</div>
            <div className="text-[#f59e0b]">{elapsedMs} ms</div>
          </div>
        </div>
      </div>
    </div>
  );
};
