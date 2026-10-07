'use client';

import React, { useState, useRef } from 'react';
import { ForensicCase, SuspiciousRegion } from '@/types/forensics';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { HeatmapOverlay, FilterShaderMode } from './HeatmapOverlay';
import { ScanOverlay } from './ScanOverlay';

interface ForensicImageViewerProps {
  currentCase: ForensicCase;
  selectedRegion: SuspiciousRegion | null;
  onSelectRegion: (region: SuspiciousRegion | null) => void;
  viewerMode: FilterShaderMode;
  onChangeMode: (mode: FilterShaderMode) => void;
}

export const ForensicImageViewer: React.FC<ForensicImageViewerProps> = ({
  currentCase,
  selectedRegion,
  onSelectRegion,
  viewerMode,
  onChangeMode,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isSplitDragging, setIsSplitDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showRegionTooltip, setShowRegionTooltip] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // The 5 clean modes specified in Section 9
  const modes: Array<{ id: FilterShaderMode; label: string }> = [
    { id: 'ORIGINAL', label: 'Original' },
    { id: 'HEATMAP', label: 'Heatmap' },
    { id: 'ELA', label: 'ELA' },
    { id: 'NOISE', label: 'Noise' },
    { id: 'COMPARE', label: 'Compare' },
  ];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(3, Math.max(1, +(prev + delta).toFixed(1))));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));

    if (isSplitDragging) {
      setSplitPos(Math.max(5, Math.min(95, (relX / rect.width) * 100)));
      return;
    }

    if (isDragging && zoomLevel > 1) {
      setPanPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={() => {
        setIsDragging(false);
        setIsSplitDragging(false);
      }}
      className={`rounded-2xl bg-white border border-[#D6D0C5] overflow-hidden flex flex-col shadow-xs select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar: Compact Segmented Control + Minimal Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#FAF8F5] border-b border-[#D6D0C5]">
        {/* Compact Segmented Control (Section 9) */}
        <div className="inline-flex p-1 rounded-xl bg-white border border-[#D6D0C5] shadow-xs">
          {modes.map((m) => {
            const isActive = viewerMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onChangeMode(m.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-sans transition-all ${
                  isActive
                    ? 'bg-[#3155FF] text-white font-semibold shadow-xs'
                    : 'text-[#77736C] hover:text-[#111111]'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Quiet Zoom Controls */}
        <div className="flex items-center gap-1.5 text-[#77736C] text-xs">
          {zoomLevel > 1 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-[#D6D0C5] text-[#3155FF] font-semibold">
              {Math.round(zoomLevel * 100)}%
            </span>
          )}

          <button
            onClick={() => handleZoom(0.25)}
            className="p-1.5 rounded-lg hover:bg-white text-[#77736C] hover:text-[#111111] transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 rounded-lg hover:bg-white text-[#77736C] hover:text-[#111111] transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {zoomLevel > 1 && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-white text-[#77736C] hover:text-[#111111] transition-colors"
              title="Reset zoom"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-white text-[#77736C] hover:text-[#111111] transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        onMouseDown={(e) => {
          if (isSplitDragging) return;
          if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
          }
        }}
        className={`relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#111111] flex items-center justify-center ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${
              panPos.y / zoomLevel
            }px)`,
          }}
        >
          {/* Base Image Layer */}
          <img
            src={currentCase.imageUrl}
            alt={currentCase.title}
            className="w-full h-full object-contain"
          />

          {/* Smooth Filter Shader Layer */}
          {viewerMode !== 'ORIGINAL' && viewerMode !== 'COMPARE' && (
            <HeatmapOverlay imageUrl={currentCase.imageUrl} mode={viewerMode} />
          )}

          {/* COMPARE Split Slider Mode */}
          {viewerMode === 'COMPARE' && (
            <>
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
              >
                <HeatmapOverlay imageUrl={currentCase.imageUrl} mode="HEATMAP" />
                <div className="absolute top-4 right-4 bg-white/90 px-2.5 py-1 rounded-lg border border-[#3155FF] text-[10px] text-[#3155FF] font-mono font-bold shadow-xs">
                  HEATMAP
                </div>
              </div>

              <div
                className="absolute top-4 left-4 bg-white/90 px-2.5 py-1 rounded-lg border border-[#D6D0C5] text-[10px] text-[#111111] font-mono font-bold shadow-xs"
                style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
              >
                ORIGINAL
              </div>

              {/* Draggable Divider Handle */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsSplitDragging(true);
                }}
                className="absolute top-0 bottom-0 w-0.5 bg-[#3155FF] cursor-ew-resize z-30 flex items-center justify-center shadow-md"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-white border border-[#3155FF] shadow-sm flex items-center justify-center text-[10px] text-[#3155FF] font-bold">
                  ⇄
                </div>
              </div>
            </>
          )}

          {/* Scanline Overlay */}
          <ScanOverlay cursorPos={{ x: 742, y: 381, relX: 52, relY: 24 }} active={viewerMode === 'ORIGINAL'} />

          {/* Spatial Localization Annotation — ONLY rendered if genuine localized regions exist (RULE 8: NO FABRICATED SPATIAL EVIDENCE) */}
          {currentCase.pixelForensics.regions && currentCase.pixelForensics.regions.length > 0 && currentCase.pixelForensics.regions.map((reg) => (
            <div
              key={reg.id}
              onClick={(e) => {
                e.stopPropagation();
                setShowRegionTooltip(!showRegionTooltip);
                onSelectRegion(reg);
              }}
              className="absolute border-2 border-[#3155FF] rounded-sm cursor-pointer z-20 group transition-all"
              style={{
                left: `${reg.coordinates.x}%`,
                top: `${reg.coordinates.y}%`,
                width: `${reg.coordinates.width}%`,
                height: `${reg.coordinates.height}%`,
                boxShadow: '0 0 16px rgba(49, 85, 255, 0.4)',
              }}
            >
              {/* Direct Image Annotation Label */}
              <div className="absolute -top-7 left-0 bg-[#111111]/90 backdrop-blur-xs text-white font-sans text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3155FF] animate-pulse" />
                <span className="font-semibold">{reg.label}</span>
                <span className="text-white/60">•</span>
                <span className="text-white/80">Focal Indicator</span>
              </div>

              {/* Contextual Explanation Tooltip */}
              {showRegionTooltip && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full mt-2 left-0 z-40 w-64 bg-white/95 border border-[#D6D0C5] rounded-xl p-3 shadow-xl backdrop-blur-md space-y-1.5 text-xs font-sans animate-in fade-in duration-100"
                >
                  <div className="flex items-center justify-between font-semibold text-[#111111]">
                    <span>{reg.label}</span>
                    <span className="text-[10px] text-[#3155FF] font-mono font-bold">{Math.round(reg.confidence * 100)}% CONFIDENCE</span>
                  </div>
                  <p className="text-[11px] text-[#77736C] leading-snug">
                    {reg.observation}
                  </p>
                  <div className="pt-1 text-[10px] text-[#3155FF] font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{reg.limitations}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Global Frame Measurement Badge when no localized regions exist */}
          {(!currentCase.pixelForensics.regions || currentCase.pixelForensics.regions.length === 0) && (
            <div className="absolute bottom-3 left-3 bg-[#111111]/85 backdrop-blur-xs border border-white/10 text-white font-mono text-[10px] px-2.5 py-1 rounded flex items-center gap-2 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>GLOBAL FRAME MEASUREMENT (No localized spatial contours)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
