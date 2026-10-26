import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getReadableAuthError(err) {
  const data = err?.response?.data;

  if (data?.error) {
    if (data.error.toLowerCase().includes('email already')) {
      return 'This email is already registered. Please sign in or use a different email.';
    }
    if (data.error.toLowerCase().includes('validation failed')) {
      const detail = data.details?.[0]?.msg || 'Please check the form values and try again.';
      return detail;
    }
    return data.error;
  }

  if (err?.message) {
    return err.message;
  }

  return 'Registration failed. Please check your details and try again.';
}

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the digital healthcare terms and privacy policy.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerUser(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getReadableAuthError(err));
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
                  Patient Care Network
                </span>
                <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Create your personal health account.
                </h1>
                <p className="mt-3 text-sm text-emerald-100/80 leading-relaxed">
                  Join thousands of patients accessing verified specialists, AI clinical triage, and hospital care across India.
                </p>
              </div>

              {/* Patient Care Benefits */}
              <div className="mt-7 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 text-sm">
                    ✨
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Instant AI Clinical Triage</h2>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5">Evaluate acute symptoms and identify urgent department care</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 text-sm">
                    👨‍⚕️
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">177+ Verified Apollo Specialists</h2>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5">Direct source-verified credentials and senior faculty profiles</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 text-sm">
                    👨‍👩‍👧‍👦
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Family Health Management</h2>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5">Track dependent consultations, prescriptions &amp; triage records</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Registration Link Pill */}
            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-950/30 p-3.5 text-xs text-emerald-200">
              <div className="flex items-center justify-between">
                <span>Are you a medical doctor?</span>
                <Link to="/doctor/register" className="font-bold text-emerald-300 hover:text-white underline">
                  Doctor Register →
                </Link>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT PANEL: THE ELEVATED REGISTRATION FORM
              ========================================================================= */}
          <div className="flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-7 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              
              {/* Form Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-clinical-50 border border-clinical-200 px-3 py-1 text-xs font-bold text-clinical-700 uppercase tracking-wider">
                  Patient Registration
                </span>
                <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Create patient account
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in your details below to activate your MediNexus portal.
                </p>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-fadeIn">
                  <span className="text-base shrink-0">⚠️</span>
                  <div className="flex-1">
                    <span className="font-bold block">Registration Notice</span>
                    <p className="mt-0.5 text-rose-700 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sundaram"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-[#0e3b36] focus:bg-white focus:ring-2 focus:ring-[#0e3b36]/20 font-medium"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
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
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-[#0e3b36] focus:bg-white focus:ring-2 focus:ring-[#0e3b36]/20 font-medium"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-[#0e3b36] focus:bg-white focus:ring-2 focus:ring-[#0e3b36]/20 font-medium"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Password Input with Show/Hide Toggle */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Password <span className="text-rose-500">*</span> <span className="text-slate-400 font-normal">(min. 8 characters)</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Create a strong password"
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

                {/* Terms Agreement Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-clinical-600 focus:ring-clinical-500"
                    />
                    <span className="text-xs text-slate-600">
                      I agree to the <span className="font-semibold text-clinical-700">Digital Healthcare Terms</span> and consent to secure clinical record management.
                    </span>
                  </label>
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
                        <span>Creating patient account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Patient Account</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Bottom Sign-In Link */}
              <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
                <p>
                  Already have a MediNexus account?{' '}
                  <Link to="/login" className="font-bold text-clinical-700 hover:text-clinical-800 hover:underline">
                    Sign in to your account →
                  </Link>
                </p>
              </div>

              {/* Security Footer */}
              <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-400">
                  Protected by 256-bit SSL Healthcare Encryption · MediNexus Apex Quaternary Network
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
