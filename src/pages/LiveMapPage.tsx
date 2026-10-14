import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Filter,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  Layers,
  X,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { StatusBadge, UrgencyBadge, AiVerifiedBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { fetchReports } from '../api/reports';
import { AnimalReport, RescueStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { EMERGENCY_HOTLINE_TEL } from '../components/EmergencyCallBar';

export const LiveMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { isVolunteer } = useAuth();

  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<AnimalReport | null>(null);
  const [showMobileList, setShowMobileList] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchReports();
      const validReports = Array.isArray(data) ? data : [];
      setReports(validReports);
      if (validReports.length > 0 && !selectedReport) {
        setSelectedReport(validReports[0]);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All' || r.urgency_level === urgencyFilter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.animal_type.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      (r.address && r.address.toLowerCase().includes(query));
    return matchesStatus && matchesUrgency && matchesSearch;
  });

  const statuses: (RescueStatus | 'All')[] = [
    'All',
    'Reported',
    'Accepted',
    'In Progress',
    'Rescued',
    'Closed',
  ];

  return (
    <div className="h-[calc(100vh-56px)] sm:h-[calc(100vh-72px)] flex flex-col overflow-hidden bg-stone-100">
      {/* Top Filter Bar - Single Row Scrollable on Mobile */}
      <div className="bg-white border-b border-stone-200 px-3 sm:px-4 py-2 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Horizontal Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
            <Filter className="w-3 h-3 text-teal-700" /> Status:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap select-none flex-shrink-0 min-h-[34px] flex items-center ${
                statusFilter === st
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 active:bg-stone-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Urgency & View Toggle Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search animals, streets..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-stone-50/50"
            />
          </div>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs py-1.5 px-2 rounded-lg border border-stone-300 bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer min-h-[34px]"
          >
            <option value="All">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Mobile toggle list vs map */}
          <button
            type="button"
            onClick={() => setShowMobileList(!showMobileList)}
            className="md:hidden px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1 min-h-[34px] flex-shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>{showMobileList ? 'Map' : `List (${filteredReports.length})`}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Map + Sidebar / Panel */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Reports List (Desktop Sidebar & Mobile Full-Screen Overlay) */}
        <div
          className={`w-full md:w-96 lg:w-[400px] bg-white border-r border-stone-200 flex flex-col z-10 ${
            showMobileList ? 'flex absolute inset-0 z-30 pb-20' : 'hidden md:flex'
          }`}
        >
          <div className="p-3 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div>
              <p className="text-xs font-bold text-stone-800">
                Rescue Reports
              </p>
              <p className="text-[11px] text-stone-500">
                {filteredReports.length} active incidents nearby
              </p>
            </div>
            {showMobileList && (
              <button
                type="button"
                onClick={() => setShowMobileList(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Report list items */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {loading ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                Loading incidents...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                <AlertTriangle className="w-7 h-7 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-stone-700">No reports matched</p>
                <p className="text-[11px] text-stone-400 mt-1">Try resetting the status or urgency filter</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      if (showMobileList) setShowMobileList(false);
                    }}
                    className={`p-3 transition-all cursor-pointer border-l-4 ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-600'
                        : 'hover:bg-stone-50 border-transparent'
                    }`}
                  >
                    <div className="flex gap-2.5">
                      <img
                        src={report.photo_url}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-stone-900 capitalize truncate">
                            {report.animal_type}
                          </span>
                          <StatusBadge status={report.status} size="sm" />
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-snug mb-1.5">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-stone-400">
                          <UrgencyBadge urgency={report.urgency_level} size="sm" />
                          <span>
                            {new Date(report.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Map Canvas (Full Area) */}
        <div className="flex-1 relative h-full">
          <InteractiveMap
            mode="dashboard"
            reports={filteredReports}
            selectedReportId={selectedReport?.id}
            onSelectReport={(rep) => setSelectedReport(rep)}
            className="h-full w-full rounded-none border-none shadow-none"
          />

          {/* Selected Report Floating Detail Drawer / Preview Panel */}
          {/* CRITICAL FOR PHONE: Positioned at bottom-24 on mobile so it never collides with or overlaps the emergency call bar! */}
          {selectedReport && (
            <div className="absolute bottom-20 sm:bottom-4 right-3 left-3 sm:left-auto sm:w-96 z-[450] bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 p-3.5 animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[calc(100vh-180px)] overflow-y-auto">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 capitalize">
                      {selectedReport.animal_type}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      #{selectedReport.id}
                    </span>
                    {selectedReport.ai_analysis && (
                      <AiVerifiedBadge confidence={selectedReport.ai_analysis.confidence} />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-600 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">
                      {selectedReport.address}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnail & Description */}
              <div className="flex gap-2.5 my-2">
                <img
                  src={selectedReport.photo_url}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 bg-stone-100"
                />
                <div className="flex-1 text-[11px] sm:text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {selectedReport.description}
                </div>
              </div>

              {/* Urgency & Status indicators */}
              <div className="flex items-center justify-between py-1.5 border-t border-stone-100 text-xs">
                <UrgencyBadge urgency={selectedReport.urgency_level} size="sm" />
                <StatusBadge status={selectedReport.status} size="sm" />
              </div>

              {/* Action Buttons - Large Touch Targets (min 44px) */}
              <div className="mt-2 pt-2 border-t border-stone-100 flex gap-2">
                <Link
                  to={`/reports/${selectedReport.id}`}
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors"
                >
                  <span>Open Full Detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {selectedReport.reporter_phone && (
                  <a
                    href={`tel:${selectedReport.reporter_phone}`}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-1 active:bg-emerald-100"
                    title="Call reporter directly"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
