import React from 'react';
import { UrgencyLevel } from '../types';

interface MapPinProps {
  urgency: UrgencyLevel;
  isSelected?: boolean;
  animalType?: string;
}

export const MapPin: React.FC<MapPinProps> = ({
  urgency,
  isSelected = false,
}) => {
  const colors = {
    high: {
      bg: 'bg-rose-600',
      border: 'border-white',
      shadow: 'shadow-rose-300',
      ring: 'ring-rose-400',
    },
    medium: {
      bg: 'bg-amber-500',
      border: 'border-white',
      shadow: 'shadow-amber-200',
      ring: 'ring-amber-300',
    },
    low: {
      bg: 'bg-emerald-600',
      border: 'border-white',
      shadow: 'shadow-emerald-200',
      ring: 'ring-emerald-300',
    },
  };

  const c = colors[urgency] || colors.medium;

  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-200 ${
        isSelected ? 'scale-125 z-50' : 'hover:scale-110'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full ${c.bg} ${c.border} border-2 flex items-center justify-center shadow-lg text-white font-bold text-xs ring-4 ${
          isSelected ? `${c.ring} ring-offset-2 scale-110` : 'ring-black/10'
        }`}
      >
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <div
        className={`absolute -bottom-1 w-2 h-2 rotate-45 ${c.bg}`}
      />
    </div>
  );
};

// Helper for generating custom Leaflet DivIcon HTML
export function createLeafletPinHtml(urgency: UrgencyLevel, isSelected = false): string {
  const bg = urgency === 'high' ? '#e11d48' : urgency === 'medium' ? '#f59e0b' : '#059669';
  const pulse = urgency === 'high' ? '<div class="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping"></div>' : '';
  const selectedRing = isSelected ? 'border: 3px solid #0f172a; box-shadow: 0 0 0 3px rgba(255,255,255,0.9); transform: scale(1.2);' : 'border: 2.5px solid #ffffff;';

  return `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${pulse}
      <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: ${bg}; ${selectedRing} display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); transition: all 0.2s ease;">
        <svg style="width: 18px; height: 18px; color: white;" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
    </div>
  `;
}
