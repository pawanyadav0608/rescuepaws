import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Info,
  ChevronRight,
  Phone,
  Crosshair,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PhotoUpload } from '../components/PhotoUpload';
import { InteractiveMap } from '../components/InteractiveMap';
import { createReport } from '../api/reports';
import { AnimalType, UrgencyLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { EMERGENCY_HOTLINE_TEL, EMERGENCY_HOTLINE_NUMBER } from '../components/EmergencyCallBar';

const ANIMAL_CHIPS: { type: AnimalType; label: string; icon: string }[] = [
  { type: 'dog', label: 'Dog', icon: '🐕' },
  { type: 'cat', label: 'Cat', icon: '🐈' },
  { type: 'bird', label: 'Bird', icon: '🦅' },
  { type: 'other', label: 'Wildlife', icon: '🐾' },
  { type: 'unknown', label: 'Unsure', icon: '❓' },
];

export const ReportFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form State
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [animalType, setAnimalType] = useState<AnimalType>('unknown');
  const [description, setDescription] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('medium');
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [address, setAddress] = useState<string>('Market & 4th Street, San Francisco, CA');
  const [reporterName, setReporterName] = useState<string>(user?.name || '');
  const [reporterPhone, setReporterPhone] = useState<string>(user?.phone || '');

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI autofill assistant hook
  const handleAiDetection = (detectedType: string, urgency: string) => {
    if (animalType === 'unknown' && detectedType) {
      setAnimalType(detectedType as AnimalType);
    }
    if (urgency) {
      setUrgencyLevel(urgency as UrgencyLevel);
    }
  };

  const handleLocationPicked = (coords: { lat: number; lng: number }) => {
    setLocation(coords);
    setAddress(`Geotag: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl && !description) {
      setErrorMsg('Please upload a photo or enter a brief description so volunteers know what to look for.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    setSubmittingStep('Uploading photo & running AI emergency triage...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmittingStep('Matching nearest active volunteers...');
      await new Promise((resolve) => setTimeout(resolve, 400));

      const newReport = await createReport({
        animal_type: animalType,
        description: description || 'Animal found in distress. See photo for visual assessment.',
        photo_url: photoUrl,
        lat: location.lat,
        lng: location.lng,
        urgency_level: urgencyLevel,
        address: address,
        reporter_name: reporterName || 'Anonymous Citizen',
        reporter_phone: reporterPhone,
      });

      setCreatedReportId(newReport.id);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen - Optimized for Phone
  if (createdReportId) {
    return (
      <div className="min-h-screen bg-stone-50 py-6 sm:py-12 px-3.5 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-5 sm:p-8 bg-white border-teal-200 shadow-md">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-1.5">
            Rescue Alert Dispatched!
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed">
            Your report is live on the community rescue map. AI triage matched local responders nearby.
          </p>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left mb-5 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Incident ID:</span>
              <span className="font-mono font-semibold text-stone-800">{createdReportId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Urgency Level:</span>
              <span className="capitalize font-bold text-rose-700">{urgencyLevel} Priority</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Animal Type:</span>
              <span className="capitalize font-medium text-stone-800">{animalType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Responders Alerted:</span>
              <span className="font-semibold text-teal-700">3 nearby volunteers</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button
              variant="primary"
              size="lg"
              className="w-full min-h-[48px] text-sm font-bold shadow-sm"
              onClick={() => navigate(`/reports/${createdReportId}`)}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Track Rescue Status Live
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full min-h-[48px] text-sm"
              onClick={() => navigate('/map')}
            >
              View on Live Map
            </Button>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                setCreatedReportId(null);
                setPhotoUrl('');
                setDescription('');
                setAnimalType('unknown');
              }}
              className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer p-1"
            >
              Submit another animal report
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-4 sm:py-8 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto pb-6">
        {/* Header - Compact for Mobile */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Incident Intake</span>
            </div>
            <a
              href={EMERGENCY_HOTLINE_TEL}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold active:bg-emerald-100"
            >
              <Phone className="w-3 h-3 fill-current text-emerald-600" />
              <span>Urgent? Call {EMERGENCY_HOTLINE_NUMBER}</span>
            </a>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Report an Injured or Stray Animal
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Quick mobile triage. Local volunteer responders will be alerted immediately.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Action needed</p>
              <p className="text-red-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* 1. Photo Upload Section */}
          <Card className="bg-white p-3.5 sm:p-5 border-stone-200">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  1. Animal Photo
                </h2>
                <p className="text-[11px] text-stone-500">
                  AI uses this to identify species and evaluate trauma
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                High Priority
              </span>
            </div>

            <PhotoUpload
              value={photoUrl}
              onChange={setPhotoUrl}
              onAiDetected={handleAiDetection}
            />
          </Card>

          {/* 2. Embedded Location Picker */}
          <Card className="bg-white p-3.5 sm:p-5 border-stone-200">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  2. Incident Location
                </h2>
                <p className="text-[11px] text-stone-500">
                  Tap map or use GPS coordinates to drop rescue pin
                </p>
              </div>
              <span className="text-[10px] text-stone-500 font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
              </span>
            </div>

            <InteractiveMap
              mode="picker"
              selectedLat={location.lat}
              selectedLng={location.lng}
              onLocationSelect={handleLocationPicked}
              className="h-56 sm:h-72 w-full mb-2.5"
            />

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Landmark / Street Address
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near park entrance bench, alleyway behind grocery"
                  className="w-full pl-8 pr-3 py-2 sm:py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </Card>

          {/* 3. Description & Animal Details */}
          <Card className="bg-white p-3.5 sm:p-5 border-stone-200 space-y-3.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 mb-0.5">
                3. Condition & Animal Type
              </h2>
              <p className="text-[11px] text-stone-500">
                Helps volunteers arrive with the appropriate crates, nets, or medical kit
              </p>
            </div>

            {/* Animal Type Fast Touch Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                Animal Type (Tap to Select)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {ANIMAL_CHIPS.map((chip) => {
                  const isSelected = animalType === chip.type;
                  return (
                    <button
                      key={chip.type}
                      type="button"
                      onClick={() => setAnimalType(chip.type)}
                      className={`min-h-[44px] p-1.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'bg-teal-700 border-teal-700 text-white font-bold shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-sm sm:text-base">{chip.icon}</span>
                      <span className="text-[10px] leading-tight truncate w-full">{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgency Assessment - 3 Large Touch Segments */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-stone-700">
                  Urgency Assessment
                </label>
                <span className="text-[10px] text-stone-400">
                  Select perceived condition
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as UrgencyLevel[]).map((lvl) => {
                  const isSelected = urgencyLevel === lvl;
                  const colors = {
                    low: isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200',
                    medium: isSelected
                      ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200',
                    high: isSelected
                      ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200',
                  };
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgencyLevel(lvl)}
                      className={`min-h-[44px] py-2 px-2 text-xs capitalize rounded-xl border transition-all cursor-pointer active:scale-95 ${colors[lvl]}`}
                    >
                      {lvl === 'high' ? 'High / Critical' : lvl}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                *High: Active bleeding, immobile, trapped, or immediate traffic danger.
              </p>
            </div>

            {/* Description textarea */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Situation & Behavior Details
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Visible injuries, limping, aggressive or frightened, exact spot..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none resize-none"
              />
            </div>
          </Card>

          {/* 4. Reporter Contact (Optional) */}
          <Card className="bg-white p-3.5 sm:p-5 border-stone-200">
            <h2 className="text-sm sm:text-base font-bold text-stone-900 mb-0.5">
              4. Reporter Contact (Optional)
            </h2>
            <p className="text-[11px] text-stone-500 mb-2.5">
              Allows the assigned volunteer to text or call if the animal moves
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="e.g. (555) 019-2834"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Submit Action - High Contrast, 50px Touch Target */}
          <div className="pt-2 pb-6">
            <Button
              type="submit"
              variant="danger"
              size="lg"
              className="w-full min-h-[50px] text-sm sm:text-base font-bold shadow-md shadow-rose-900/20 active:scale-[0.99]"
              isLoading={isSubmitting}
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              {isSubmitting ? submittingStep : 'Submit Emergency Animal Report'}
            </Button>
            <p className="text-center text-[10px] sm:text-xs text-stone-500 mt-2">
              By submitting, location and photo are instantly broadcast to local animal responders.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
