import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  PlusCircle,
  MapPin,
  Users,
  Shield,
  Menu,
  X,
  LogOut,
  LogIn,
  UserCheck,
  ChevronDown,
  Phone,
  Download,
} from 'lucide-react';
import { EMERGENCY_HOTLINE_TEL, EMERGENCY_HOTLINE_NUMBER } from './EmergencyCallBar';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchDemoUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Live Map', path: '/map', icon: <MapPin className="w-4 h-4" /> },
    { name: 'Volunteer Hub', path: '/volunteer', icon: <Users className="w-4 h-4" /> },
    { name: 'Admin', path: '/admin', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-800 transition-colors">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 text-base sm:text-lg tracking-tight">
                  RescuePaws
                </span>
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-[9px] font-bold uppercase">
                  AI Triage
                </span>
              </div>
              <p className="text-[10px] text-stone-500 hidden sm:block">
                Community Animal Rescue Network
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/map"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/map')
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              Live Map
            </Link>
            <Link
              to="/volunteer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/volunteer')
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Users className="w-4 h-4 text-teal-600" />
              Volunteer Hub
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Shield className="w-4 h-4 text-teal-600" />
              Admin
            </Link>
          </nav>

          {/* Right Action & Quick Role Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Role Switcher to make reviewing and test all 3 views effortless */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 text-xs font-medium hover:bg-stone-100 cursor-pointer"
                title="Switch test persona"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Role:</span>
                <span className="font-semibold capitalize text-teal-800">
                  {user ? user.role : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-stone-200 shadow-lg py-1 z-50"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoUser('citizen');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-teal-700 font-medium cursor-pointer"
                  >
                    Citizen Reporter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoUser('volunteer');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-teal-700 font-medium cursor-pointer"
                  >
                    Active Volunteer (Marcus)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoUser('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-teal-700 font-medium cursor-pointer"
                  >
                    Dispatcher Admin (Chief Sarah)
                  </button>
                </div>
              )}
            </div>

            {/* Download Code ZIP button */}
            <a
              href="/rescuepaws-fullstack-code.zip"
              download="rescuepaws-fullstack-code.zip"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Download Complete Frontend & Backend ZIP Archive"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden xl:inline">Download Code</span>
              <span className="px-1 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">.ZIP</span>
            </a>

            {/* Primary Report CTA */}
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Report Animal
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="text-right">
                  <p className="text-xs font-semibold text-stone-900 leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-stone-500 capitalize leading-tight">
                    {user?.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile top actions */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              to="/report"
              className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-lg bg-rose-600 active:bg-rose-700 text-white text-xs font-bold shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {/* Direct 24/7 Hotline Strip in Drawer */}
          <a
            href={EMERGENCY_HOTLINE_TEL}
            className="flex items-center justify-between p-3 rounded-xl bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 fill-current text-emerald-300" />
              <span>24/7 Dispatch Hotline</span>
            </div>
            <span className="font-mono text-emerald-100 text-[11px]">{EMERGENCY_HOTLINE_NUMBER}</span>
          </a>

          <div className="grid grid-cols-1 gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/') ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-stone-700'
              }`}
            >
              Home
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(item.path) ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-stone-700'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200">
            <p className="text-xs font-medium text-stone-500 mb-2">Switch persona:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  switchDemoUser('citizen');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-stone-100 text-stone-700"
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoUser('volunteer');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-stone-100 text-stone-700"
              >
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoUser('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-stone-100 text-stone-700"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Download ZIP in mobile menu */}
          <div className="pt-1">
            <a
              href="/rescuepaws-fullstack-code.zip"
              download="rescuepaws-fullstack-code.zip"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-900 text-sm font-semibold hover:bg-teal-100 transition-colors"
            >
              <Download className="w-4 h-4 text-teal-700" />
              Download Code (.ZIP)
            </a>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            {isAuthenticated ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{user?.name}</p>
                  <p className="text-xs text-stone-500 capitalize">{user?.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
