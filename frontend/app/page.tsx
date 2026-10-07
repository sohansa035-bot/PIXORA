'use client';

import React, { useState } from 'react';
import { ForensicCase } from '@/types/forensics';
import { MOCK_CASES } from '@/lib/mock/cases';
import { ForensicsAPI, StartInvestigationOptions } from '@/lib/api/forensics';
import {
  PixoraNav,
  EvidencePanel,
  EvidenceSection,
  AssessmentCard,
  ForensicReport,
  InvestigationHeader,
  AnalysisProgress,
} from '@/components/pixora';
import {
  UploadCloud,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const [allCases, setAllCases] = useState<ForensicCase[]>(() => Object.values(MOCK_CASES));
  const [currentCase, setCurrentCase] = useState<ForensicCase>(MOCK_CASES['PX-2026-00142']);
  const [activeSection, setActiveSection] = useState<string>('image');
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);

  // Scanning animation state (Section 8: INGESTING → EXAMINING → CORRELATING → ASSESSING)
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [targetScanCase, setTargetScanCase] = useState<ForensicCase>(MOCK_CASES['PX-2026-00142']);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -75;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSelectCase = (caseId: string) => {
    const found = allCases.find((c) => c.id === caseId) || MOCK_CASES[caseId];
    if (found) {
      setTargetScanCase(found);
      setIsScanning(true);
    }
  };

  const [backendError, setBackendError] = useState<string | null>(null);

  const handleStartAnalysis = async (options: StartInvestigationOptions) => {
    setIsSetupOpen(false);
    setBackendError(null);
    try {
      const prepared = await ForensicsAPI.startInvestigation(options);
      setAllCases((prev) => {
        if (prev.some((c) => c.id === prepared.id)) return prev;
        return [prepared, ...prev];
      });
      setTargetScanCase(prepared);
      setIsScanning(true);
    } catch (err: any) {
      console.error('LIVE FORENSIC BACKEND ERROR:', err);
      setBackendError(err.message || 'FORENSIC_BACKEND_UNAVAILABLE');
    }
  };

  const handleStartInvestigationLanding = () => {
    setTargetScanCase(currentCase);
    setIsScanning(true);
  };

  const handleScanComplete = () => {
    setCurrentCase(targetScanCase);
    setIsScanning(false);
    setTimeout(() => {
      scrollToSection('image');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#111111] flex flex-col selection:bg-[#3155FF] selection:text-white font-sans">
      {/* Global Navigation (Section 5) */}
      <PixoraNav
        currentCase={currentCase}
        allCases={allCases}
        onSelectCase={handleSelectCase}
        onOpenUpload={() => setIsSetupOpen(true)}
        onNavigateSection={scrollToSection}
        activeSection={activeSection}
      />

      <main className="flex-1 pt-20">
        {/* =========================================================================
            SECTION 7: EDITORIAL LANDING / EMPTY STATE
            Hero:
            EVERY IMAGE
            LEAVES
            EVIDENCE.

            Subtitle:
            “Investigate suspicious images across pixels, metadata and provenance —
            then understand what the evidence can actually support.”

            Primary CTA: START INVESTIGATION →
            Secondary CTA: INGEST IMAGE

            Below hero:
            PIXELS · METADATA · PROVENANCE · ASSESSMENT
           ========================================================================= */}
        <section id="landing" className="relative pt-12 pb-20 border-b border-[#D6D0C5] overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column (7 cols): Spacious Editorial Typography */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <h1 className="font-editorial text-6xl sm:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] text-[#111111] leading-[0.88] tracking-tight mb-6">
                  EVERY IMAGE <br />
                  <span className="italic font-light text-[#3155FF]">leaves</span> <br />
                  EVIDENCE.
                </h1>

                <p className="text-lg sm:text-xl text-[#77736C] font-sans max-w-xl leading-relaxed mb-8 font-normal">
                  Investigate suspicious images across pixels, metadata and provenance &mdash; then understand what the evidence can actually support.
                </p>

                {/* Primary CTA & Secondary CTA (Section 7) */}
                <div className="flex flex-wrap items-center gap-3 text-xs mb-8">
                  <button
                    onClick={handleStartInvestigationLanding}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#3155FF] hover:bg-[#2345E5] text-white font-semibold tracking-wide uppercase transition-all shadow-md shadow-[#3155FF]/20 active:scale-[0.98]"
                  >
                    <span>START INVESTIGATION</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsSetupOpen(true)}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D6D0C5] hover:border-[#111111] text-[#111111] font-semibold transition-all shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4 text-[#3155FF]" />
                    <span>INGEST IMAGE</span>
                  </button>
                </div>

                {/* Subtle Explanation Below Hero (Section 7): PIXELS · METADATA · PROVENANCE · ASSESSMENT */}
                <div className="pt-4 border-t border-[#D6D0C5] flex flex-wrap items-center gap-4 text-xs font-mono text-[#77736C]">
                  <span className="hover:text-[#111111] transition-colors">PIXELS</span>
                  <span>·</span>
                  <span className="hover:text-[#111111] transition-colors">METADATA</span>
                  <span>·</span>
                  <span className="hover:text-[#111111] transition-colors">PROVENANCE</span>
                  <span>·</span>
                  <span className="hover:text-[#111111] transition-colors">ASSESSMENT</span>
                </div>

                {/* Benchmark Case Selector Chips */}
                <div className="pt-4 mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#77736C] font-mono text-[11px] uppercase mr-1">BENCHMARK:</span>
                  {allCases.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCase(c.id)}
                      className={`px-3 py-1 rounded-lg border font-mono text-xs transition-colors ${
                        c.id === currentCase.id
                          ? 'bg-white border-[#3155FF] text-[#3155FF] font-bold shadow-xs'
                          : 'bg-white/60 border-[#D6D0C5] text-[#77736C] hover:text-[#111111] hover:border-[#111111]'
                      }`}
                    >
                      {c.caseId} ({c.pixelForensics.technique})
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column (5 cols): Large Photographic Preview */}
              <div className="lg:col-span-5">
                <div className="p-3 bg-white rounded-2xl border border-[#D6D0C5] shadow-lg overflow-hidden">
                  <div
                    onClick={handleStartInvestigationLanding}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#111111] cursor-pointer group"
                  >
                    <img
                      src={currentCase.imageUrl}
                      alt={currentCase.title}
                      className="w-full h-full object-cover filter contrast-105"
                    />

                    {/* Subtle Blue Scanning Line */}
                    <div className="animate-scanline-blue pointer-events-none" />

                    {/* Detected Anomaly Tag */}
                    <div
                      className="absolute border-2 border-[#3155FF] rounded-xs pointer-events-none"
                      style={{
                        left: '50%',
                        top: '22%',
                        width: '20%',
                        height: '14%',
                        boxShadow: '0 0 16px rgba(49, 85, 255, 0.4)',
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-[#3155FF] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                        REGION 03 (0.84)
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 px-1 flex items-center justify-between text-xs text-[#77736C]">
                    <span className="font-mono text-[11px] truncate max-w-[200px]">
                      {currentCase.originalFileName}
                    </span>
                    <button
                      onClick={handleStartInvestigationLanding}
                      className="text-[#3155FF] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Examine evidence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            INVESTIGATION WORKSPACE (One Continuous, Calm Investigation)
            1. Image Workspace & Key Finding (Section 9, 10, 11)
            2. Evidence & Conflict Handling (Section 12, 13, 14, 15)
            3. Assessment & Recommendation (Section 16, 17)
            4. Executive Report Preview (Section 19)
           ========================================================================= */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
          {/* 1. IMAGE WORKSPACE */}
          <section id="image">
            <EvidencePanel
              currentCase={currentCase}
              onViewEvidence={() => scrollToSection('evidence')}
              onOpenSwitchCase={() => setIsSetupOpen(true)}
            />
          </section>

          {/* 2. EVIDENCE */}
          <section id="evidence">
            <EvidenceSection currentCase={currentCase} />
          </section>

          {/* 3. ASSESSMENT */}
          <section id="assessment">
            <AssessmentCard
              currentCase={currentCase}
              onOpenReport={() => scrollToSection('report')}
            />
          </section>

          {/* 4. REPORT */}
          <section id="report">
            <ForensicReport
              currentCase={currentCase}
              onClose={() => scrollToSection('image')}
            />
          </section>
        </div>
      </main>

      {/* Forensic Scanning Modal Animation (Section 8) */}
      <AnalysisProgress
        isOpen={isScanning}
        targetCase={targetScanCase}
        onComplete={handleScanComplete}
      />

      {/* Forensic Backend Unavailable Modal (RULE 2: NO SILENT SIMULATION) */}
      {backendError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border-2 border-[#F04444] rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-left">
            <div className="flex items-center gap-3 text-[#F04444]">
              <div className="w-10 h-10 rounded-xl bg-[#FEECEC] border border-[#F04444]/30 flex items-center justify-center font-bold text-lg">
                !
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold tracking-wider text-[#111111]">
                  FORENSIC BACKEND UNAVAILABLE
                </h3>
                <p className="text-xs text-[#77736C]">
                  Live ingestion failed: {backendError}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] text-xs text-[#77736C] space-y-2">
              <p className="font-semibold text-[#111111]">
                Forensic Integrity Notice:
              </p>
              <p>
                In accordance with forensic evidentiary standards, PIXORA will NOT silently simulate analysis results when the live forensic analysis pipeline is unreachable.
              </p>
              <p className="font-mono text-[11px] text-[#3155FF]">
                Target endpoint: http://localhost:8000/api/investigate
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBackendError(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F0E8] border border-[#D6D0C5] text-xs font-semibold text-[#111111] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setBackendError(null);
                  setIsSetupOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#3155FF] hover:bg-[#2345E5] text-xs font-semibold text-white transition-colors"
              >
                Retry Ingestion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (Section 8) */}
      <InvestigationHeader
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartAnalysis={handleStartAnalysis}
        presetCases={allCases}
      />

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-[#D6D0C5] bg-[#FAF8F5] text-xs text-[#77736C] no-print">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-[#111111] font-bold">
            <span>PIXORA</span>
            <span className="text-[#77736C] font-normal">• Digital Image Forensics</span>
          </div>

          <div className="text-[#77736C]">
            &copy; 2026 PIXORA FORENSIC SYSTEMS
          </div>
        </div>
      </footer>
    </div>
  );
}
