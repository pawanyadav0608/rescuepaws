import React from 'react';
import { RescueStatus, UrgencyLevel } from '../types';
import { AlertCircle, Clock, CheckCircle2, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: RescueStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<RescueStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    Reported: {
      label: 'Reported',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    Accepted: {
      label: 'Accepted',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    'In Progress': {
      label: 'In Progress',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    Rescued: {
      label: 'Rescued',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    Closed: {
      label: 'Closed',
      bg: 'bg-stone-100',
      text: 'text-stone-700',
      border: 'border-stone-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  };

  const c = configs[status] || configs['Reported'];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${c.bg} ${c.text} ${c.border} ${sizeClass}`}
    >
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
};

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  size?: 'sm' | 'md';
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, size = 'md' }) => {
  const configs: Record<UrgencyLevel, { label: string; bg: string; text: string; border: string; dot: string }> = {
    high: {
      label: 'High Urgency',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500 animate-pulse',
    },
    medium: {
      label: 'Medium Urgency',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    low: {
      label: 'Low Urgency',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  const c = configs[urgency] || configs['medium'];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${c.bg} ${c.text} ${c.border} ${sizeClass}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
};

export const AiVerifiedBadge: React.FC<{ confidence?: number }> = ({ confidence = 0.92 }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-medium whitespace-nowrap">
      <Sparkles className="w-3 h-3 text-purple-500" />
      <span>AI Triage ({Math.round(confidence * 100)}%)</span>
    </span>
  );
};
