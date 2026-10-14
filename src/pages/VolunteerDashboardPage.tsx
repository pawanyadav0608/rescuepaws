import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  Phone,
  Filter,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { fetchReports, updateReportStatus, acceptRescue } from '../api/reports';
import { AnimalReport } from '../types';
import { useAuth } from '../context/AuthContext';

export const VolunteerDashboardPage: React.FC = () => {
  const { user, switchDemoUser, toggleAvailability } = useAuth();
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [filterTab, setFilterTab] = useState<'assigned' | 'open' | 'history'>('assigned');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleToggle = async () => {
    if (!user) return;
    setToggling(true);
    try {
      await toggleAvailability(!user.is_available);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setToggling(false);
    }
  };

  // Filter lists
  const assignedActive = reports.filter(
    (r) =>
      r.assigned_volunteer_id === user?.id &&
      (r.status === 'Accepted' || r.status === 'In Progress')
  );

  const openForPickup = reports.filter(
    (r) => r.status === 'Reported'
  );

  const completedHistory = reports.filter(
    (r) =>
      (r.assigned_volunteer_id === user?.id || !r.assigned_volunteer_id) &&
      (r.status === 'Rescued' || r.status === 'Closed')
  );

  const activeReportsToDisplay =
    filterTab === 'assigned'
      ? assignedActive
      : filterTab === 'open'
      ? openForPickup
      : completedHistory;

  return (
    <div className="min-h-screen bg-stone-50 py-3 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-6">
        {/* If user is citizen or not logged in, show friendly switch banner */}
        {user?.role === 'citizen' && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
              <span>Viewing as <strong>Citizen</strong>. Switch to Responder role to test accept workflows.</span>
            </div>
            <button
              type="button"
              onClick={() => switchDemoUser('volunteer')}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-teal-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap self-start sm:self-auto active:bg-teal-800"
            >
              Switch to Responder
            </button>
          </div>
        )}

        {/* Volunteer Status & Header Strip */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base sm:text-xl flex-shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'VO'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-2xl font-bold text-stone-900">
                  {user?.name || 'Marcus Chen'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] sm:text-xs font-bold">
                  Certified Responder
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                Rapid Response Unit • Sector A
              </p>
            </div>
          </div>

          {/* Toggle: "Available for rescues" on/off */}
          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
            <div className="text-left sm:text-right">
              <span className="text-[11px] sm:text-xs font-bold text-stone-700 block">
                Rescue Availability
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  user?.is_available ? 'text-emerald-700' : 'text-stone-400'
                }`}
              >
                {user?.is_available ? '● Ready for Dispatches' : '○ Paused'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              disabled={toggling}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                user?.is_available ? 'bg-teal-700' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  user?.is_available ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="bg-white p-3 sm:p-4 border-stone-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-tight truncate">
                Active
              </span>
              <Clock className="w-3.5 h-3.5 text-teal-600 hidden sm:block" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-none">
              {assignedActive.length}
            </p>
            <p className="text-[10px] text-teal-700 mt-1 hidden sm:block">En-route / active</p>
          </Card>

          <Card className="bg-white p-3 sm:p-4 border-stone-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-tight truncate">
                Open
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 hidden sm:block" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-none">
              {openForPickup.length}
            </p>
            <p className="text-[10px] text-amber-700 mt-1 hidden sm:block">Ready for pickup</p>
          </Card>

          <Card className="bg-white p-3 sm:p-4 border-stone-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-tight truncate">
                Rescued
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 hidden sm:block" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-none">
              {user?.rescues_completed || 28 + completedHistory.length}
            </p>
            <p className="text-[10px] text-emerald-700 mt-1 hidden sm:block">Safe outcomes</p>
          </Card>
        </div>

        {/* Navigation Tabs - Horizontal Scrolling on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterTab('assigned')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap min-h-[38px] flex items-center ${
              filterTab === 'assigned'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 active:bg-stone-200 border border-stone-200'
            }`}
          >
            My Rescues ({assignedActive.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('open')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap min-h-[38px] flex items-center ${
              filterTab === 'open'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 active:bg-stone-200 border border-stone-200'
            }`}
          >
            Open for Pickup ({openForPickup.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('history')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap min-h-[38px] flex items-center ${
              filterTab === 'history'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 active:bg-stone-200 border border-stone-200'
            }`}
          >
            Completed History
          </button>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            Loading rescue records...
          </div>
        ) : activeReportsToDisplay.length === 0 ? (
          <Card className="bg-white p-8 text-center border-stone-200">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-stone-300 mx-auto mb-2.5" />
            <h3 className="text-sm sm:text-base font-bold text-stone-800 mb-1">
              No reports in this category
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-3">
              {filterTab === 'assigned'
                ? 'You have no active rescues assigned. Check the "Open for Pickup" tab to accept a local animal in need!'
                : 'All nearby incidents have already been picked up by responders.'}
            </p>
            {filterTab === 'assigned' && (
              <Button size="sm" onClick={() => setFilterTab('open')} className="min-h-[40px]">
                Browse Open Incidents
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
            {activeReportsToDisplay.map((report) => (
              <Card key={report.id} className="bg-white p-3.5 sm:p-5 flex flex-col justify-between border-stone-200">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-bold text-stone-900 capitalize">
                        {report.animal_type}
                      </span>
                      <span className="text-[10px] text-stone-400">#{report.id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UrgencyBadge urgency={report.urgency_level} size="sm" />
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                  </div>

                  <div className="flex gap-3 mb-3">
                    <img
                      src={report.photo_url}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                    />
                    <div className="text-xs text-stone-600 flex-1 min-w-0">
                      <p className="line-clamp-2 sm:line-clamp-3 mb-1.5 leading-relaxed text-[11px] sm:text-xs">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-1 text-stone-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span className="truncate">{report.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px] text-stone-400">
                    {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {report.reporter_phone && (
                      <a
                        href={`tel:${report.reporter_phone}`}
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold active:bg-emerald-100"
                        title="Call reporter"
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                      </a>
                    )}

                    <Link to={`/reports/${report.id}`}>
                      <Button variant="outline" size="sm" className="min-h-[38px] text-xs font-semibold px-2.5">
                        Details
                      </Button>
                    </Link>

                    {report.status === 'Reported' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="min-h-[38px] text-xs font-bold px-3"
                        onClick={async () => {
                          if (user) {
                            await acceptRescue(report.id, user.id, user.name);
                            loadReports();
                          }
                        }}
                      >
                        Accept
                      </Button>
                    )}

                    {report.status === 'Accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="min-h-[38px] text-xs font-bold px-3"
                        onClick={async () => {
                          await updateReportStatus(report.id, 'In Progress', user?.name);
                          loadReports();
                        }}
                      >
                        Start Trip
                      </Button>
                    )}

                    {report.status === 'In Progress' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="min-h-[38px] text-xs font-bold px-3"
                        onClick={async () => {
                          await updateReportStatus(report.id, 'Rescued', user?.name);
                          loadReports();
                        }}
                      >
                        Mark Rescued
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
