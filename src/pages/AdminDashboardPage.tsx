import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Filter,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  XCircle,
  Search,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { fetchReports, reassignReport, updateReportStatus } from '../api/reports';
import { getVolunteersList } from '../api/volunteers';
import { getStoredStats } from '../api/mockStore';
import { AnimalReport, RescueStatus, StatsData, User, UrgencyLevel } from '../types';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, switchDemoUser } = useAuth();

  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [stats, setStats] = useState<StatsData>(getStoredStats());
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Reassign Modal State
  const [reassigningReport, setReassigningReport] = useState<AnimalReport | null>(null);
  const [selectedVolunteerName, setSelectedVolunteerName] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [reps, vols] = await Promise.all([fetchReports(), getVolunteersList()]);
      setReports(Array.isArray(reps) ? reps : []);
      setVolunteers(Array.isArray(vols) ? vols : []);
      if (Array.isArray(vols) && vols.length > 0) setSelectedVolunteerName(vols[0].name);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningReport || !selectedVolunteerName) return;
    try {
      await reassignReport(reassigningReport.id, selectedVolunteerName);
      setReassigningReport(null);
      loadAll();
    } catch (err) {
      console.error('Failed to reassign:', err);
    }
  };

  const handleCloseReport = async (reportId: string) => {
    if (confirm('Are you sure you want to close this incident report?')) {
      await updateReportStatus(reportId, 'Closed', user?.name || 'Chief Dispatcher');
      loadAll();
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchUrgency = urgencyFilter === 'All' || r.urgency_level === urgencyFilter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      r.description.toLowerCase().includes(q) ||
      r.animal_type.toLowerCase().includes(q) ||
      (r.assigned_volunteer_name && r.assigned_volunteer_name.toLowerCase().includes(q)) ||
      (r.address && r.address.toLowerCase().includes(q));
    return matchStatus && matchUrgency && matchSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* If user is not admin, show helper notice */}
        {user?.role !== 'admin' && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span>
                You are currently viewing as <strong>{user?.name} ({user?.role})</strong>.
                Switch to Admin Coordinator for full dispatcher permissions.
              </span>
            </div>
            <button
              type="button"
              onClick={() => switchDemoUser('admin')}
              className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-semibold cursor-pointer"
            >
              Switch to Admin
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
              <Shield className="w-4 h-4" /> Dispatch Central & Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Community Rescue Command
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/map">
              <Button variant="outline" size="sm">
                Open Live Map
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="danger" size="sm">
                File Incident
              </Button>
            </Link>
          </div>
        </div>

        {/* Basic Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white p-5 border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
              <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-stone-900">{reports.length}</p>
            <p className="text-xs text-stone-500 mt-1">Logged across all jurisdictions</p>
          </Card>

          <Card className="bg-white p-5 border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Active Volunteers</span>
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-stone-900">{stats.active_volunteers}</p>
            <p className="text-xs text-emerald-700 mt-1">Available on call</p>
          </Card>

          <Card className="bg-white p-5 border-stone-200">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Response Time</span>
              <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-stone-900">
              {stats.avg_response_time_min} <span className="text-lg font-medium text-stone-500">mins</span>
            </p>
            <p className="text-xs text-stone-500 mt-1">From notification to on-scene</p>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="bg-white p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by species, address, volunteer..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-stone-300 bg-white text-stone-700 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Accepted">Accepted</option>
                <option value="In Progress">In Progress</option>
                <option value="Rescued">Rescued</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-stone-300 bg-white text-stone-700 font-medium cursor-pointer"
              >
                <option value="All">All Urgency</option>
                <option value="high">High Urgency</option>
                <option value="medium">Medium Urgency</option>
                <option value="low">Low Urgency</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Incident</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Location / Address</th>
                  <th className="py-3.5 px-4">Assigned Responder</th>
                  <th className="py-3.5 px-4">Reported</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      Loading dispatcher database...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      No matching incident records found.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={report.photo_url}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 capitalize block">
                              {report.animal_type}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              #{report.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={report.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <UrgencyBadge urgency={report.urgency_level} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-stone-700">
                        {report.address}
                      </td>
                      <td className="py-3.5 px-4 text-stone-800 font-medium">
                        {report.assigned_volunteer_name ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            {report.assigned_volunteer_name}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-normal">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString()}{' '}
                        {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/reports/${report.id}`}>
                            <button
                              type="button"
                              className="p-1.5 text-stone-600 hover:text-teal-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                              title="View details"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setReassigningReport(report)}
                            className="p-1.5 text-stone-600 hover:text-purple-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                            title="Reassign volunteer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {report.status !== 'Closed' && (
                            <button
                              type="button"
                              onClick={() => handleCloseReport(report.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Close report"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reassign Modal */}
        {reassigningReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <Card className="max-w-md w-full bg-white p-6 shadow-xl">
              <h3 className="text-base font-bold text-stone-900 mb-1">
                Reassign Rescue Incident
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Assign {reassigningReport.animal_type} (#{reassigningReport.id}) to a different certified volunteer.
              </p>

              <form onSubmit={handleReassignSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Volunteer Responder
                  </label>
                  <select
                    value={selectedVolunteerName}
                    onChange={(e) => setSelectedVolunteerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-teal-600 outline-none"
                  >
                    <option value="Marcus Chen">Marcus Chen (Active - 28 rescues)</option>
                    <option value="Sarah Jenkins (Avian Specialist)">Sarah Jenkins (Avian Specialist)</option>
                    <option value="Dr. James Walker (K9 Unit)">Dr. James Walker (K9 Unit)</option>
                    <option value="Maya Lin (Wildlife Care)">Maya Lin (Wildlife Care)</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setReassigningReport(null)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Confirm Reassignment
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
