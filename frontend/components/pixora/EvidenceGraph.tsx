'use client';

import React, { useState } from 'react';
import { ForensicCase } from '@/types/forensics';
import {
  AlertTriangle,
  CheckCircle2,
  Shield,
  Layers,
  FileCode,
  KeyRound,
  MessageSquare,
  Globe,
  Info,
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'pixel' | 'metadata' | 'provenance' | 'image' | 'caption' | 'source';
  status: 'VERIFIED' | 'SUPPORTED' | 'WARNING' | 'CONFLICT' | 'MISSING';
  x: number;
  y: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'SUPPORTS' | 'CONFLICTS' | 'CONSISTENT_WITH' | 'DOES_NOT_ESTABLISH' | 'MISSING' | 'UNKNOWN';
  label: string;
  explanation: string;
}

interface EvidenceGraphProps {
  currentCase: ForensicCase;
  onSelectNode?: (nodeId: string) => void;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ currentCase, onSelectNode }) => {
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('image');

  const nodes: GraphNode[] = [
    { id: 'image', label: 'Original Raster', type: 'image', status: 'VERIFIED', x: 50, y: 50 },
    { id: 'provenance', label: 'C2PA Credential', type: 'provenance', status: currentCase.provenance.status === 'VERIFIED' ? 'VERIFIED' : 'MISSING', x: 50, y: 14 },
    { id: 'pixel', label: 'Pixel Anomaly', type: 'pixel', status: 'CONFLICT', x: 84, y: 50 },
    { id: 'metadata', label: 'Software Metadata', type: 'metadata', status: 'WARNING', x: 16, y: 50 },
    { id: 'caption', label: 'Investigative Claim', type: 'caption', status: 'SUPPORTED', x: 26, y: 84 },
    { id: 'source', label: 'Independent Source', type: 'source', status: 'MISSING', x: 74, y: 84 },
  ];

  const edges: GraphEdge[] = [
    {
      id: 'e-pixel-provenance',
      source: 'pixel',
      target: 'provenance',
      type: 'CONFLICTS',
      label: 'CONFLICTS',
      explanation:
        'Pixel evidence indicates localized splicing on Region-01, while C2PA provenance asserts a valid camera capture without recorded edit actions.',
    },
    {
      id: 'e-metadata-pixel',
      source: 'metadata',
      target: 'pixel',
      type: 'SUPPORTS',
      label: 'CORROBORATES',
      explanation:
        'Adobe Photoshop re-compression quantization table corroborates the localized residual variance observed in the raster.',
    },
    {
      id: 'e-metadata-provenance',
      source: 'metadata',
      target: 'provenance',
      type: 'CONFLICTS',
      label: 'UNTRACKED EDIT',
      explanation:
        'Metadata tags reveal image editor execution, yet the hardware manifest contains zero downstream edit assertions.',
    },
    {
      id: 'e-image-pixel',
      source: 'image',
      target: 'pixel',
      type: 'CONSISTENT_WITH',
      label: 'LOCALIZED REGION',
      explanation: 'Spatial bounding box links directly to high-frequency Laplacian boundary on Region #03.',
    },
    {
      id: 'e-image-metadata',
      source: 'image',
      target: 'metadata',
      type: 'SUPPORTS',
      label: 'CONTAINER MATCH',
      explanation: 'JPEG standard Huffman tables align with image raster dimensions.',
    },
    {
      id: 'e-caption-image',
      source: 'caption',
      target: 'image',
      type: 'DOES_NOT_ESTABLISH',
      label: 'UNVERIFIED CLAIM',
      explanation:
        'Public social media claims cannot be corroborated without secondary sensor viewpoints.',
    },
    {
      id: 'e-source-image',
      source: 'source',
      target: 'image',
      type: 'MISSING',
      label: 'NO SECONDARY FEED',
      explanation: 'No independent radar, flight manifest, or alternate viewpoint is attached to the docket.',
    },
  ];

  const getNodeIcon = (type: GraphNode['type']) => {
    switch (type) {
      case 'pixel':
        return <Layers className="w-3.5 h-3.5 text-[#F04444]" />;
      case 'metadata':
        return <FileCode className="w-3.5 h-3.5 text-[#FF8A3D]" />;
      case 'provenance':
        return <KeyRound className="w-3.5 h-3.5 text-[#2B4E08]" />;
      case 'caption':
        return <MessageSquare className="w-3.5 h-3.5 text-[#77736C]" />;
      case 'source':
        return <Globe className="w-3.5 h-3.5 text-[#77736C]" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-[#3155FF]" />;
    }
  };

  const getEdgeStroke = (type: GraphEdge['type']) => {
    switch (type) {
      case 'CONFLICTS':
        return '#F04444';
      case 'SUPPORTS':
      case 'CONSISTENT_WITH':
        return '#3E6B08';
      case 'DOES_NOT_ESTABLISH':
      case 'MISSING':
      default:
        return '#D6D0C5';
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-[#D6D0C5] p-6 sm:p-8 shadow-sm relative font-mono text-xs overflow-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D6D0C5]">
        <div>
          <h3 className="text-2xl font-bold text-[#111111] tracking-tight">
            Evidence Relationships
          </h3>
          <p className="text-xs text-[#77736C] font-sans mt-0.5">
            Editorial diagram mapping verified credentials, pixel anomalies, and detected conflicts.
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#77736C]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B7E43A]" />
            <span className="font-semibold text-[#111111]">SUPPORT</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F04444] animate-ping" />
            <span className="font-semibold text-[#F04444]">CONFLICT</span>
          </span>
        </div>
      </div>

      {/* Editorial Canvas */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-4xl mx-auto my-2 bg-[#FAF8F5] rounded-2xl border border-[#D6D0C5] overflow-hidden select-none">
        <div className="absolute inset-0 editorial-dot-grid opacity-30 pointer-events-none" />

        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          {edges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.source);
            const tgt = nodes.find((n) => n.id === edge.target);
            if (!src || !tgt) return null;

            const isSelected = selectedEdge?.id === edge.id;
            const isConflict = edge.type === 'CONFLICTS';
            const strokeColor = getEdgeStroke(edge.type);

            return (
              <g key={edge.id} className="cursor-pointer" onClick={() => setSelectedEdge(edge)}>
                {/* Invisible wide click target */}
                <line
                  x1={`${src.x}%`}
                  y1={`${src.y}%`}
                  x2={`${tgt.x}%`}
                  y2={`${tgt.y}%`}
                  stroke="transparent"
                  strokeWidth="24"
                />

                {/* Visible Edge Line */}
                <line
                  x1={`${src.x}%`}
                  y1={`${src.y}%`}
                  x2={`${tgt.x}%`}
                  y2={`${tgt.y}%`}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '3' : isConflict ? '2' : '1.5'}
                  strokeDasharray={isConflict ? '6 4' : edge.type === 'MISSING' ? '3 3' : undefined}
                />

                {/* Center Badge */}
                <rect
                  x={`${(src.x + tgt.x) / 2 - 4.5}%`}
                  y={`${(src.y + tgt.y) / 2 - 2}%`}
                  width="9%"
                  height="4%"
                  rx="4"
                  fill="#FFFFFF"
                  stroke={strokeColor}
                  strokeWidth="1"
                />
                <text
                  x={`${(src.x + tgt.x) / 2}%`}
                  y={`${(src.y + tgt.y) / 2 + 0.9}%`}
                  fill={strokeColor}
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {isConflict ? '⚡ CONFLICT' : edge.type.substring(0, 8)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isCenterImage = node.id === 'image';
          return (
            <div
              key={node.id}
              onClick={() => {
                setSelectedNodeId(node.id);
                onSelectNode?.(node.id);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform hover:scale-105"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className={`p-2.5 sm:p-3 rounded-xl border font-mono text-[11px] flex items-center gap-2.5 shadow-md ${
                  isCenterImage
                    ? 'bg-white border-[#3155FF] ring-4 ring-[#3155FF]/10 text-[#111111]'
                    : isSelected
                    ? 'bg-white border-[#3155FF] ring-2 ring-[#3155FF]/30 text-[#111111]'
                    : node.status === 'CONFLICT'
                    ? 'bg-[#FFF8F8] border-[#F04444] text-[#F04444]'
                    : 'bg-white border-[#D6D0C5] text-[#111111]'
                }`}
              >
                <div className="p-1 rounded-lg bg-[#FAF8F5] border border-[#D6D0C5]">
                  {getNodeIcon(node.type)}
                </div>
                <div>
                  <div className="font-bold truncate max-w-[120px] text-[#111111]">
                    {node.label}
                  </div>
                  <div className="text-[9px] text-[#77736C] uppercase font-semibold">
                    {node.status}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Edge Detail */}
      {selectedEdge ? (
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span
              className={`flex items-center gap-2 ${
                selectedEdge.type === 'CONFLICTS' ? 'text-[#F04444]' : 'text-[#3E6B08]'
              }`}
            >
              {selectedEdge.type === 'CONFLICTS' ? (
                <AlertTriangle className="w-4 h-4 text-[#F04444]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#3E6B08]" />
              )}
              <span>RELATIONSHIP: {selectedEdge.label}</span>
            </span>
            <span className="text-[10px] text-[#77736C]">
              {selectedEdge.source.toUpperCase()} ⟷ {selectedEdge.target.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[#111111] font-sans leading-relaxed">
            {selectedEdge.explanation}
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D6D0C5] text-[11px] text-[#77736C] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#3155FF]" />
          <span>Click any connection vector or node above to inspect forensic relationship logic.</span>
        </div>
      )}
    </div>
  );
};
