import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleMeta = {
  user: {
    label: 'Patient',
    fullTitle: 'Patient Portal',
    icon: '👤',
    tagline: 'Personal & Family Healthcare',
    description: 'Access AI symptom triage, discover top hospitals, and manage your family health records.',
    buttonText: 'Sign in to Patient Portal',
    secondaryLinkText: 'Don’t have an account?',
    secondaryActionText: 'Create a patient account',
    secondaryActionUrl: '/register',
    demoEmail: 'user@medinexus.local',
    demoPassword: 'User123!',
  },
  doctor: {
    label: 'Doctor',
    fullTitle: 'Specialist / Doctor Portal',
    icon: '🩺',
    tagline: 'Clinical Practice & Consultations',
    description: 'Manage clinical cases, review patient triage assessments, and update consultation schedules.',
    buttonText: 'Sign in to Doctor Portal',
    secondaryLinkText: 'New healthcare provider?',
    secondaryActionText: 'Apply for verified doctor credentials',
    secondaryActionUrl: '/doctor/register',
    demoEmail: 'doctor@medinexus.local',
    demoPassword: 'Doctor123!',
  },
  admin: {
    label: 'Admin',
    fullTitle: 'Hospital Administrator',
    icon: '🛡️',
    tagline: 'Network & Registry Operations',
    description: 'Manage hospital directories, verify doctor NMC credentials, and inspect operational metrics.',
    buttonText: 'Sign in to Admin Console',
    secondaryLinkText: 'Healthcare IT personnel?',
    secondaryActionText: 'Administrative access restricted to authorized officers',
    secondaryActionUrl: null,
    demoEmail: 'admin@medinexus.local',
    demoPassword: 'ChangeMe123!',
  },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeRole = roleMeta[form.role] || roleMeta.user;

  function handleRoleChange(newRole) {
    setForm((prev) => ({ ...prev, role: newRole }));
    setError(null);
  }

  function handleQuickFill(targetRole) {
    const meta = roleMeta[targetRole];
    setForm({
      email: meta.demoEmail,
      password: meta.demoPassword,
      role: targetRole,
    });
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const account = await login(form);
      if (account.role === 'admin') navigate('/admin');
      else if (account.role === 'doctor') navigate('/doctor');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email, password, and portal role.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-900 via-[#0a2320] to-[#071917] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <div className="grid min-h-[640px] lg:grid-cols-12">
          
          {/* =========================================================================
              LEFT PANEL: APEX CLINICAL BRANDING & AUTHORITY
              ========================================================================= */}
          <div className="relative isolate flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0c2a27] via-[#0f3833] to-[#071917] p-8 text-white lg:col-span-5 lg:p-10 border-b border-white/10 lg:border-b-0 lg:border-r">
            {/* Background Medical Cross Watermark Glow */}
            <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 -z-10 h-64 w-64 rounded-full bg-[#a54836]/15 blur-3xl pointer-events-none" />

            <div>
              {/* MediNexus Apex Care Brand Pill */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-white font-bold text-xl shadow-inner">
                  M+
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight text-white">MediNexus</span>
                    <span className="rounded-full bg-emerald-500/25 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                      Apex Care
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80">Quaternary Hospital Network</p>
                </div>
              </div>

              {/* Authority Heading */}
              <div className="mt-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Apollo &amp; AIIMS Benchmark Care
                </span>
                <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Smarter, verified hospital access for every patient.
                </h1>
                <p className="mt-3 text-sm text-emerald-100/80 leading-relaxed">
                  Secure access to verified specialist profiles, hospital discovery, and emergency healthcare coordination across India.
                </p>
              </div>

              {/* Verified Trust Pillars */}
              <div className="mt-7 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 text-sm">
                    👨‍⚕️
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">177+ Verified Apollo Specialists</h2>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5">Source-verified NMC registration &amp; official qualifications</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 text-sm">
                    🚨
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">24/7 Level-1 Trauma Emergency</h2>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5">Immediate 1066 (Apollo) / 108 direct dispatch</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 text-sm">
                    🔒
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">HIPAA-Grade Security &amp; Privacy</h2>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5">256-bit encrypted health data &amp; clinical triage history</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Emergency Help Box */}
            <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                  Need Emergency Care?
                </span>
                <a href="tel:1066" className="font-bold text-rose-300 hover:text-white underline">
                  Call 1066 / 108
                </a>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT PANEL: THE ELEVATED LOGIN FORM
              ========================================================================= */}
          <div className="flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-7 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              
              {/* Form Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-clinical-50 border border-clinical-200 px-3 py-1 text-xs font-bold text-clinical-700 uppercase tracking-wider">
                  Healthcare Access Portal
                </span>
                <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Sign in to your account
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select your portal role below to access clinical tools.
                </p>
              </div>

              {/* Role Selection Tabs */}
              <div className="mb-5">
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                  {['user', 'doctor', 'admin'].map((r) => {
                    const meta = roleMeta[r];
                    const isSelected = form.role === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-all duration-150 ${
                          isSelected
                            ? 'bg-[#0e3b36] text-white shadow-md'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                        }`}
                      >
                        <span className="text-sm">{meta.icon}</span>
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Role Context Helper Banner */}
                <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-[11px] text-slate-600">
                  <span className="text-clinical-700 font-bold shrink-0">ℹ️</span>
                  <span>{activeRole.description}</span>
                </div>
              </div>

              {/* Quick-Fill Demo Account Helper */}
              <div className="mb-5 rounded-2xl bg-slate-50 border border-slate-200/70 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Quick Fill Demo Credentials
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">1-Click Test</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('user')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                      form.role === 'user' && form.email === roleMeta.user.demoEmail
                        ? 'bg-clinical-100 text-clinical-800 border-clinical-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    👤 Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('doctor')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                      form.role === 'doctor' && form.email === roleMeta.doctor.demoEmail
                        ? 'bg-clinical-100 text-clinical-800 border-clinical-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🩺 Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                      form.role === 'admin' && form.email === roleMeta.admin.demoEmail
                        ? 'bg-clinical-100 text-clinical-800 border-clinical-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-fadeIn">
                  <span className="text-base shrink-0">⚠️</span>
                  <div className="flex-1">
                    <span className="font-bold block">Authentication Notice</span>
                    <p className="mt-0.5 text-rose-700 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* The Actual Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-700">
                    <span>Email Address <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] font-normal text-slate-400">Registered account</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@hospital.com"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-[#0e3b36] focus:bg-white focus:ring-2 focus:ring-[#0e3b36]/20 font-medium"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Password Input with Show/Hide Toggle */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-clinical-700 hover:text-clinical-800 cursor-pointer">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-11 py-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-[#0e3b36] focus:bg-white focus:ring-2 focus:ring-[#0e3b36]/20 font-medium"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-clinical-600 focus:ring-clinical-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">Keep me signed in on this device</span>
                  </label>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>🔒</span> SSL Encrypted
                  </span>
                </div>

                {/* Submit Primary CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#a54836] hover:bg-[#883c2e] active:scale-[0.99] py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-[#a54836]/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Authenticating credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>{activeRole.buttonText}</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Dynamic Bottom Links for Each Role */}
              <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
                {activeRole.secondaryActionUrl ? (
                  <p>
                    {activeRole.secondaryLinkText}{' '}
                    <Link
                      to={activeRole.secondaryActionUrl}
                      className="font-bold text-clinical-700 hover:text-clinical-800 hover:underline"
                    >
                      {activeRole.secondaryActionText}
                    </Link>
                  </p>
                ) : (
                  <p className="text-slate-500">{activeRole.secondaryActionText}</p>
                )}
              </div>

              {/* Security & Regulatory Compliance Footer */}
              <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-400">
                  Protected by Enterprise Healthcare Security · MediNexus Apex Quaternary Network
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
