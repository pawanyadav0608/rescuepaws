import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Users,
  Shield,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  Lock,
  User,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const initialRole = (searchParams.get('role') as UserRole) || 'citizen';

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!email) throw new Error('Please enter your email.');
        await login(email, password || 'password123');
      } else {
        if (!name || !email) throw new Error('Please fill in your name and email.');
        await signup({
          name,
          email,
          password: password || 'secret123',
          role,
          phone,
        });
      }

      if (role === 'volunteer') {
        navigate('/volunteer');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/map');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      if (demoRole === 'volunteer') {
        await login('marcus.chen@rescue.org', 'password');
        navigate('/volunteer');
      } else if (demoRole === 'admin') {
        await login('sarah.coordinator@rescue.org', 'password');
        navigate('/admin');
      } else {
        await login('elena@gmail.com', 'password');
        navigate('/map');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isLogin ? 'Welcome Back to RescuePaws' : 'Join the Community Rescue Network'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {isLogin
              ? 'Log in to manage your active rescues and notifications'
              : 'Sign up as a community reporter or volunteer responder'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card className="bg-white p-6 shadow-md border-stone-200">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isLogin ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                !isLogin ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* If Sign up: Role Selection (Citizen vs Volunteer) */}
          {!isLogin && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                I am signing up as a:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'citizen'
                      ? 'border-teal-700 bg-teal-50/50 text-teal-900 ring-2 ring-teal-700/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="font-bold text-xs block">Citizen Reporter</span>
                  <span className="text-[10px] text-stone-500 leading-tight">
                    Report local strays & follow rescue progress
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('volunteer')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'volunteer'
                      ? 'border-teal-700 bg-teal-50/50 text-teal-900 ring-2 ring-teal-700/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="font-bold text-xs block">Rescue Volunteer</span>
                  <span className="text-[10px] text-stone-500 leading-tight">
                    Accept pickups & respond to field alerts
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            {!isLogin && role === 'volunteer' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number (For dispatch SMS alerts)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              icon={isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            >
              {isLogin ? 'Sign In' : 'Create Rescue Account'}
            </Button>
          </form>

          {/* Quick Instant Test Login */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block text-center mb-2">
              Or 1-Click Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('citizen')}
                className="py-1.5 px-2 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-700 hover:bg-stone-50 cursor-pointer text-center"
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('volunteer')}
                className="py-1.5 px-2 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-700 hover:bg-stone-50 cursor-pointer text-center"
              >
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="py-1.5 px-2 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-700 hover:bg-stone-50 cursor-pointer text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
