'use client';

import React, { useState } from 'react';
import {
  Binary,
  Layers,
  FileCode,
  ShieldCheck,
  GitBranch,
  Network,
  CheckCircle,
  Award,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface TimelineStage {
  id: string;
  name: string;
  subname: string;
  annotations: string[];
}

export const ForensicTimeline: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages: TimelineStage[] = [
    {
      id: 'INGEST',
      name: 'INGEST',
      subname: 'BIT-STREAM & FORMAT DECODE',
      annotations: ['SHA-256 fingerprint', 'ICC color profile', 'bit-depth validation'],
    },
    {
      id: 'PIXEL',
      name: 'PIXEL',
      subname: 'SPATIAL & ELA RESIDUALS',
      annotations: ['localized anomalies', 'copy-move', 'splicing', 'inpainting', 'compression artifacts'],
    },
    {
      id: 'METADATA',
      name: 'METADATA',
      subname: 'CONTAINER FORENSICS',
      annotations: ['EXIF tags', 'software signatures', 'timestamps', 'JPEG structure & DQT'],
    },
    {
      id: 'PROVENANCE',
      name: 'PROVENANCE',
      subname: 'CONTENT CREDENTIALS',
      annotations: ['Content Credentials', 'C2PA manifests', 'hardware root signatures'],
    },
    {
      id: 'NORMALIZE',
      name: 'NORMALIZE',
      subname: 'EVIDENCE NORMALIZATION',
      annotations: ['signal calibration', 'quality weighting', 'applicability bounds'],
    },
    {
      id: 'RELATE',
      name: 'RELATE',
      subname: 'EVIDENCE RELATIONSHIPS',
      annotations: ['corroboration graph', 'conflict detection', 'dependency mapping'],
    },
    {
      id: 'SUFFICIENCY',
      name: 'SUFFICIENCY',
      subname: 'DECISION ELIGIBILITY',
      annotations: ['completeness ratio', 'consistency threshold', 'uncertainty gating'],
    },
    {
      id: 'DECIDE',
      name: 'DECIDE',
      subname: 'EXPLAINABLE ASSESSMENT',
      annotations: ['calibrated findings', 'explicit boundaries', 'examiner report docket'],
    },
  ];

  return (
    <section id="methodology" className="py-20 border-b border-[#1b1e28] bg-[#07080b] font-mono text-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00f59b]" />
            <span className="text-[10px] uppercase tracking-widest text-[#00f59b]">
              EVIDENCE PIPELINE
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-light tracking-tight text-[#f4f4f6]">
            Cinematic Investigation Timeline.
          </h2>
          <p className="text-xs text-[#8e919b] font-sans mt-2">
            Progressive multi-spectral pipeline. Experience how raw bitstreams transform into
            legally defensible evidentiary assessments.
          </p>
        </div>

        {/* Horizontal Pipeline Steps with SVG Connecting Lines */}
        <div className="relative overflow-x-auto pb-4 pt-2">
          <div className="min-w-[980px] flex items-center justify-between relative">
            {/* Background SVG Flow Vector */}
            <svg className="absolute top-1/2 left-0 right-0 w-full h-8 -translate-y-1/2 pointer-events-none">
              <line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#1f2330"
                strokeWidth="2"
              />
              <line
                x1="0"
                y1="50%"
                x2={`${((activeStage + 1) / stages.length) * 100}%`}
                y2="50%"
                stroke="#00f59b"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-pulse transition-all duration-500"
              />
            </svg>

            {stages.map((st, idx) => {
              const isActive = activeStage === idx;
              const isPast = idx < activeStage;
              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStage(idx)}
                  className="group relative z-10 flex flex-col items-center text-center transition-all focus:outline-none"
                  style={{ width: `${100 / stages.length}%` }}
                >
                  {/* Step Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isActive
                        ? 'bg-[#00f59b] text-black shadow-[0_0_20px_rgba(0,245,155,0.5)] scale-110'
                        : isPast
                        ? 'bg-[#151924] border-2 border-[#00f59b] text-[#00f59b]'
                        : 'bg-[#0e1017] border border-[#232736] text-[#8e919b] group-hover:border-[#383e52]'
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  {/* Node Label */}
                  <div className="mt-3 space-y-0.5">
                    <div
                      className={`text-xs font-bold tracking-wider ${
                        isActive ? 'text-[#00f59b]' : 'text-[#f4f4f6]'
                      }`}
                    >
                      {st.name}
                    </div>
                    <div className="text-[9px] text-[#8e919b] truncate max-w-[100px]">
                      {st.subname}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Technical Annotation Deep Dive */}
        <div className="p-6 rounded-lg bg-[#0d0f15] border border-[#222634] shadow-2xl relative">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 mb-4 border-b border-[#1b1e28]">
            <div className="flex items-center gap-2 text-[#00f59b]">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                STAGE 0{activeStage + 1} {'//'} {stages[activeStage].name}
              </span>
            </div>
            <div className="text-[10px] text-[#8e919b]">
              PROGRESSIVE FORENSIC SPECIFICATION
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stages[activeStage].annotations.map((ann, aIdx) => (
              <div
                key={aIdx}
                className="p-3 rounded bg-[#11131c] border border-[#1e222e] flex items-center gap-2.5 text-xs text-[#f4f4f6]"
              >
                <span className="text-[#00f59b] font-bold">›</span>
                <span>{ann}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
