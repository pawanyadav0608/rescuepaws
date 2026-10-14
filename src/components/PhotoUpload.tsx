import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Camera, Check } from 'lucide-react';

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  onAiDetected?: (animalType: string, urgency: string) => void;
}

const SAMPLE_RESCUE_PHOTOS = [
  {
    title: 'Injured Golden Dog',
    type: 'dog',
    urgency: 'high',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Trapped Calico Cat',
    type: 'cat',
    urgency: 'high',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Grounded Hawk',
    type: 'bird',
    urgency: 'medium',
    url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Roaming Friendly Dog',
    type: 'dog',
    urgency: 'low',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
  },
];

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  onAiDetected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSamples, setShowSamples] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const selectSample = (sample: typeof SAMPLE_RESCUE_PHOTOS[0]) => {
    onChange(sample.url);
    if (onAiDetected) {
      onAiDetected(sample.type, sample.urgency);
    }
    setShowSamples(false);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 group">
          <img
            src={value}
            alt="Animal preview"
            referrerPolicy="no-referrer"
            className="w-full h-44 sm:h-64 object-cover object-center group-hover:opacity-95 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-white text-[11px] sm:text-xs font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Photo attached for AI triage
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-white/95 hover:bg-white text-stone-800 text-xs font-medium shadow-sm transition-colors cursor-pointer"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-stone-900/80 hover:bg-red-600 text-white shadow-sm transition-colors cursor-pointer"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-5 sm:p-8 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer text-center select-none active:bg-teal-50/70 ${
            isDragging
              ? 'border-teal-600 bg-teal-50/50'
              : 'border-stone-300 hover:border-teal-500 bg-stone-50/60 hover:bg-stone-50'
          }`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center mb-2.5">
            <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <p className="text-sm sm:text-base font-semibold text-stone-900 mb-1">
            Take or upload photo of the animal
          </p>
          <p className="text-[11px] sm:text-xs text-stone-500 max-w-sm mb-3.5 leading-relaxed">
            Clear photos help AI detect species & assess urgency instantly.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center min-h-[44px] gap-2 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:bg-teal-800 transition-colors">
              <UploadCloud className="w-4 h-4" />
              Take Photo / Choose File
            </span>
          </div>
        </div>
      )}

      {/* Quick sample photos helper for instant preview and testing */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-stone-500 font-medium">
          Testing in browser without a camera?
        </span>
        <button
          type="button"
          onClick={() => setShowSamples(!showSamples)}
          className="text-xs text-teal-700 font-semibold hover:text-teal-800 underline cursor-pointer"
        >
          {showSamples ? 'Hide demo photos' : 'Pick a demo rescue photo'}
        </button>
      </div>

      {showSamples && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-stone-100 rounded-xl border border-stone-200">
          {SAMPLE_RESCUE_PHOTOS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectSample(sample)}
              className="text-left group relative rounded-lg overflow-hidden border border-stone-300 hover:border-teal-600 focus:outline-none transition-all cursor-pointer bg-white"
            >
              <img
                src={sample.url}
                alt={sample.title}
                referrerPolicy="no-referrer"
                className="w-full h-20 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="p-1.5">
                <p className="text-[11px] font-medium text-stone-800 truncate">
                  {sample.title}
                </p>
                <span className="text-[10px] text-stone-500 capitalize">
                  {sample.type} • {sample.urgency}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
