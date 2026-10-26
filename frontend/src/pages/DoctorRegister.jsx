import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DoctorRegister() {
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Cardiology',
    subSpecialty: 'Interventional Cardiology & Critical Care',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    experienceYears: 8,
    registrationNumber: 'NMC-2016-TN-04892',
    registrationCouncil: 'Tamil Nadu Medical Council / NMC',
    hospitalAffiliation: 'Apollo Hospitals, Greams Road, Chennai',
    department: 'Department of Cardiology & Emergency Medicine',
    designation: 'Senior Consultant Physician',
    phone: '+91 98400 12345',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerDoctor(form);
      navigate('/doctor');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.msg ||
        'Failed to register doctor account. Please verify all required fields.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-900 via-[#0a2320] to-[#071917] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-8 sm:p-12 text-white">
        
        {/* Header */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
              Healthcare Practitioner Portal
            </span>
            <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-slate-300">
              NMC Verification
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Doctor &amp; Specialist Onboarding</span>
            <span>🩺</span>
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Create your verified clinical account, register qualifications, clinical experience, and quaternary hospital affiliations.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/20 p-4 text-xs font-bold text-rose-200">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
          
          {/* Section 1: Basic Account & Identity */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-clinical-700">
              1. Doctor Identity &amp; Account Credentials
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name &amp; Title *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Sangeeta Reddy"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Professional Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="doctor.reddy@apollo.hospital"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Password (min 8 chars) *</label>
                <input
                  type="password"
                  required
                  minLength="8"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98400 12345"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Qualifications & NMC Registration */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-clinical-700">
              2. Medical Qualifications &amp; NMC Credentials
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medical Degrees &amp; Qualifications *</label>
                <input
                  type="text"
                  required
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  placeholder="MBBS, MD (Medicine), DM (Cardiology)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Years of Post-Residency Experience *</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NMC / State Council Registration ID *</label>
                <input
                  type="text"
                  required
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  placeholder="NMC-2016-TN-04892"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State Medical Council / Licensing Body</label>
                <input
                  type="text"
                  value={form.registrationCouncil}
                  onChange={(e) => setForm({ ...form, registrationCouncil: e.target.value })}
                  placeholder="Tamil Nadu Medical Council / National Medical Commission"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Specialization & Hospital Affiliation */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-clinical-700">
              3. Specialization &amp; Hospital Network
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Clinical Specialization *</label>
                <input
                  type="text"
                  required
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  placeholder="Cardiology / Internal Medicine"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Specialty / Clinical Focus</label>
                <input
                  type="text"
                  value={form.subSpecialty}
                  onChange={(e) => setForm({ ...form, subSpecialty: e.target.value })}
                  placeholder="Interventional Cardiology &amp; Acute Care"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quaternary Hospital Affiliation *</label>
                <input
                  type="text"
                  required
                  value={form.hospitalAffiliation}
                  onChange={(e) => setForm({ ...form, hospitalAffiliation: e.target.value })}
                  placeholder="Apollo Hospitals, Greams Road, Chennai"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Designation</label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  placeholder="Senior Consultant Physician"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link to="/login" className="text-xs text-slate-300 hover:text-white underline">
              Already have verified credentials? Sign in to Doctor Portal →
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-8 py-3.5 text-sm shadow-xl shadow-emerald-950/40 transition"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Registering Credentials...</span>
                </>
              ) : (
                <>
                  <span>Create Doctor Account &amp; Access Workspace</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
