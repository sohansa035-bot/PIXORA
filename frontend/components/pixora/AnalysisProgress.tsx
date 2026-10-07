'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForensicCase } from '@/types/forensics';
import { Check, ArrowRight } from 'lucide-react';

interface AnalysisProgressProps {
  isOpen: boolean;
  targetCase: ForensicCase;
  onComplete: () => void;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  isOpen,
  targetCase,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // The 4-stage progression strictly mandated in Section 8:
  // INGESTING → EXAMINING → CORRELATING → ASSESSING
  const stages = [
    {
      id: 'INGESTING',
      label: 'INGESTING',
      description: 'Preserving image integrity and calculating SHA-256 digest',
    },
    {
      id: 'EXAMINING',
      label: 'EXAMINING',
      description: 'Analyzing pixel frequencies, noise distributions, and metadata',
    },
    {
      id: 'CORRELATING',
      label: 'CORRELATING',
      description: 'Verifying provenance credentials and checking signal consistency',
    },
    {
      id: 'ASSESSING',
      label: 'ASSESSING',
      description: 'Evaluating sufficiency threshold and formulating objective determination',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < stages.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 350);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, onComplete, stages.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md font-sans select-none"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#F4F0E8] border border-[#D6D0C5] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="space-y-1 pb-4 border-b border-[#D6D0C5]">
            <div className="text-[11px] font-mono font-bold text-[#3155FF] uppercase tracking-wider">
              PIXORA FORENSICS
            </div>
            <h3 className="font-editorial text-3xl text-[#111111]">
              Analyzing image…
            </h3>
            <p className="text-xs text-[#77736C] font-mono truncate">
              {targetCase.originalFileName}
            </p>
          </div>

          {/* Image Scanning Preview */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#111111] border border-[#D6D0C5]">
            <img
              src={targetCase.imageUrl}
              alt="Analyzing specimen"
              className="w-full h-full object-cover filter contrast-105"
            />
            {/* Subtle blue scanning beam */}
            <div className="animate-scanline-blue pointer-events-none" />
          </div>

          {/* The 4-Stage Progression (Section 8) */}
          <div className="space-y-2">
            {stages.map((stage, idx) => {
              const isDone = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-white border-[#3155FF] shadow-xs text-[#111111]'
                      : isDone
                      ? 'bg-white/80 border-[#D6D0C5] text-[#111111]'
                      : 'bg-[#FAF8F5] border-[#E7E2D8] text-[#77736C]/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 flex items-center justify-center">
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-[#2B4E08] font-bold" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-[#3155FF] animate-ping" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6D0C5]" />
                      )}
                    </span>
                    <span className={`font-mono text-xs ${isCurrent ? 'font-bold text-[#3155FF]' : ''}`}>
                      {stage.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#77736C] hidden sm:inline">
                    {isDone ? 'Completed' : isCurrent ? 'Inspecting…' : 'Queued'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer action to skip if in a hurry */}
          <div className="pt-2 flex items-center justify-between border-t border-[#D6D0C5] text-xs">
            <span className="text-[11px] text-[#77736C]">Calm, evidence-aware assessment</span>
            <button
              onClick={onComplete}
              className="text-[#3155FF] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Skip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
