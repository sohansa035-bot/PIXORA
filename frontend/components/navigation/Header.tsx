'use client';

import React, { useState, useEffect } from 'react';
import { ForensicCase } from '@/types/forensics';
import { Shield, ChevronDown, CheckCircle2, AlertTriangle, FileText, Activity, Layers, UploadCloud } from 'lucide-react';

interface HeaderProps {
  currentCase: ForensicCase;
  allCases: ForensicCase[];
  onSelectCase: (caseId: string) => void;
  onOpenUpload: () => void;
  onNavigateSection: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentCase,
  allCases,
  onSelectCase,
  onOpenUpload,
  onNavigateSection,
  activeSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCaseDropdownOpen, setIsCaseDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'image', label: 'IMAGE & FINDINGS' },
    { id: 'evidence', label: 'EVIDENCE' },
    { id: 'conflicts', label: 'CONFLICTS' },
    { id: 'assessment', label: 'ASSESSMENT' },
    { id: 'report', label: 'REPORT' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 no-print ${
        isScrolled
          ? 'bg-[#080808]/95 backdrop-blur-md border-b border-[#1f222b] py-2.5 shadow-2xl'
          : 'bg-gradient-to-b from-[#080808] to-transparent border-b border-[#1f222b]/40 py-4'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigateSection('landing')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-sm bg-[#12141a] border border-[#232733] flex items-center justify-center group-hover:border-[#00f59b] transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-[#00f59b]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="w-4 h-4 text-[#00f59b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-widest text-[#f4f4f6]">
                  PIXORA
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#161821] text-[#00f59b] border border-[#00f59b]/30">
                  v2.6 FORENSIC
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-wider text-[#8e919b] font-mono -mt-0.5">
                EVIDENCE-AWARE DIGITAL IMAGE FORENSICS
              </p>
            </div>
          </button>

          {/* Active Case Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCaseDropdownOpen(!isCaseDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#0d0e12] border border-[#222530] hover:border-[#323746] transition-all text-xs font-mono text-[#f4f4f6]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f59b] animate-pulse" />
              <span className="text-[#8e919b]">DOCKET:</span>
              <span className="text-[#00f59b] font-semibold">{currentCase.caseId}</span>
              <span className="text-[#8e919b] max-w-[140px] truncate text-[11px]">
                {currentCase.originalFileName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8e919b]" />
            </button>

            {isCaseDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-80 bg-[#0d0e12] border border-[#262a36] rounded shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setIsCaseDropdownOpen(false)}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8e919b] px-2 py-1 border-b border-[#1f222b] mb-1">
                  Active Forensic Dockets
                </div>
                {allCases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c.id);
                      setIsCaseDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded transition-colors text-xs font-mono flex items-start gap-2.5 ${
                      c.id === currentCase.id
                        ? 'bg-[#161922] text-[#00f59b] border border-[#00f59b]/30'
                        : 'text-[#d1d3db] hover:bg-[#14161f]'
                    }`}
                  >
                    <div className="mt-0.5">
                      {c.assessment.outcome === 'INCONCLUSIVE' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00f59b]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{c.caseId}</span>
                        <span className="text-[10px] opacity-70 uppercase">{c.fileFormat}</span>
                      </div>
                      <p className="text-[11px] text-[#8e919b] truncate">{c.title}</p>
                    </div>
                  </button>
                ))}

                <div className="pt-2 mt-1 border-t border-[#1f222b]">
                  <button
                    onClick={() => {
                      setIsCaseDropdownOpen(false);
                      onOpenUpload();
                    }}
                    className="w-full py-1.5 px-2 flex items-center justify-center gap-2 rounded bg-[#161922] hover:bg-[#1f2330] text-xs font-mono text-[#00f59b] border border-[#00f59b]/20"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>INGEST NEW ARTIFACT</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigateSection(item.id)}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeSection === item.id
                  ? 'text-[#00f59b] bg-[#12141c] border border-[#00f59b]/30 font-semibold'
                  : 'text-[#8e919b] hover:text-[#f4f4f6] hover:bg-[#12141a]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateSection('report')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-[#12141a] hover:bg-[#1a1d26] border border-[#222530] text-xs font-mono text-[#d1d3db] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#8e919b]" />
            <span>DOSSIER</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-[#00f59b] hover:bg-[#10ffaa] text-[#080808] font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,245,155,0.25)] hover:shadow-[0_0_25px_rgba(0,245,155,0.4)] active:scale-[0.98]"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#080808]" />
            <span>START INVESTIGATION</span>
          </button>
        </div>
      </div>
    </header>
  );
};
