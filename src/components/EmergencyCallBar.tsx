import React, { useState } from 'react';
import { Phone, PhoneCall, AlertTriangle, ShieldCheck, X, PlusCircle, Clock, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const EMERGENCY_HOTLINE_NUMBER = '1-800-737-2832';
export const EMERGENCY_HOTLINE_TEL = 'tel:18007372832';

export const EmergencyCallBar: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();

  const isReportPage = location.pathname === '/report';

  return (
    <>
      {/* Fixed Thumb-Reachable Emergency Bottom Bar for Phones */}
      <aside 
        aria-label="Emergency rescue hotline"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-sm border-t border-stone-200 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(0.65rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto flex items-center gap-2">
          {/* Main Primary Thumb Call Button */}
          <a
            href={EMERGENCY_HOTLINE_TEL}
            id="emergency-call-button"
            className="flex-1 min-h-[48px] px-3.5 py-2.5 rounded-xl bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-between shadow-sm active:scale-[0.99] transition-transform select-none cursor-pointer"
            onClick={(e) => {
              // On touch devices this will initiate tel prompt; also allow opening details if clicked on modal trigger
            }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
              <div className="text-left">
                <div className="flex items-center gap-1 leading-tight">
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span className="tracking-wide">Call Dispatch</span>
                </div>
                <span className="text-[10px] text-emerald-100 font-normal block leading-tight">
                  24/7 Field Hotline
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-800/80 text-[11px] font-mono tracking-tight text-emerald-100">
              1-800-RESCUE
            </span>
          </a>

          {/* Quick Details / Hotline Info Trigger */}
          <button
            type="button"
            id="emergency-info-toggle"
            onClick={() => setModalOpen(true)}
            className="min-h-[48px] min-w-[44px] px-2.5 rounded-xl bg-stone-100 active:bg-stone-200 text-stone-700 flex flex-col items-center justify-center text-[10px] font-medium border border-stone-200 active:scale-[0.98] transition-all cursor-pointer"
            title="Hotline details & emergency guidelines"
          >
            <ShieldCheck className="w-4 h-4 text-teal-700 mb-0.5" />
            <span className="text-[9px] leading-none text-stone-500">Info</span>
          </button>

          {/* If not already on Report form, show rapid Report button */}
          {!isReportPage && (
            <Link
              to="/report"
              id="emergency-report-shortcut"
              className="min-h-[48px] px-3 py-2 rounded-xl bg-rose-600 active:bg-rose-700 text-white flex flex-col items-center justify-center text-[10px] font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mb-0.5" />
              <span className="leading-none">Report</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Emergency Hotline Info Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 animate-in fade-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 leading-tight">
                    Emergency Rescue Hotline
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    24/7 Community Dispatch Available
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5 text-xs text-stone-600">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>When to call immediately:</strong> Severe trauma, animal trapped on highway/water, suspected rabies, or imminent danger.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="text-stone-400 block text-[9px]">Average ETA</span>
                    <span className="font-bold text-stone-800">12-18 mins</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="text-stone-400 block text-[9px]">Field Responders</span>
                    <span className="font-bold text-stone-800">68 Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={EMERGENCY_HOTLINE_TEL}
                className="w-full min-h-[48px] rounded-xl bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call {EMERGENCY_HOTLINE_NUMBER}</span>
              </a>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full min-h-[44px] rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
