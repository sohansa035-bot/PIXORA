'use client';

import React from 'react';

export type FilterShaderMode =
  | 'ORIGINAL'
  | 'HEATMAP'
  | 'ELA'
  | 'NOISE'
  | 'EDGE'
  | 'COMPARE';

interface HeatmapOverlayProps {
  imageUrl: string;
  mode: FilterShaderMode;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ imageUrl, mode }) => {
  const getFilterClass = () => {
    switch (mode) {
      case 'HEATMAP':
        return 'contrast-[1.8] saturate-[2.4] hue-rotate-[135deg] brightness-110';
      case 'ELA':
        return 'contrast-[2.2] saturate-[1.6] brightness-75 hue-rotate-[45deg] filter invert-[0.1]';
      case 'NOISE':
        return 'grayscale contrast-[2.8] brightness-110';
      case 'EDGE':
        return 'grayscale invert contrast-[3.2]';
      default:
        return '';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500">
      <img
        src={imageUrl}
        alt="Forensic Shader Layer"
        className={`w-full h-full object-contain transition-all duration-500 ${getFilterClass()}`}
      />
    </div>
  );
};
