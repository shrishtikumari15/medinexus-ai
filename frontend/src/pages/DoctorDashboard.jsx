import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorPatientCases,
  savePatientCaseNote,
} from '../services/doctorApi';

export default function DoctorDashboard() {
  const { user } = useAuth();

  // State Management
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialization: '',
    subSpecialty: '',
    qualification: '',
    experienceYears: 8,
    registrationNumber: '',
    registrationCouncil: '',
    hospitalAffiliation: '',
    department: '',
    designation: '',
    consultationFee: 1200,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: '09:00 AM - 02:00 PM',
    phone: '',
    bio: '',
    languages: ['English', 'Hindi', 'Tamil'],
    clinicalInterests: ['Shock Index Optimization', 'Acute Coronary Syndrome', 'Non-Invasive Hemodynamic Monitoring'],
  });

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Filtering & Search
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'reports' | 'profile' | 'referrals'
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all'); // 'all' | 'high' | 'low'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in_review' | 'completed'
  const [reportFlagFilter, setReportFlagFilter] = useState('all'); // 'all' | 'critical' | 'abnormal' | 'normal'

  // Modal / Drawer for Patient Case Inspection & Consultation Note
  const [selectedCase, setSelectedCase] = useState(null);
  const [consultationForm, setConsultationForm] = useState({
    clinicalNotes: '',
    diagnosisImpression: '',
    prescriptions: '',
    recommendedAction: '',
    status: 'completed',
  });
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccessMsg, setNoteSuccessMsg] = useState('');

  // Selected Report Modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Load Doctor Profile & Cases
  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        const [profileRes, casesRes] = await Promise.allSettled([
          getDoctorProfile(),
          getDoctorPatientCases(),
        ]);

        if (!active) return;

        if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
          const p = profileRes.value.data;
          setProfile(p);
          setProfileForm({
            name: p.name || user?.name || '',
            specialization: p.specialization || 'General Medicine',
            subSpecialty: p.subSpecialty || 'Interventional Cardiology & Acute Care',
            qualification: p.qualification || 'MBBS, MD, DM',
            experienceYears: p.experienceYears ?? 8,
            registrationNumber: p.registrationNumber || 'NMC-2016-TN-04892',
            registrationCouncil: p.registrationCouncil || 'Tamil Nadu Medical Council / NMC',
            hospitalAffiliation: p.hospitalAffiliation || 'Apollo Hospitals, Greams Road, Chennai',
            department: p.department || 'Department of Cardiology & Emergency Medicine',
            designation: p.designation || 'Senior Consultant Physician & Triage Specialist',
            consultationFee: p.consultationFee ?? 1200,
            availableDays: p.availableDays?.length ? p.availableDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            availableHours: p.availableHours || '09:00 AM - 02:00 PM',
            phone: p.phone || '+91 98400 12345',
            bio: p.bio || 'Senior clinical consultant specializing in acute cardiac stabilization, physiological triage urgency stratification, and critical emergency transfers across AIIMS and Apollo Quaternary Hospital Networks.',
            languages: p.languages?.length ? p.languages : ['English', 'Hindi', 'Tamil'],
            clinicalInterests: p.clinicalInterests?.length ? p.clinicalInterests : ['Shock Index Optimization', 'Acute Coronary Syndrome', 'Non-Invasive Hemodynamic Monitoring'],
          });
        }

        if (casesRes.status === 'fulfilled' && casesRes.value?.data) {
          setCases(casesRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load doctor workspace telemetry:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [user]);

  // Handle Profile Update
  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const res = await updateDoctorProfile(profileForm);
      if (res?.data) {
        setProfile(res.data);
        setProfileSuccessMsg('Profile and NMC qualifications updated successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err) {
      setProfileErrorMsg(err.response?.data?.error || 'Failed to update doctor profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  // Open Case Inspection Modal
  function handleOpenCase(patientCase) {
    setSelectedCase(patientCase);
    setConsultationForm({
      clinicalNotes: patientCase.doctorReview?.clinicalNotes || '',
      diagnosisImpression: patientCase.doctorReview?.diagnosisImpression || '',
      prescriptions: Array.isArray(patientCase.doctorReview?.prescriptions)
        ? patientCase.doctorReview.prescriptions.join('\n')
        : '',
      recommendedAction: patientCase.doctorReview?.recommendedAction || (patientCase.isCritical ? 'Urgent Cath Lab Transfer & Continuous Monitoring' : 'Discharge with Outpatient Cardiology Follow-up'),
      status: patientCase.doctorReview?.status || (patientCase.isCritical ? 'in_review' : 'completed'),
    });
    setNoteSuccessMsg('');
  }

  // Save Consultation Note
  async function handleSaveNote(e) {
    e.preventDefault();
    if (!selectedCase) return;

    setSavingNote(true);
    setNoteSuccessMsg('');
    try {
      const prescriptionsArray = consultationForm.prescriptions
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await savePatientCaseNote(selectedCase._id, {
        clinicalNotes: consultationForm.clinicalNotes,
        diagnosisImpression: consultationForm.diagnosisImpression,
        prescriptions: prescriptionsArray,
        recommendedAction: consultationForm.recommendedAction,
        status: consultationForm.status,
      });

      if (res?.data) {
        setNoteSuccessMsg('Clinical consultation note and prescription signed successfully!');
        // Update local case state
        setCases((prev) =>
          prev.map((c) =>
            c._id === selectedCase._id
              ? {
                  ...c,
                  doctorReview: {
                    ...c.doctorReview,
                    status: consultationForm.status,
                    clinicalNotes: consultationForm.clinicalNotes,
                    diagnosisImpression: consultationForm.diagnosisImpression,
                    prescriptions: prescriptionsArray,
                    recommendedAction: consultationForm.recommendedAction,
                    reviewedAt: new Date(),
                  },
                }
              : c
          )
        );
        setTimeout(() => {
          setSelectedCase(null);
          setNoteSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      console.error('Error saving consultation note:', err);
    } finally {
      setSavingNote(false);
    }
  }

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.patientName.toLowerCase().includes(q);
        const matchesComplaint = c.chiefComplaint.toLowerCase().includes(q);
        const matchesId = c._id.toString().includes(q);
        const matchesSpec = c.requiredSpecialties.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesComplaint && !matchesId && !matchesSpec) return false;
      }
      // Urgency
      if (urgencyFilter === 'high' && !c.isCritical) return false;
      if (urgencyFilter === 'low' && c.isCritical) return false;
      // Status
      if (statusFilter !== 'all' && c.doctorReview?.status !== statusFilter) return false;

      return true;
    });
  }, [cases, searchQuery, urgencyFilter, statusFilter]);

  // Aggregate all diagnostic reports across cases for Reports Vault
  const allDiagnosticReports = useMemo(() => {
    const list = [];
    cases.forEach((c) => {
      (c.diagnosticReports || []).forEach((r) => {
        list.push({
          ...r,
          caseId: c._id,
          patientName: c.patientName,
          patientAge: c.patientAge,
          patientGender: c.patientGender,
          chiefComplaint: c.chiefComplaint,
          isCritical: c.isCritical,
          date: r.sampleCollectedAt || c.createdAt,
        });
      });
    });
    return list;
  }, [cases]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return allDiagnosticReports.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = r.patientName.toLowerCase().includes(q);
        const matchTest = r.testName.toLowerCase().includes(q);
        const matchCategory = (r.category || '').toLowerCase().includes(q);
        if (!matchName && !matchTest && !matchCategory) return false;
      }
      if (reportFlagFilter !== 'all' && r.flag !== reportFlagFilter) return false;
      return true;
    });
  }, [allDiagnosticReports, searchQuery, reportFlagFilter]);

  // Statistical KPIs
  const totalCasesCount = cases.length;
  const criticalCasesCount = cases.filter((c) => c.isCritical).length;
  const pendingCasesCount = cases.filter((c) => c.doctorReview?.status === 'pending').length;
  const totalReportsCount = allDiagnosticReports.length;
  const abnormalReportsCount = allDiagnosticReports.filter((r) => r.flag === 'critical' || r.flag === 'abnormal').length;

  return (
    <main className="min-h-screen bg-slate-50/70 pb-16">
      {/* =========================================================================
          1. CLINICAL WORKSPACE TOP BANNER & BRAND AUTHORITY
          ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a2320] to-[#071917] text-white border-b border-clinical-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Clinical Practice Console Active
                </span>
                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-slate-300 border border-white/10">
                  NMC Verified Practitioner
                </span>
                <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-xs font-semibold text-blue-300">
                  Apollo &amp; AIIMS Network Tier
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Welcome, Dr. {profile?.name || user?.name || 'Physician'}</span>
                <span className="text-xl">🩺</span>
              </h1>

              <p className="mt-1 text-sm text-slate-300 max-w-3xl leading-relaxed">
                {profile?.designation || 'Senior Consultant Physician'} · {profile?.specialization || 'General Medicine'} ·{' '}
                <span className="text-emerald-300 font-medium">{profile?.hospitalAffiliation || 'Apollo Hospitals Network'}</span>
              </p>
            </div>

            {/* Quick Emergency Transfer & Contact Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">Emergency Trauma Hotline</span>
                  <span className="font-bold text-rose-400">🚨 Apollo 1066 / 108</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">NMC Reg ID</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {profile?.registrationNumber || 'NMC-2016-TN-04892'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 text-xs shadow-lg shadow-emerald-900/30 transition transform hover:-translate-y-0.5"
              >
                <span>Edit Profile &amp; Qualifications</span>
                <span>⚙️</span>
              </button>
            </div>
          </div>

          {/* Clinical Workstation Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('cases')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
                activeTab === 'cases'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>📋 Patient Triage &amp; Active Cases</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${activeTab === 'cases' ? 'bg-slate-900 text-white' : 'bg-white/20 text-white'}`}>
                {totalCasesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
                activeTab === 'reports'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>🧪 Diagnostic Reports Vault</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${activeTab === 'reports' ? 'bg-slate-900 text-white' : 'bg-white/20 text-white'}`}>
                {totalReportsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>👨‍⚕️ Doctor Profile &amp; Experience</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                Verified
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('referrals')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
                activeTab === 'referrals'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>🏥 Quaternary Referral Network</span>
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-300">
                30,270+
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. EXECUTIVE CLINICAL KPI CARDS
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Patient Stays</span>
              <span className="rounded-xl bg-blue-50 p-2 text-base border border-blue-100">👥</span>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{totalCasesCount}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">MIMIC-IV-ED clinical ingest</span>
              <span className="font-semibold text-clinical-700">{pendingCasesCount} Pending Review</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Critical / High Urgency</span>
              <span className="rounded-xl bg-rose-100 p-2 text-base border border-rose-200">🚨</span>
            </div>
            <p className="mt-2 text-3xl font-black text-rose-700">{criticalCasesCount}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-rose-600 font-semibold">Shock Index &gt; 0.9 / SpO2 &lt; 92%</span>
              <span className="inline-flex items-center gap-1 font-bold text-rose-800">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                Immediate Action
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Diagnostic Reports</span>
              <span className="rounded-xl bg-emerald-100 p-2 text-base border border-emerald-200">🔬</span>
            </div>
            <p className="mt-2 text-3xl font-black text-emerald-800">{totalReportsCount}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold">{abnormalReportsCount} Abnormal / Flagged</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reports');
                  setReportFlagFilter('abnormal');
                }}
                className="font-bold text-emerald-800 hover:underline"
              >
                Inspect →
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Practice Credentials</span>
              <span className="rounded-xl bg-purple-50 p-2 text-base border border-purple-100">🎓</span>
            </div>
            <p className="mt-2 text-3xl font-black text-purple-900">{profile?.experienceYears || 8}+ Yrs</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-purple-700 font-semibold truncate max-w-[170px]">
                {profile?.qualification || 'MBBS, MD, DM'}
              </span>
              <span className="font-bold text-emerald-600">NMC Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. TAB CONTENT WORKSPACES
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* =========================================================================
            TAB 1: PATIENT CASES & CLINICAL TRIAGE
            ========================================================================= */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient name, chief complaint (e.g. chest pain, dyspnea), case ID..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-clinical-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinical-600"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Urgency Filter */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 mr-1">Urgency:</span>
                  <button
                    type="button"
                    onClick={() => setUrgencyFilter('all')}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      urgencyFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({cases.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgencyFilter('high')}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      urgencyFilter === 'high'
                        ? 'bg-rose-700 text-white'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    🚨 High Urgency ({criticalCasesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgencyFilter('low')}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      urgencyFilter === 'low'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Routine ({cases.length - criticalCasesCount})
                  </button>
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 mr-1">Review Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                  >
                    <option value="all">All Reviews</option>
                    <option value="pending">Pending Review</option>
                    <option value="in_review">In Clinical Review</option>
                    <option value="completed">Completed / Signed</option>
                    <option value="admitted">Admitted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cases Count Banner */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong>{filteredCases.length}</strong> active clinical triage cases
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live MIMIC-ED &amp; Apollo Triage Stream
              </span>
            </div>

            {/* Cases List */}
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-clinical-600 border-t-transparent mx-auto" />
                <p className="mt-3 text-sm font-semibold text-slate-700">Loading patient triage records &amp; diagnostic telemetry...</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-3xl">📋</p>
                <h3 className="mt-2 text-base font-bold text-slate-800">No Patient Cases Found</h3>
                <p className="text-xs text-slate-500 mt-1">Try resetting your search query or urgency filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setUrgencyFilter('all');
                    setStatusFilter('all');
                  }}
                  className="mt-4 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCases.map((c) => {
                  const sbp = c.clinicalInputs?.sbp || 120;
                  const dbp = c.clinicalInputs?.dbp || 80;
                  const hr = c.clinicalInputs?.heartrate || 80;
                  const o2 = c.clinicalInputs?.o2sat || 98;
                  const temp = c.clinicalInputs?.temperature || 98.6;
                  const pain = c.clinicalInputs?.pain || 0;
                  const si = c.physiologicalMarkers?.shockIndex;
                  const isHighRisk = c.isCritical;

                  return (
                    <article
                      key={c._id}
                      className={`rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                        isHighRisk ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        {/* Patient Demographics & Complaint */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-black text-slate-900">{c.patientName}</h3>
                            <span className="text-xs text-slate-500">
                              ({c.patientAge}y · {c.patientGender === 'M' ? 'Male' : c.patientGender === 'F' ? 'Female' : 'Other'})
                            </span>
                            <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              Relation: {c.relationship}
                            </span>
                            {c.doctorReview?.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                ✓ Reviewed &amp; Signed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 animate-pulse">
                                ● Action Pending
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-700">Chief Complaint:</span>
                            <span className="text-slate-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                              "{c.chiefComplaint}"
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400">
                            Location: {c.locationText} · Registered: {new Date(c.createdAt).toLocaleString()} · ID: {c._id.toString().slice(-8)}
                          </p>
                        </div>

                        {/* Urgency Badge & Action */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                          <div className="text-right">
                            {isHighRisk ? (
                              <div className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                                HIGH URGENCY TRIAGE
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white shadow-sm">
                                ✓ ROUTINE / LOW URGENCY
                              </div>
                            )}
                            <span className="block text-[10px] font-semibold text-slate-500 mt-1">
                              Model: {c.riskPrediction?.modelName || 'XGBoost Champion'} ·{' '}
                              {c.riskPrediction?.probabilityHigh ? `${(c.riskPrediction.probabilityHigh * 100).toFixed(1)}% Urgency Risk` : 'Classified'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenCase(c)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-clinical-700 hover:bg-clinical-800 text-white font-bold px-4 py-2.5 text-xs shadow transition whitespace-nowrap"
                          >
                            <span>Open Chart &amp; Reports</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>

                      {/* Vital Signs Grid */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
                        {/* HR */}
                        <div className={`rounded-xl p-2.5 border ${hr > 100 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Heart Rate</span>
                          <strong className={`text-base font-black ${hr > 100 ? 'text-rose-700' : 'text-slate-800'}`}>
                            {hr} <span className="text-[10px] font-normal text-slate-500">BPM</span>
                          </strong>
                        </div>

                        {/* BP */}
                        <div className={`rounded-xl p-2.5 border ${sbp > 140 || sbp < 90 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Blood Pressure</span>
                          <strong className="text-base font-black text-slate-800">
                            {sbp}/{dbp} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                          </strong>
                        </div>

                        {/* SpO2 */}
                        <div className={`rounded-xl p-2.5 border ${o2 < 93 ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">SpO2 Oxygen</span>
                          <strong className={`text-base font-black ${o2 < 93 ? 'text-rose-700' : 'text-slate-800'}`}>
                            {o2}% {o2 < 93 && <span className="text-[9px] bg-rose-600 text-white px-1 rounded">Hypoxic</span>}
                          </strong>
                        </div>

                        {/* Shock Index */}
                        <div className={`rounded-xl p-2.5 border ${si && si >= 0.9 ? 'bg-rose-100 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Shock Index (HR/SBP)</span>
                          <strong className={`text-base font-black ${si && si >= 0.9 ? 'text-rose-800' : 'text-slate-800'}`}>
                            {si || '0.67'} {si && si >= 0.9 && <span className="text-[9px] text-rose-600 block">Critical</span>}
                          </strong>
                        </div>

                        {/* Temp */}
                        <div className="rounded-xl p-2.5 border bg-slate-50 border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Temperature</span>
                          <strong className="text-base font-black text-slate-800">
                            {temp}°F
                          </strong>
                        </div>

                        {/* Pain */}
                        <div className="rounded-xl p-2.5 border bg-slate-50 border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Pain Scale</span>
                          <strong className="text-base font-black text-slate-800">
                            {pain}/10
                          </strong>
                        </div>
                      </div>

                      {/* Diagnostic Reports Summary & Specialties */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-500">Required Specialties:</span>
                          {c.requiredSpecialties.map((s, idx) => (
                            <span key={idx} className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold">
                            🔬 {c.diagnosticReports?.length || 4} Diagnostic Reports Attached
                          </span>
                          {c.doctorReview?.clinicalNotes && (
                            <span className="text-[11px] text-slate-500 italic truncate max-w-xs">
                              Note: "{c.doctorReview.clinicalNotes}"
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: DIAGNOSTIC REPORTS VAULT
            ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Header & Filter */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Patient Diagnostic Laboratory &amp; ECG Reports</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review held-out diagnostic reports, 12-lead ECG strips, arterial blood gas analyses, and cardiac biomarkers.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-600">Filter Flag:</span>
                  <button
                    type="button"
                    onClick={() => setReportFlagFilter('all')}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      reportFlagFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Reports ({allDiagnosticReports.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFlagFilter('critical')}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      reportFlagFilter === 'critical'
                        ? 'bg-rose-700 text-white'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    🚨 Critical Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFlagFilter('abnormal')}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      reportFlagFilter === 'abnormal'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Abnormal Values
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportFlagFilter('normal')}
                    className={`rounded-lg px-3 py-1.5 font-bold transition ${
                      reportFlagFilter === 'normal'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Normal Baseline
                  </button>
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredReports.map((r, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    r.flag === 'critical'
                      ? 'border-rose-300 bg-rose-50/20'
                      : r.flag === 'abnormal'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-700">
                          {r.category || 'Diagnostic'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-[10px] text-slate-400">ID: {r.reportId}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{r.testName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Patient: <strong className="text-slate-800">{r.patientName}</strong> ({r.patientAge}y · {r.patientGender})
                      </p>
                    </div>

                    {r.flag === 'critical' ? (
                      <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm animate-pulse">
                        Critical Flag
                      </span>
                    ) : r.flag === 'abnormal' ? (
                      <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                        Abnormal
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                        Normal
                      </span>
                    )}
                  </div>

                  {/* Findings Box */}
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Observed Value:</span>
                      <strong className={`font-mono text-sm ${r.flag === 'critical' ? 'text-rose-700 font-black' : 'text-slate-900'}`}>
                        {r.result}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Standard Reference Range:</span>
                      <span className="font-semibold text-slate-700">{r.referenceRange}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 leading-relaxed">
                      <strong>Clinical Interpretation:</strong> {r.interpretation}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Sample: {new Date(r.date).toLocaleDateString()} {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const targetCase = cases.find((c) => c._id === r.caseId);
                        if (targetCase) handleOpenCase(targetCase);
                      }}
                      className="font-bold text-clinical-700 hover:text-clinical-900 hover:underline"
                    >
                      Open Full Patient Chart →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: DOCTOR PROFILE & NMC CREDENTIALS
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Success / Error Alerts */}
            {profileSuccessMsg && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 shadow-sm flex items-center justify-between">
                <span>✓ {profileSuccessMsg}</span>
                <span className="text-xs text-emerald-600">Saved to MediNexus Database</span>
              </div>
            )}
            {profileErrorMsg && (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-800 shadow-sm">
                ⚠️ {profileErrorMsg}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-12">
              {/* Profile Editor Form */}
              <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900">Manage Professional Practice &amp; Qualifications</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Update your verified clinical specialties, experience years, medical registration number, and hospital affiliations.
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Row 1: Name & Registration Number */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Full Name &amp; Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Dr. Rajesh Sharma"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        NMC / State Registration ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.registrationNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, registrationNumber: e.target.value })}
                        placeholder="NMC-2016-TN-04892"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>
                  </div>

                  {/* Row 2: Qualification & Experience */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Medical Qualifications &amp; Degrees *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.qualification}
                        onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                        placeholder="MBBS, MD (Internal Medicine), DM (Cardiology)"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Specify all postgraduate degrees and fellowships</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Years of Clinical Experience *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        required
                        value={profileForm.experienceYears}
                        onChange={(e) => setProfileForm({ ...profileForm, experienceYears: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Total post-residency clinical experience</span>
                    </div>
                  </div>

                  {/* Row 3: Specialization & Sub-Specialty */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Primary Clinical Specialization *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.specialization}
                        onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                        placeholder="Cardiology / Internal Medicine"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Sub-Specialty / Clinical Focus
                      </label>
                      <input
                        type="text"
                        value={profileForm.subSpecialty}
                        onChange={(e) => setProfileForm({ ...profileForm, subSpecialty: e.target.value })}
                        placeholder="Interventional Cardiology, Acute Coronary Syndrome"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>
                  </div>

                  {/* Row 4: Hospital Affiliation & Designation */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Quaternary Hospital Affiliation *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.hospitalAffiliation}
                        onChange={(e) => setProfileForm({ ...profileForm, hospitalAffiliation: e.target.value })}
                        placeholder="Apollo Hospitals, Greams Road, Chennai"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Clinical Designation / Role
                      </label>
                      <input
                        type="text"
                        value={profileForm.designation}
                        onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                        placeholder="Senior Consultant Physician & Triage Director"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>
                  </div>

                  {/* Row 5: Registration Council & Consultation Fee */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Medical Licensing Council
                      </label>
                      <input
                        type="text"
                        value={profileForm.registrationCouncil}
                        onChange={(e) => setProfileForm({ ...profileForm, registrationCouncil: e.target.value })}
                        placeholder="Tamil Nadu Medical Council / National Medical Commission"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Consultation Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={profileForm.consultationFee}
                        onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>
                  </div>

                  {/* Row 6: OPD Hours & Phone */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        OPD Consulting Hours
                      </label>
                      <input
                        type="text"
                        value={profileForm.availableHours}
                        onChange={(e) => setProfileForm({ ...profileForm, availableHours: e.target.value })}
                        placeholder="09:00 AM - 02:00 PM"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Professional Direct Contact Phone
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+91 98400 12345"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Professional Clinical Biography &amp; Practice Highlights
                    </label>
                    <textarea
                      rows="3"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Outline your background, hospital appointments, clinical sub-specialties, and clinical leadership."
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-3 text-sm shadow-md shadow-emerald-900/20 transition"
                    >
                      {savingProfile ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <span>Save &amp; Update Clinical Profile</span>
                          <span>✓</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Profile Preview Card */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-700">
                      Public Directory Card Preview
                    </span>
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Verified
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-clinical-600 to-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                      {profileForm.name?.replace('Dr.', '').trim().charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{profileForm.name || 'Dr. Practitioner'}</h3>
                      <p className="text-xs font-semibold text-clinical-700">{profileForm.specialization}</p>
                      <p className="text-[11px] text-slate-500">{profileForm.experienceYears} Years Experience</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Qualifications</span>
                      <strong className="text-slate-800">{profileForm.qualification}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Affiliation</span>
                      <span className="text-slate-800 font-semibold">{profileForm.hospitalAffiliation}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Medical Council</span>
                      <span className="font-mono text-slate-700">{profileForm.registrationNumber}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Consultation:</span>
                      <strong className="text-slate-900 font-bold">₹{profileForm.consultationFee}</strong>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-900 leading-relaxed">
                    ℹ️ Patients searching on the <Link to="/doctors" className="font-bold underline">Find Doctors</Link> directory will see this verified credential badge.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: QUATERNARY REFERRAL NETWORK
            ========================================================================= */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Inter-Hospital Quaternary Referral &amp; Trauma Network</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct access to accredited quaternary hospitals, cardiac catheterization suites, and ICU capacity across India.
                  </p>
                </div>
                <Link
                  to="/hospitals"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-clinical-700 hover:bg-clinical-800 text-white font-bold px-4 py-2 text-xs shadow transition"
                >
                  <span>Search All 30,270+ Hospitals</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Emergency Hotline Cards */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                  <span className="text-xs font-bold text-rose-800 uppercase block">Apollo Quaternary Emergency</span>
                  <p className="mt-1 text-2xl font-black text-rose-700">1066</p>
                  <p className="mt-1 text-xs text-rose-600">Immediate inter-facility cardiac &amp; trauma transfer</p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <span className="text-xs font-bold text-amber-800 uppercase block">National Ambulance Fleet</span>
                  <p className="mt-1 text-2xl font-black text-amber-700">108 / 102</p>
                  <p className="mt-1 text-xs text-amber-600">GPS-monitored ALS ambulance dispatch</p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <span className="text-xs font-bold text-blue-800 uppercase block">AIIMS Apex Referral Helpline</span>
                  <p className="mt-1 text-2xl font-black text-blue-700">1860-500-1066</p>
                  <p className="mt-1 text-xs text-blue-600">Government tertiary &amp; super-specialty network</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          4. INTERACTIVE PATIENT CHART & CONSULTATION NOTE MODAL / DRAWER
          ========================================================================= */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-clinical-50 border border-clinical-200 px-3 py-0.5 text-xs font-bold text-clinical-700">
                    Clinical Chart &amp; Diagnostic Review
                  </span>
                  {selectedCase.isCritical && (
                    <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black text-white animate-pulse">
                      Critical Risk Alert
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedCase.patientName}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedCase.patientAge} Years · {selectedCase.patientGender} · Relation: {selectedCase.relationship} · Phone: {selectedCase.contactPhone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Vital Signs Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                <strong className="text-base text-slate-900">{selectedCase.clinicalInputs?.heartrate || 80} BPM</strong>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">BP (SBP/DBP)</span>
                <strong className="text-base text-slate-900">{selectedCase.clinicalInputs?.sbp || 120}/{selectedCase.clinicalInputs?.dbp || 80}</strong>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">SpO2 Oxygen</span>
                <strong className="text-base text-slate-900">{selectedCase.clinicalInputs?.o2sat || 98}%</strong>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Shock Index</span>
                <strong className={`text-base ${selectedCase.physiologicalMarkers?.shockIndex >= 0.9 ? 'text-rose-700 font-black' : 'text-slate-900'}`}>
                  {selectedCase.physiologicalMarkers?.shockIndex || '0.67'}
                </strong>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Temperature</span>
                <strong className="text-base text-slate-900">{selectedCase.clinicalInputs?.temperature || 98.6}°F</strong>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Pain Score</span>
                <strong className="text-base text-slate-900">{selectedCase.clinicalInputs?.pain || 0}/10</strong>
              </div>
            </div>

            {/* Attached Diagnostic Reports Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Attached Diagnostic Reports ({selectedCase.diagnosticReports?.length || 0})</span>
                <span className="text-[11px] font-normal text-slate-500">Held-Out Clinical Lab Data</span>
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="px-4 py-2.5">Test Name</th>
                      <th className="px-4 py-2.5">Result</th>
                      <th className="px-4 py-2.5">Reference Range</th>
                      <th className="px-4 py-2.5">Flag</th>
                      <th className="px-4 py-2.5">Clinical Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCase.diagnosticReports?.map((r, idx) => (
                      <tr key={idx} className={r.flag === 'critical' ? 'bg-rose-50/50' : ''}>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{r.testName}</td>
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{r.result}</td>
                        <td className="px-4 py-2.5 text-slate-500">{r.referenceRange}</td>
                        <td className="px-4 py-2.5">
                          {r.flag === 'critical' ? (
                            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Critical</span>
                          ) : r.flag === 'abnormal' ? (
                            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Abnormal</span>
                          ) : (
                            <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-semibold">Normal</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 max-w-xs">{r.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctor Clinical Consultation Form */}
            <form onSubmit={handleSaveNote} className="space-y-4 rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Physician Consultation Notes &amp; Prescription Order</h3>
                <span className="text-xs text-emerald-700 font-semibold">Dr. {profile?.name || user?.name}</span>
              </div>

              {noteSuccessMsg && (
                <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-3 text-xs font-bold text-emerald-900">
                  ✓ {noteSuccessMsg}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Diagnosis / Clinical Impression *
                  </label>
                  <input
                    type="text"
                    required
                    value={consultationForm.diagnosisImpression}
                    onChange={(e) => setConsultationForm({ ...consultationForm, diagnosisImpression: e.target.value })}
                    placeholder="e.g. Acute Coronary Syndrome (NSTEMI) / Unstable Angina"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Recommended Triage Action *
                  </label>
                  <input
                    type="text"
                    required
                    value={consultationForm.recommendedAction}
                    onChange={(e) => setConsultationForm({ ...consultationForm, recommendedAction: e.target.value })}
                    placeholder="e.g. Immediate Cath Lab referral &amp; continuous telemetry"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Medication Prescriptions (one per line)
                </label>
                <textarea
                  rows="2"
                  value={consultationForm.prescriptions}
                  onChange={(e) => setConsultationForm({ ...consultationForm, prescriptions: e.target.value })}
                  placeholder="Aspirin 300mg stat&#10;Clopidogrel 300mg stat&#10;Atorvastatin 80mg OD"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Clinical Progress &amp; Nursing Instructions
                </label>
                <textarea
                  rows="2"
                  value={consultationForm.clinicalNotes}
                  onChange={(e) => setConsultationForm({ ...consultationForm, clinicalNotes: e.target.value })}
                  placeholder="Record clinical impressions, serial vitals monitoring intervals, IV fluids, and nursing notes."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-clinical-600"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-600">Update Status:</span>
                  <select
                    value={consultationForm.status}
                    onChange={(e) => setConsultationForm({ ...consultationForm, status: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    <option value="in_review">In Clinical Review</option>
                    <option value="completed">Completed / Signed</option>
                    <option value="admitted">Admitted to Quaternary Center</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="rounded-xl bg-clinical-700 hover:bg-clinical-800 disabled:opacity-50 text-white px-5 py-2 text-xs font-bold shadow transition flex items-center gap-1.5"
                  >
                    {savingNote ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Signing...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign &amp; Save Consultation Note</span>
                        <span>✓</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
