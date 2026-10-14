import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Send,
  Phone,
  User,
  Shield,
  HeartHandshake,
  Share2,
  PhoneCall,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge, UrgencyBadge, AiVerifiedBadge } from '../components/StatusBadge';
import { InteractiveMap } from '../components/InteractiveMap';
import {
  fetchReportById,
  acceptRescue,
  updateReportStatus,
  addReportComment,
} from '../api/reports';
import { AnimalReport, RescueStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { EMERGENCY_HOTLINE_TEL, EMERGENCY_HOTLINE_NUMBER } from '../components/EmergencyCallBar';

const STATUS_STEPS: RescueStatus[] = [
  'Reported',
  'Accepted',
  'In Progress',
  'Rescued',
  'Closed',
];

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isVolunteer, isAdmin } = useAuth();

  const [report, setReport] = useState<AnimalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const loadReport = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchReportById(id);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handleAccept = async () => {
    if (!report || !user) return;
    setActionLoading(true);
    try {
      const updated = await acceptRescue(report.id, user.id, user.name);
      setReport(updated);
    } catch (err) {
      console.error('Failed to accept rescue:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: RescueStatus) => {
    if (!report) return;
    setActionLoading(true);
    try {
      const updated = await updateReportStatus(report.id, newStatus, user?.name);
      setReport(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !newComment.trim()) return;

    try {
      const commentAuthor = user?.name || 'Citizen Supporter';
      const commentRole = user?.role || 'citizen';
      await addReportComment(report.id, {
        author: commentAuthor,
        role: commentRole,
        text: newComment.trim(),
      });
      setNewComment('');
      loadReport();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">
            Fetching emergency incident data...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 bg-white">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-stone-900 mb-1">Report Not Found</h2>
          <p className="text-xs text-stone-500 mb-4">
            The requested incident report (#{id}) could not be located or may have been archived.
          </p>
          <Button onClick={() => navigate('/map')} variant="primary" className="w-full">
            Back to Live Map
          </Button>
        </Card>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(report.status);

  return (
    <div className="min-h-screen bg-stone-50 py-3 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-6">
        {/* Navigation Bar & Share */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer min-h-[36px] py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-medium hover:bg-stone-50 cursor-pointer min-h-[36px]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Status Stepper Timeline Card */}
        <Card className="bg-white p-3.5 sm:p-6 shadow-sm border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-700">
                Rescue Progress Lifecycle
              </span>
              <h1 className="text-lg sm:text-2xl font-bold text-stone-900 capitalize leading-tight">
                {report.animal_type} Rescue #{report.id}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <UrgencyBadge urgency={report.urgency_level} size="sm" />
              <StatusBadge status={report.status} size="sm" />
            </div>
          </div>

          {/* Visual Stepper - Compact Horizontal Scroll on Phone */}
          <div className="relative overflow-x-auto pb-1 scrollbar-none">
            <div className="hidden sm:block absolute top-1/2 left-4 right-4 h-0.5 bg-stone-200 -translate-y-1/2 z-0" />
            <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-2 relative z-10 min-w-[320px]">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex-1 flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-teal-700 text-white ring-3 ring-teal-100 shadow-sm'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-1.5 font-semibold whitespace-nowrap leading-tight ${
                        isCurrent
                          ? 'text-teal-900'
                          : isPassed
                          ? 'text-stone-800'
                          : 'text-stone-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volunteer / Dispatch Action Strip */}
          <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-stone-600">
              {report.assigned_volunteer_name ? (
                <span className="flex items-center gap-1.5 font-medium text-stone-800">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  Assigned Responder: <strong className="text-teal-800">{report.assigned_volunteer_name}</strong>
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  • Open incident awaiting field responder pickup
                </span>
              )}
            </div>

            {/* Volunteer accept action */}
            {isVolunteer && report.status === 'Reported' && (
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto min-h-[44px] font-bold"
                isLoading={actionLoading}
                onClick={handleAccept}
                icon={<HeartHandshake className="w-4 h-4" />}
              >
                Accept This Rescue
              </Button>
            )}

            {/* Advance Status Controls */}
            {(isVolunteer || isAdmin) && report.status !== 'Reported' && report.status !== 'Closed' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-stone-500 font-medium">Advance:</span>
                {report.status === 'Accepted' && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="min-h-[40px] text-xs font-bold"
                    isLoading={actionLoading}
                    onClick={() => handleStatusChange('In Progress')}
                  >
                    Mark "In Progress" (En Route)
                  </Button>
                )}
                {report.status === 'In Progress' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="min-h-[40px] text-xs font-bold"
                    isLoading={actionLoading}
                    onClick={() => handleStatusChange('Rescued')}
                  >
                    Mark "Rescued" (Secured)
                  </Button>
                )}
                {report.status === 'Rescued' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[40px] text-xs font-bold"
                    isLoading={actionLoading}
                    onClick={() => handleStatusChange('Closed')}
                  >
                    Close Report
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Direct Call Action Bar for Incident (Field Volunteer & Citizen) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {report.reporter_phone && (
            <a
              href={`tel:${report.reporter_phone}`}
              className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-between shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 fill-current" />
                <span>Call Reporter: {report.reporter_name || 'Citizen'}</span>
              </div>
              <span className="font-mono text-emerald-100 text-[11px]">
                {report.reporter_phone}
              </span>
            </a>
          )}

          <a
            href={EMERGENCY_HOTLINE_TEL}
            className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-stone-900 active:bg-black text-white font-bold text-xs flex items-center justify-between shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Rescue Dispatch Hotline</span>
            </div>
            <span className="font-mono text-stone-300 text-[11px]">
              {EMERGENCY_HOTLINE_NUMBER}
            </span>
          </a>
        </div>

        {/* Main Content: Photo & Details Left, Map & Reporter Right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column (2 cols wide) */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            {/* Photo & Description Card */}
            <Card className="bg-white overflow-hidden p-0 border-stone-200">
              <div className="relative h-52 sm:h-80 w-full bg-stone-900">
                <img
                  src={report.photo_url}
                  alt={report.description}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <UrgencyBadge urgency={report.urgency_level} size="sm" />
                  {report.ai_analysis && (
                    <AiVerifiedBadge confidence={report.ai_analysis.confidence} />
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1.5">
                  Situation Description
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {report.description}
                </p>

                {/* AI Triage Card */}
                {report.ai_analysis && (
                  <div className="mt-4 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      <span>AI Triage Assessment</span>
                    </div>
                    <p className="text-xs text-teal-900 font-medium mb-1">
                      Detected: {report.ai_analysis.detected_species || report.animal_type} (Confidence: {Math.round((report.ai_analysis.confidence ?? 0.85) * 100)}%)
                    </p>
                    {report.ai_analysis.detected_injuries && report.ai_analysis.detected_injuries.length > 0 && (
                      <p className="text-[11px] text-teal-800 leading-relaxed">
                        Identified signs: {report.ai_analysis.detected_injuries.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Field Updates & Comments Card */}
            <Card className="bg-white p-4 sm:p-6 border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  Field Updates & Timeline
                </h3>
                <span className="text-[11px] text-stone-500">
                  {(report.updates || []).length} updates recorded
                </span>
              </div>

              {/* Updates list */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {(!report.updates || report.updates.length === 0) ? (
                  <p className="text-xs text-stone-400 italic py-3 text-center">
                    No field notes yet. Post a sighting or status below.
                  </p>
                ) : (
                  report.updates.map((update) => (
                    <div
                      key={update.id}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900 text-[11px]">
                            {update.author}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              update.role === 'volunteer'
                                ? 'bg-teal-100 text-teal-800'
                                : update.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {update.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(update.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-stone-700 text-[11px] leading-relaxed">{update.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    user
                      ? `Post update as ${user.name}...`
                      : 'Post field sighting update...'
                  }
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 min-h-[40px]"
                />
                <Button type="submit" size="sm" className="min-h-[40px] px-3.5" icon={<Send className="w-3.5 h-3.5" />}>
                  Post
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Location Map & Reporter Contact */}
          <div className="space-y-4 sm:space-y-6">
            {/* Embedded Location Map */}
            <Card className="bg-white p-3.5 sm:p-4 border-stone-200">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Geotagged Location</span>
              </h3>

              <div className="h-44 sm:h-56 w-full rounded-xl overflow-hidden border border-stone-200 mb-2.5">
                <InteractiveMap
                  mode="dashboard"
                  reports={[report]}
                  selectedReportId={report.id}
                  className="h-full w-full"
                />
              </div>

              <p className="text-xs font-semibold text-stone-800 mb-0.5">
                {report.address}
              </p>
              <p className="text-[10px] text-stone-400 font-mono">
                {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
              </p>
            </Card>

            {/* Reporter Information Card */}
            <Card className="bg-white p-3.5 sm:p-5 border-stone-200 space-y-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Reporter Contact</span>
              </h3>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-stone-400 block text-[10px]">Reported By</span>
                  <span className="font-semibold text-stone-800">
                    {report.reporter_name || 'Anonymous Citizen'}
                  </span>
                </div>

                {report.reporter_phone && (
                  <div>
                    <span className="text-stone-400 block text-[10px]">Direct Phone</span>
                    <a
                      href={`tel:${report.reporter_phone}`}
                      className="font-bold text-emerald-700 flex items-center gap-1 hover:underline min-h-[36px] py-1"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>{report.reporter_phone}</span>
                    </a>
                  </div>
                )}

                <div>
                  <span className="text-stone-400 block text-[10px]">Timestamp</span>
                  <span className="text-stone-600 text-[11px]">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
