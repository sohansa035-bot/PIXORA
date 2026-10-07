'use client';

import React from 'react';
import { EvidenceStatus } from '@/types/forensics';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Layers,
  FileCode,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface EvidenceNodeProps {
  id: string;
  label: string;
  sublabel?: string;
  sourceType: 'pixel' | 'metadata' | 'provenance' | 'synthetic' | 'context';
  status: EvidenceStatus;
  isActive: boolean;
  onClick: () => void;
  badge?: string;
}

export const EvidenceNode: React.FC<EvidenceNodeProps> = ({
  id,
  label,
  sublabel,
  sourceType,
  status,
  isActive,
  onClick,
  badge,
}) => {
  const getIcon = () => {
    switch (sourceType) {
      case 'pixel':
        return <Layers className="w-4 h-4 text-[#00f59b]" />;
      case 'metadata':
        return <FileCode className="w-4 h-4 text-[#f59e0b]" />;
      case 'provenance':
        return <KeyRound className="w-4 h-4 text-[#00f59b]" />;
      case 'synthetic':
        return <Sparkles className="w-4 h-4 text-[#a3f7d4]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#8e919b]" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'VERIFIED':
      case 'SUPPORTED':
        return {
          border: 'border-[#00f59b]',
          text: 'text-[#00f59b]',
          bg: 'bg-[#00f59b]/10',
          ring: 'ring-[#00f59b]/30',
        };
      case 'CONFLICT':
      case 'SUSPICIOUS':
        return {
          border: 'border-[#ef4444]',
          text: 'text-[#ef4444]',
          bg: 'bg-[#ef4444]/10',
          ring: 'ring-[#ef4444]/30',
        };
      case 'WARNING':
      case 'PARTIAL':
        return {
          border: 'border-[#f59e0b]',
          text: 'text-[#f59e0b]',
          bg: 'bg-[#f59e0b]/10',
          ring: 'ring-[#f59e0b]/30',
        };
      default:
        return {
          border: 'border-[#262a38]',
          text: 'text-[#8e919b]',
          bg: 'bg-[#12141c]',
          ring: 'ring-white/10',
        };
    }
  };

  const style = getStatusColor();

  return (
    <button
      onClick={onClick}
      className={`p-3.5 rounded-lg border font-mono text-xs transition-all flex items-center gap-3 relative shadow-lg ${
        isActive
          ? `bg-[#131722] ${style.border} ring-2 ${style.ring} text-[#f4f4f6]`
          : 'bg-[#0c0e14] border-[#1f2330] text-[#8e919b] hover:border-[#303648] hover:bg-[#10121a]'
      }`}
    >
      <div className="p-2 rounded bg-[#131622] border border-[#222736]">
        {getIcon()}
      </div>

      <div className="text-left min-w-0">
        <div className="text-[10px] uppercase text-[#8e919b] tracking-wider truncate">
          {id}
        </div>
        <div className="font-semibold text-xs text-[#f4f4f6] truncate">{label}</div>
        {sublabel && (
          <div className="text-[10px] text-[#585b65] truncate font-sans">{sublabel}</div>
        )}
      </div>

      <div className="ml-auto pl-2 flex flex-col items-end gap-1">
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${style.bg} ${style.border} ${style.text}`}
        >
          {badge || status}
        </span>
      </div>
    </button>
  );
};
