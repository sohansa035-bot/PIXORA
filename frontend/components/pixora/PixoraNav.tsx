'use client';

import React, { useState, useEffect } from 'react';
import { ForensicCase } from '@/types/forensics';
import { Shield, ArrowRight } from 'lucide-react';

interface PixoraNavProps {
  currentCase: ForensicCase;
  allCases: ForensicCase[];
  onSelectCase: (caseId: string) => void;
  onOpenUpload: () => void;
  onNavigateSection: (sectionId: string) => void;
  activeSection: string;
}

export const PixoraNav: React.FC<PixoraNavProps> = ({
  onOpenUpload,
  onNavigateSection,
  activeSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'image', label: 'IMAGE' },
    { id: 'evidence', label: 'EVIDENCE' },
    { id: 'assessment', label: 'ASSESSMENT' },
    { id: 'report', label: 'REPORT' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 no-print ${
        isScrolled
          ? 'bg-[#F4F0E8]/95 backdrop-blur-md border-b border-[#D6D0C5] py-3 shadow-sm'
          : 'bg-[#F4F0E8]/90 backdrop-blur-md border-b border-[#D6D0C5]/70 py-4'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand */}
        <button
          onClick={() => onNavigateSection('landing')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-[#D6D0C5] flex items-center justify-center group-hover:border-[#3155FF] transition-colors shadow-xs">
            <Shield className="w-4 h-4 text-[#3155FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-widest text-[#111111]">
                PIXORA
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#3155FF]/10 text-[#3155FF] font-semibold">
                DIGITAL FORENSICS
              </span>
            </div>
          </div>
        </button>

        {/* Center: 4 Primary Navigation Items */}
        <div className="hidden sm:flex items-center gap-1 font-mono text-xs">
          {navLinks.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateSection(item.id)}
                className={`px-4 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#3155FF] bg-white border border-[#D6D0C5] font-bold shadow-xs'
                    : 'text-[#77736C] hover:text-[#111111] hover:bg-white/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right: NEW INVESTIGATION CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3155FF] hover:bg-[#2345E5] text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all shadow-md shadow-[#3155FF]/20 active:scale-[0.98]"
          >
            <span>NEW INVESTIGATION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
};
