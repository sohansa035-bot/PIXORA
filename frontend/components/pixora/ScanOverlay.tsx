'use client';

import React from 'react';

interface ScanOverlayProps {
  cursorPos?: { x: number; y: number; relX: number; relY: number };
  active?: boolean;
  showCoordinates?: boolean;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  cursorPos = { x: 742, y: 381, relX: 52, relY: 24 },
  active = true,
  showCoordinates = true,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Subtle Coordinate Grid Lines */}
      <div className="absolute inset-0 editorial-dot-grid opacity-25" />

      {/* Animated Horizontal Scanning Beam in Electric Blue */}
      {active && (
        <div
          className="animate-scanline-blue"
        />
      )}

      {/* Reticle Corner Quadrants */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 font-mono text-[9px] text-[#3155FF] bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-[#3155FF]/30 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3155FF] animate-ping" />
        <span className="font-bold">OPTICAL // L-01</span>
      </div>

      <div className="absolute top-3 right-3 font-mono text-[9px] text-[#77736C] bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-[#D6D0C5] shadow-sm">
        SNR: 38.4 dB • SENSOR: BAYER CFA
      </div>

      {showCoordinates && (
        <div className="absolute bottom-3 left-3 font-mono text-[9px] text-[#77736C] bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-[#D6D0C5] shadow-sm flex items-center gap-2.5">
          <span>
            COORD: <strong className="text-[#111111]">X:{cursorPos.relX}% Y:{cursorPos.relY}%</strong>
          </span>
          <span className="text-[#D6D0C5]">|</span>
          <span>
            RASTER: <strong className="text-[#3155FF]">[{cursorPos.x}, {cursorPos.y}]</strong>
          </span>
        </div>
      )}

      <div className="absolute bottom-3 right-3 font-mono text-[9px] text-[#3155FF] bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-[#3155FF]/30 shadow-sm font-semibold">
        RASTER INSPECTOR ACTIVE
      </div>
    </div>
  );
};
