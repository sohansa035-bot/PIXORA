'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ForensicCase, SuspiciousRegion } from '@/types/forensics';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Layers,
  Crosshair,
  Info,
  AlertTriangle,
  Flame,
  Activity,
  Cpu,
} from 'lucide-react';

export type ViewerMode =
  | 'ORIGINAL'
  | 'HEATMAP'
  | 'ELA'
  | 'NOISE'
  | 'EDGE'
  | 'METADATA'
  | 'COMPARE';

interface ForensicImageViewerProps {
  currentCase: ForensicCase;
  selectedRegion: SuspiciousRegion | null;
  onSelectRegion: (region: SuspiciousRegion | null) => void;
  viewerMode: ViewerMode;
  onChangeMode: (mode: ViewerMode) => void;
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
  const [splitPos, setSplitPos] = useState<number>(50); // percentage for COMPARE mode
  const [isSplitDragging, setIsSplitDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredRegion, setHoveredRegion] = useState<SuspiciousRegion | null>(null);
  const [cursorReadout, setCursorReadout] = useState({ x: 0, y: 0, pxX: 0, pxY: 0 });
  const [isMagnifierActive, setIsMagnifierActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const modes: Array<{ id: ViewerMode; label: string; icon: React.ElementType; desc: string }> = [
    { id: 'ORIGINAL', label: 'ORIGINAL', icon: Eye, desc: 'Decoded RGB pixel buffer' },
    { id: 'HEATMAP', label: 'HEATMAP', icon: Flame, desc: 'Manipulation probability density' },
    { id: 'ELA', label: 'ELA', icon: Layers, desc: 'Error Level Analysis recompression' },
    { id: 'NOISE', label: 'NOISE', icon: Activity, desc: 'High-frequency sensor variance' },
    { id: 'EDGE', label: 'EDGE', icon: SlidersHorizontal, desc: 'Laplacian gradient discontinuity' },
    { id: 'METADATA', label: 'METADATA', icon: Info, desc: 'Quantization & EXIF overlay' },
    { id: 'COMPARE', label: 'COMPARE', icon: SlidersHorizontal, desc: 'Interactive split-screen slider' },
  ];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(3.5, Math.max(1, +(prev + delta).toFixed(1))));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSplitDragging) return;
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const relY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const pxX = Math.round((relX / rect.width) * currentCase.metadata.width);
    const pxY = Math.round((relY / rect.height) * currentCase.metadata.height);

    setCursorReadout({
      x: Math.round((relX / rect.width) * 100),
      y: Math.round((relY / rect.height) * 100),
      pxX,
      pxY,
    });

    if (isSplitDragging) {
      const newSplit = Math.max(5, Math.min(95, (relX / rect.width) * 100));
      setSplitPos(newSplit);
      return;
    }

    if (isDragging && zoomLevel > 1) {
      setPanPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsSplitDragging(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const activeTooltipRegion = hoveredRegion || selectedRegion;

  // Filter effect style mapping
  const getFilterStyle = (mode: ViewerMode) => {
    switch (mode) {
      case 'HEATMAP':
        return 'contrast-175 saturate-200 hue-rotate-140 brightness-110';
      case 'ELA':
        return 'contrast-200 saturate-150 brightness-75 hue-rotate-45 filter invert-10';
      case 'NOISE':
        return 'grayscale contrast-250 brightness-110';
      case 'EDGE':
        return 'grayscale invert contrast-300';
      case 'METADATA':
        return 'brightness-90 sepia-25';
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative rounded-lg bg-[#07080a] border border-[#232736] overflow-hidden flex flex-col shadow-2xl select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0a0c10] border-b border-[#1c202d] z-20 text-xs font-mono">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = viewerMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onChangeMode(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-[#00f59b] text-black font-bold shadow-[0_0_12px_rgba(0,245,155,0.3)]'
                    : 'bg-[#12141c] text-[#8e919b] hover:text-[#f4f4f6] hover:bg-[#1a1d27] border border-[#222530]'
                }`}
                title={m.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Viewport Zoom & Action Tools */}
        <div className="flex items-center gap-1.5 text-xs text-[#8e919b]">
          <span className="text-[11px] px-2 py-1 bg-[#12141c] rounded border border-[#222530] text-[#00f59b]">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={() => handleZoom(0.25)}
            className="p-1.5 rounded bg-[#12141c] hover:bg-[#1a1d27] text-[#d1d3db] border border-[#222530]"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 rounded bg-[#12141c] hover:bg-[#1a1d27] text-[#d1d3db] border border-[#222530]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded bg-[#12141c] hover:bg-[#1a1d27] text-[#d1d3db] border border-[#222530]"
            title="Fit to Screen"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMagnifierActive(!isMagnifierActive)}
            className={`p-1.5 rounded border text-xs ${
              isMagnifierActive
                ? 'bg-[#00f59b]/20 border-[#00f59b] text-[#00f59b]'
                : 'bg-[#12141c] border-[#222530] text-[#8e919b] hover:text-[#f4f4f6]'
            }`}
            title="Toggle Inspection Loupe"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#12141c] hover:bg-[#1a1d27] text-[#d1d3db] border border-[#222530]"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Raster Workspace Area */}
      <div
        onMouseDown={handleMouseDown}
        className={`relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black flex items-center justify-center ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
        }`}
      >
        {/* Render container with zoom and pan transform */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${
              panPos.y / zoomLevel
            }px)`,
          }}
        >
          {/* Base Layer */}
          <img
            ref={imageRef}
            src={currentCase.imageUrl}
            alt={currentCase.title}
            className={`w-full h-full object-contain ${
              viewerMode === 'COMPARE' ? '' : getFilterStyle(viewerMode)
            }`}
          />

          {/* COMPARE Split Slider Layer */}
          {viewerMode === 'COMPARE' && (
            <>
              {/* Filtered side clipped by split */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
              >
                <img
                  src={currentCase.imageUrl}
                  alt="Forensic Map"
                  className={`w-full h-full object-contain ${getFilterStyle('HEATMAP')}`}
                />
                <div className="absolute top-4 right-4 bg-black/80 px-2 py-1 rounded border border-[#00f59b] font-mono text-[10px] text-[#00f59b]">
                  FORENSIC RESIDUAL MAP
                </div>
              </div>

              <div
                className="absolute top-4 left-4 bg-black/80 px-2 py-1 rounded border border-white/20 font-mono text-[10px] text-white"
                style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
              >
                ORIGINAL RASTER
              </div>

              {/* Draggable Divider Handle */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsSplitDragging(true);
                }}
                className="absolute top-0 bottom-0 w-1 bg-[#00f59b] cursor-ew-resize z-30 flex items-center justify-center shadow-[0_0_15px_#00f59b]"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-black border-2 border-[#00f59b] flex items-center justify-center text-[10px] text-[#00f59b] font-bold">
                  ⇄
                </div>
              </div>
            </>
          )}

          {/* Metadata Overlay Grid */}
          {viewerMode === 'METADATA' && (
            <div className="absolute inset-0 bg-[#00f59b]/5 p-6 pointer-events-none flex flex-col justify-between font-mono text-xs">
              <div className="bg-black/85 p-3 rounded border border-[#00f59b]/40 max-w-sm space-y-1">
                <div className="text-[#00f59b] font-bold text-xs">QUANTIZATION ANALYSIS</div>
                <div className="text-[11px] text-[#8e919b]">
                  PRIMARY: {currentCase.metadata.jpegCharacteristics}
                </div>
                <div className="text-[11px] text-[#8e919b]">
                  SOFTWARE: {currentCase.metadata.software}
                </div>
                <div className="text-[11px] text-[#f59e0b]">
                  HASH MATCH: {currentCase.metadata.thumbnailMatch ? 'VERIFIED' : 'DESYNCHRONIZED'}
                </div>
              </div>
            </div>
          )}

          {/* Suspicious Regions Bounding Boxes */}
          {currentCase.pixelForensics.regions.map((region) => {
            const isHovered = hoveredRegion?.id === region.id;
            const isSelected = selectedRegion?.id === region.id;
            return (
              <div
                key={region.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRegion(isSelected ? null : region);
                }}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`absolute border-2 rounded-sm cursor-pointer transition-all duration-200 ${
                  isSelected || isHovered
                    ? 'border-[#ef4444] bg-[#ef4444]/15 shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20'
                    : 'border-[#ef4444]/80 bg-[#ef4444]/5 hover:border-[#ef4444]'
                }`}
                style={{
                  left: `${region.coordinates.x}%`,
                  top: `${region.coordinates.y}%`,
                  width: `${region.coordinates.width}%`,
                  height: `${region.coordinates.height}%`,
                }}
              >
                {/* Region Tag */}
                <div className="absolute -top-6 left-0 bg-[#ef4444] text-black font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-t flex items-center gap-1 shadow">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>{region.id}: {region.technique}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loupe / Magnifier Lens */}
        {isMagnifierActive && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#00f59b] overflow-hidden w-36 h-36 bg-black z-30 shadow-[0_0_25px_rgba(0,245,155,0.4)]"
            style={{
              left: `${cursorReadout.x}%`,
              top: `${cursorReadout.y}%`,
            }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${currentCase.imageUrl})`,
                backgroundPosition: `${cursorReadout.x}% ${cursorReadout.y}%`,
                backgroundSize: '400%',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-[#00f59b]/80" />
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#00f59b] bg-black/90 px-1 rounded">
              4X ZOOM
            </div>
          </div>
        )}

        {/* Forensic Region Tooltip */}
        {activeTooltipRegion && (
          <div className="absolute top-4 right-4 z-40 w-80 bg-[#0d0f15]/95 border border-[#ef4444]/60 rounded-lg p-3.5 shadow-2xl backdrop-blur-md font-mono text-xs animate-in fade-in slide-in-from-right-2 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232738]">
              <div className="flex items-center gap-1.5 text-[#ef4444] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{activeTooltipRegion.id}</span>
              </div>
              <span className="text-[10px] text-[#f59e0b] px-1.5 py-0.5 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                CONFIDENCE: {Math.round(activeTooltipRegion.confidence * 100)}%
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-[#8e919b]">CLASSIFICATION:</span>{' '}
                <strong className="text-[#f4f4f6]">{activeTooltipRegion.label}</strong>
              </div>
              <div>
                <span className="text-[#8e919b]">POSSIBLE TECHNIQUE:</span>{' '}
                <strong className="text-[#00f59b]">{activeTooltipRegion.technique}</strong>
              </div>
              <div>
                <span className="text-[#8e919b]">COORDINATES:</span>{' '}
                <span className="text-[#f4f4f6]">
                  X: {activeTooltipRegion.coordinates.x}%, Y: {activeTooltipRegion.coordinates.y}% (W:{' '}
                  {activeTooltipRegion.coordinates.width}%, H: {activeTooltipRegion.coordinates.height}%)
                </span>
              </div>
              <div className="pt-1.5 border-t border-[#1d212d] text-[#8e919b] font-sans text-[11px] leading-snug">
                {activeTooltipRegion.observation}
              </div>
              {activeTooltipRegion.limitations && (
                <div className="pt-1 text-[#ef4444]/90 text-[10px]">
                  <strong>LIMITATION:</strong> {activeTooltipRegion.limitations}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#090b0e] border-t border-[#1b1f2b] text-xs font-mono text-[#8e919b]">
        <div className="flex items-center gap-4">
          <span>
            ACTIVE MODE: <strong className="text-[#00f59b]">{viewerMode}</strong>
          </span>
          <span className="hidden sm:inline">
            PIXEL COORDS: <span className="text-[#f4f4f6]">[{cursorReadout.pxX}, {cursorReadout.pxY}]</span>
          </span>
          <span className="hidden md:inline">
            NORMALIZED: <span className="text-[#00f59b]">[{cursorReadout.x}%, {cursorReadout.y}%]</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#8e919b]">
            REGIONS IDENTIFIED: <strong className="text-[#ef4444]">{currentCase.pixelForensics.regions.length}</strong>
          </span>
          <span className="text-[10px] text-[#585b65]">
            ANALYTICAL MAP • ZERO DECORATIVE BLUR
          </span>
        </div>
      </div>
    </div>
  );
};
