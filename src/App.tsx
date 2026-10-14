import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ReportFormPage } from './pages/ReportFormPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { VolunteerDashboardPage } from './pages/VolunteerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPage';
import { EmergencyCallBar } from './components/EmergencyCallBar';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-stone-200 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Application Notice</h2>
            <p className="text-xs text-stone-500">
              An unexpected condition occurred while rendering. We've preserved your data.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono bg-stone-50 p-2 rounded-lg text-stone-600 border border-stone-100 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '#/';
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component for Volunteer/Admin roles
const ProtectedRoute: React.FC<{
  allowedRoles: ('citizen' | 'volunteer' | 'admin')[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-xs text-stone-500">
        Authenticating...
      </div>
    );
  }

  // If user role is allowed, render
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // If not allowed, redirect to auth or let them switch role
  return <Navigate to={`/auth?mode=login&role=${allowedRoles[0]}`} replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
            <Navbar />
            <main className="flex-1 pb-20 md:pb-0">
              <Routes>
                {/* Core 1: Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Core 2: Report Submission Form */}
                <Route path="/report" element={<ReportFormPage />} />

                {/* Core 3: Live Map / Dashboard */}
                <Route path="/map" element={<LiveMapPage />} />

                {/* Core 4: Report Detail View */}
                <Route path="/reports/:id" element={<ReportDetailPage />} />

                {/* Core 5: Volunteer Dashboard */}
                <Route
                  path="/volunteer"
                  element={
                    <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                      <VolunteerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Core 6: Admin Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Core 7: Auth Pages */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            {/* Always accessible thumb-reachable emergency dispatch bar for phones */}
            <EmergencyCallBar />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
