import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Heart,
  Users,
  Clock,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Activity,
  Phone,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { fetchReports } from '../api/reports';
import { getStoredStats } from '../api/mockStore';
import { AnimalReport, StatsData } from '../types';
import { EMERGENCY_HOTLINE_TEL, EMERGENCY_HOTLINE_NUMBER } from '../components/EmergencyCallBar';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData>(getStoredStats());
  const [recentReports, setRecentReports] = useState<AnimalReport[]>([]);

  useEffect(() => {
    fetchReports()
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentReports(data.slice(0, 3));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch recent reports:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section - Optimized for Android 4G */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-teal-900 text-white pt-6 sm:pt-12 pb-14 sm:pb-20 px-3.5 sm:px-6 lg:px-8">
        {/* Subtle background textures - hidden on mobile to avoid GPU lag on mid-range devices */}
        <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-600/20 blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/70 border border-teal-500/30 text-teal-100 text-[11px] sm:text-xs font-medium mb-4 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span>Community Animal Rescue & AI Triage</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-5 leading-tight">
            Every Animal Deserves a Rapid, Caring Rescue
          </h1>

          <p className="text-xs sm:text-base text-teal-100/90 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Spotted an injured, trapped, or stray animal? Snap a photo and drop a pin.
            Our smart dispatch connects verified local volunteer responders in minutes.
          </p>

          {/* Primary Action Buttons - Large touch targets for phones (min 48px) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 max-w-md mx-auto">
            <Link to="/report" className="w-full sm:w-auto">
              <Button
                variant="danger"
                size="lg"
                className="w-full min-h-[48px] text-sm sm:text-base shadow-md font-bold"
                icon={<AlertTriangle className="w-4 h-4 text-white" />}
              >
                Report an Animal Now
              </Button>
            </Link>

            <Link to="/auth?mode=signup&role=volunteer" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full min-h-[48px] text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white border-white/30"
                icon={<Users className="w-4 h-4 text-teal-200" />}
              >
                Become a Volunteer
              </Button>
            </Link>
          </div>

          {/* Mobile Direct Hotline Quick Call Badge */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] text-teal-200/90">
            <a
              href={EMERGENCY_HOTLINE_TEL}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-800/60 border border-emerald-500/40 text-emerald-200 font-semibold active:bg-emerald-800"
            >
              <Phone className="w-3 h-3 fill-current text-emerald-300" />
              <span>Hotline: {EMERGENCY_HOTLINE_NUMBER}</span>
            </a>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Free & Volunteer-Run
            </span>
          </div>
        </div>
      </section>

      {/* Live Stats Strip - Tightened 2x2 on Mobile, 4-Col on Desktop */}
      <section className="relative -mt-6 sm:-mt-8 max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-stone-200">
          <div className="p-2 sm:p-3 rounded-xl bg-stone-50/70 border border-stone-100">
            <div className="flex items-center gap-1.5 text-teal-700 mb-0.5">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500">
                Rescued
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {stats.rescued_this_month}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium truncate">
              This month (+18%)
            </p>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-stone-50/70 border border-stone-100">
            <div className="flex items-center gap-1.5 text-teal-700 mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500">
                Response
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {stats.avg_response_time_min} <span className="text-xs font-normal text-stone-500">min</span>
            </p>
            <p className="text-[10px] text-stone-500 truncate">
              Avg acceptance time
            </p>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-stone-50/70 border border-stone-100">
            <div className="flex items-center gap-1.5 text-teal-700 mb-0.5">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500">
                Responders
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {stats.active_volunteers}
            </p>
            <p className="text-[10px] text-stone-500 truncate">
              Active in field
            </p>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-stone-50/70 border border-stone-100">
            <div className="flex items-center gap-1.5 text-teal-700 mb-0.5">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500">
                Incidents
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {stats.total_reports}
            </p>
            <p className="text-[10px] text-stone-500 truncate">
              Total resolved
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Step Workflow */}
      <section className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-1.5">
            How Community Rescue Works
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm">
            Engineered for high-stress field conditions. Report an animal in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          <Card className="p-4 sm:p-5 flex flex-col items-start bg-white border-stone-200">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Snap Photo & Geotag
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload a quick photo from your phone. Tap "Use Current GPS" or drop a pin. No breed knowledge required.
            </p>
          </Card>

          <Card className="p-4 sm:p-5 flex flex-col items-start bg-white border-stone-200">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              AI Triage & Local Alert
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Computer vision assesses visible trauma and flags urgency. Certified volunteers nearby are notified instantly.
            </p>
          </Card>

          <Card className="p-4 sm:p-5 flex flex-col items-start bg-white border-stone-200">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Live Responder Tracking
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Track responder ETA, veterinary transport, and post-rescue recovery milestones on the live timeline.
            </p>
          </Card>
        </div>
      </section>

      {/* Live Recent Reports Strip */}
      <section className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-stone-900">
              Active Community Reports
            </h2>
            <p className="text-xs text-stone-500">
              Real-time reports from citizens and field volunteers
            </p>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 p-1"
          >
            <span>View Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {recentReports.map((report) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="block group focus:outline-none"
            >
              <Card interactive className="h-full flex flex-col overflow-hidden p-0 border-stone-200">
                <div className="relative h-36 sm:h-44 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={report.photo_url}
                    alt={report.description}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <UrgencyBadge urgency={report.urgency_level} size="sm" />
                  </div>
                  <div className="absolute bottom-2.5 right-2.5">
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 mb-1">
                      <MapPin className="w-3 h-3 text-teal-600 flex-shrink-0" />
                      <span className="truncate">{report.address || 'Reported Location'}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 mb-2">
                      {report.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="capitalize font-medium text-stone-700">
                      {report.animal_type}
                    </span>
                    <span>
                      {new Date(report.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
