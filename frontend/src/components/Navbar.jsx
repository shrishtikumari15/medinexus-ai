import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navItems = [
    { to: '/assessment', label: 'AI Assessment', highlight: true },
    { to: '/hospitals', label: 'Find Hospitals' },
    { to: '/doctors', label: 'Find Doctors' },
    ...(user?.role === 'user' ? [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/history', label: 'History' },
      { to: '/family', label: 'Family' },
    ] : []),
    ...(user?.role === 'doctor' ? [{ to: '/doctor', label: 'My Workspace' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Administration' }] : []),
  ];

  function navClass({ isActive }) {
    return `whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-clinical-50 text-clinical-700 shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-clinical-700'
    }`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-clinical-100/80 bg-white/95 shadow-sm backdrop-blur-md">
      {/* Top Emergency & Clinical Care Helpline Bar */}
      <div className="bg-[#081e1c] text-white text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#123632]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-200">National Apex Care Network</span>
            <span className="hidden sm:inline text-slate-300">· AIIMS &amp; Apollo Benchmark Healthcare Standards</span>
            <span className="hidden lg:inline text-emerald-400 font-bold border-l border-white/20 pl-2">Apex Quaternary Standards</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <a href="tel:1066" className="flex items-center gap-1.5 text-rose-300 hover:text-rose-100 transition font-bold" title="Apollo & National Emergency Hotline">
              <span>🚨 24/7 Emergency: 1066 / 108</span>
            </a>
            <span className="text-white/20 hidden md:inline">|</span>
            <a href="tel:18605001066" className="hidden md:flex items-center gap-1.5 text-slate-200 hover:text-white transition">
              <span>📞 Helpline: 1860-500-1066</span>
            </a>
            <span className="text-white/20 hidden lg:inline">|</span>
            <Link to="/hospitals?emergency=true" className="hidden lg:inline text-amber-300 hover:text-amber-200 font-semibold transition">
              ⚡ 24/7 Trauma Emergency
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-3 group" aria-label="MediNexus home">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-clinical-600 via-clinical-700 to-clinical-900 text-white shadow-md shadow-clinical-700/20 transition group-hover:scale-105 border border-clinical-500/30">
            <span className="text-xl font-black tracking-tight">M+</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-ink">MediNexus</span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Apex Care
              </span>
            </div>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">
              Quaternary Hospital Network · AIIMS &amp; Apollo Benchmark Care
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                item.highlight
                  ? `whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-bold transition ${
                      isActive
                        ? 'bg-clinical-700 text-white shadow-sm'
                        : 'bg-clinical-50 text-clinical-700 hover:bg-clinical-100'
                    }`
                  : navClass({ isActive })
              }
            >
              {item.highlight && <span className="mr-1.5 text-xs">✨</span>}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Auth Controls */}
        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden max-w-44 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 lg:block">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-urgent-200 hover:bg-urgent-50 hover:text-urgent-600"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-clinical-700 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-clinical-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-clinical-700/20 transition hover:bg-clinical-800 hover:shadow"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
