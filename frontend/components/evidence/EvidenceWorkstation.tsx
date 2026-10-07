'use client';

import React, { useState } from 'react';
import { ForensicCase, SuspiciousRegion } from '@/types/forensics';
import { ForensicImageViewer, ViewerMode } from '@/components/image-viewer/ForensicImageViewer';
import { PixelForensicsPanel } from '@/components/evidence/PixelForensicsPanel';
import { MetadataPanel } from '@/components/evidence/MetadataPanel';
import { ProvenancePanel } from '@/components/evidence/ProvenancePanel';
import { SyntheticPanel } from '@/components/evidence/SyntheticPanel';
import { EvidenceGraph } from '@/components/evidence/EvidenceGraph';
import { Layers, FileCode, KeyRound, Sparkles, Network, Eye } from 'lucide-react';

interface EvidenceWorkstationProps {
  currentCase: ForensicCase;
}

export const EvidenceWorkstation: React.FC<EvidenceWorkstationProps> = ({ currentCase }) => {
  const [activePanel, setActivePanel] = useState<'pixel' | 'metadata' | 'provenance' | 'synthetic'>('pixel');
  const [selectedRegion, setSelectedRegion] = useState<SuspiciousRegion | null>(
    currentCase.pixelForensics.regions[0] || null
  );
  const [viewerMode, setViewerMode] = useState<ViewerMode>('HEATMAP');
  const [activeTab, setActiveTab] = useState<'inspector' | 'graph'>('inspector');

  const navTabs = [
    { id: 'pixel' as const, label: 'PIXEL FORENSICS', icon: Layers, badge: `${Math.round(currentCase.pixelForensics.confidence * 100)}%` },
    { id: 'metadata' as const, label: 'METADATA & EXIF', icon: FileCode, badge: currentCase.metadata.software ? 'WARN' : 'OK' },
    { id: 'provenance' as const, label: 'PROVENANCE (C2PA)', icon: KeyRound, badge: currentCase.provenance.status },
    { id: 'synthetic' as const, label: 'SYNTHETIC SPECTRA', icon: Sparkles, badge: 'SPECTRAL' },
  ];

  return (
    <div id="workstation" className="space-y-8">
      {/* Workstation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1f222f]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00f59b] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#00f59b]">
              DIGITAL FORENSICS
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-mono font-bold text-[#f4f4f6]">
            IMAGE & FINDINGS
          </h2>
          <p className="text-xs text-[#8e919b] font-sans">
            Multi-spectral inspection deck. Examine pixel residuals, container metadata, and
            hardware cryptographic roots simultaneously.
          </p>
        </div>

        {/* View Switcher between Inspector Panels and Node Topology Graph */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0c0d12] border border-[#222530] rounded-lg font-mono text-xs">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
              activeTab === 'inspector'
                ? 'bg-[#00f59b] text-black font-bold shadow'
                : 'text-[#8e919b] hover:text-[#f4f4f6]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>DECK & INSPECTORS</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
              activeTab === 'graph'
                ? 'bg-[#00f59b] text-black font-bold shadow'
                : 'text-[#8e919b] hover:text-[#f4f4f6]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>RELATIONSHIP TOPOLOGY</span>
          </button>
        </div>
      </div>

      {/* Main Workstation Layout */}
      {activeTab === 'inspector' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Forensic Image Viewer Workstation (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <ForensicImageViewer
              currentCase={currentCase}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              viewerMode={viewerMode}
              onChangeMode={setViewerMode}
            />

            {/* Quick Context Strip */}
            <div className="p-3.5 rounded bg-[#0a0c10] border border-[#1b1f2b] flex items-center justify-between text-xs font-mono text-[#8e919b]">
              <span className="truncate">
                QUESTION: <strong className="text-[#f4f4f6]">{currentCase.investigationTarget}</strong>
              </span>
              <span className="text-[#00f59b] hidden sm:inline flex-shrink-0 ml-2">
                ISO 27037 CALIBRATED
              </span>
            </div>
          </div>

          {/* Right Column: Tabbed Evidence Inspectors (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Inspector Navigation Tabs */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activePanel === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`p-2.5 rounded border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-[#141822] border-[#00f59b] text-[#f4f4f6] shadow-[0_0_15px_rgba(0,245,155,0.1)]'
                        : 'bg-[#0a0b10] border-[#1c1f2c] text-[#8e919b] hover:border-[#2a2f40]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00f59b]' : 'text-[#8e919b]'}`} />
                      <span className="truncate">{tab.label.split(' ')[0]}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10131c] text-[#00f59b] font-bold">
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Panel Component */}
            <div className="transition-all duration-150">
              {activePanel === 'pixel' && (
                <PixelForensicsPanel
                  data={currentCase.pixelForensics}
                  selectedRegion={selectedRegion}
                  onSelectRegion={setSelectedRegion}
                />
              )}
              {activePanel === 'metadata' && (
                <MetadataPanel data={currentCase.metadata} />
              )}
              {activePanel === 'provenance' && (
                <ProvenancePanel data={currentCase.provenance} />
              )}
              {activePanel === 'synthetic' && (
                <SyntheticPanel data={currentCase.synthetic} />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Topological Graph Mode */
        <EvidenceGraph
          currentCase={currentCase}
          activePanel={activePanel}
          onSelectPanel={(p) => {
            setActivePanel(p);
            setActiveTab('inspector');
          }}
        />
      )}
    </div>
  );
};
