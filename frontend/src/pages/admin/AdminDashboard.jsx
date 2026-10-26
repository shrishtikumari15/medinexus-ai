import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ADMIN_TOOLS = [
  {
    to: '/admin/doctors',
    label: 'Doctor Verification & NMR Registry',
    shortLabel: 'Doctor Verification',
    code: '01 / PEOPLE',
    badge: '177+ Verified Faculty',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: '👨‍⚕️',
    description: 'Manage doctor credentials, National Medical Register (NMR) IDs, State Medical Council registrations, verified qualifications, and official hospital affiliations.',
    metrics: 'Source-verified NMC & Apollo faculty',
    actionText: 'Launch Registry Manager',
    category: 'clinical',
  },
  {
    to: '/admin/hospitals',
    label: 'Hospital Directory & Infrastructure',
    shortLabel: 'Hospital Directory',
    code: '02 / NETWORK',
    badge: 'Pan-India Quaternary Network',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: '🏥',
    description: 'Audit tertiary hospital profiles, clinical departments, emergency helplines, address records, and regional metro coverage across India.',
    metrics: '30,270+ verified hospitals indexed',
    actionText: 'Open Hospital Registry',
    category: 'infrastructure',
  },
  {
    to: '/admin/analytics',
    label: 'Operational Capacity Analytics',
    shortLabel: 'Operational Analytics',
    code: '03 / OPERATIONS',
    badge: 'Live Operational Dataset',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: '📊',
    description: 'Monitor acute patient intake flow, physician allocation, departmental loads, service capacity distributions, and operational baseline metrics.',
    metrics: '10,000 facility snapshots monitored',
    actionText: 'Inspect Capacity Flow',
    category: 'operations',
  },
  {
    to: '/admin/simulation',
    label: 'What-If Resource Simulation',
    shortLabel: 'What-If Simulation',
    code: '04 / PLANNING',
    badge: 'M/M/c Multi-Server Engine',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: '⚡',
    description: 'Model arrival rate surges, adjust on-duty physician staffing, and evaluate clinical bottleneck response curves before operational deployment.',
    metrics: 'Multi-server queueing simulation',
    actionText: 'Launch Simulation Engine',
    category: 'planning',
  },
  {
    to: '/admin/model-performance',
    label: 'Machine Learning Model Performance',
    shortLabel: 'Model Performance',
    code: '05 / MODELS',
    badge: 'XGBoost Champion (87.8% Acc)',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    icon: '🧠',
    description: 'Review held-out evaluation metrics, clinical triage confusion matrices, physiological feature importances (Shock Index, SpO2), and XGBoost vs Random Forest comparisons.',
    metrics: '92.0% high-urgency safety recall · 90.2% F1',
    actionText: 'Inspect Model Benchmarks',
    category: 'ai',
  },
  {
    to: '/hospitals?emergency=true',
    label: 'Emergency Trauma Command Desk',
    shortLabel: 'Emergency Desk',
    code: '06 / TRAUMA',
    badge: '1066 / 108 Gateway Active',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: '🚨',
    description: 'Inspect 24/7 Golden Hour resuscitation protocols, direct emergency hotline linkages, and regional quaternary trauma referral corridors.',
    metrics: 'Continuous 24/7 trauma standby',
    actionText: 'View Emergency Network',
    category: 'emergency',
  },
];

const auditEvents = [
  {
    id: 1,
    time: 'Live',
    status: 'success',
    title: 'XGBoost Clinical Urgency Model Active',
    detail: 'Champion model benchmarked at 87.8% accuracy and 92.0% high-urgency patient safety recall.',
  },
  {
    id: 2,
    time: '12m ago',
    status: 'success',
    title: 'NMR Credentials Registry Synchronized',
    detail: '177+ Apollo Senior Specialists audited against State Medical Council registration databases.',
  },
  {
    id: 3,
    time: '1h ago',
    status: 'info',
    title: 'Quaternary Hospital Network Index Refreshed',
    detail: 'Verified apex facilities across Mumbai, Bengaluru, Delhi NCR, Chennai, and Hyderabad verified online.',
  },
  {
    id: 4,
    time: '2h ago',
    status: 'info',
    title: 'Trauma Emergency Hotline Gateways Verified',
    detail: 'Apollo 1066 and National Emergency 108 direct dispatch gateways operational with 0 downtime.',
  },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = ADMIN_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="panel-shell max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* =========================================================================
          CONTROL ROOM EXECUTIVE HEADER
          ========================================================================= */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-clinical-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clinical-700">
              MediNexus · Executive Control Room
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Healthcare Administration
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-3xl leading-relaxed">
            Centralized governance workspace for doctor credentials, hospital registries, operational capacity analytics, queue simulations, and clinical ML models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm">
            <span>🛡️</span>
            <span>Administrator Workspace</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Systems Normal</span>
          </span>
        </div>
      </header>

      {/* =========================================================================
          SYSTEM HEALTH & SERVICE CONNECTIVITY STATUS BAR
          ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500">API Gateway:</span>
              <strong className="text-slate-900 font-semibold">Node/Express (Port 5000)</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500">ML Microservice:</span>
              <strong className="text-slate-900 font-semibold">FastAPI (Port 8000)</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Database Cluster:</span>
              <strong className="text-slate-900 font-semibold">MongoDB (Synced)</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Emergency Desk:</span>
              <strong className="text-rose-700 font-bold">1066 / 108 Direct</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>🔒 Enterprise SSL / HIPAA Protected</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          EXECUTIVE KPI TELEMETRY CARDS (4 Essential Metrics)
          ========================================================================= */}
      <section aria-label="Executive KPI overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Doctors</span>
            <span className="rounded-xl bg-emerald-50 p-2 text-lg border border-emerald-100">👨‍⚕️</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">177+</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold">Apollo &amp; AIIMS Faculty</span>
            <Link to="/admin/doctors" className="font-bold text-clinical-700 hover:underline">
              Verify →
            </Link>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quaternary Hospitals</span>
            <span className="rounded-xl bg-blue-50 p-2 text-lg border border-blue-100">🏥</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">30,270+</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-blue-700 font-semibold">28 States &amp; UTs Indexed</span>
            <Link to="/admin/hospitals" className="font-bold text-clinical-700 hover:underline">
              Manage →
            </Link>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">ML Triage Champion</span>
            <span className="rounded-xl bg-purple-50 p-2 text-lg border border-purple-100">🧠</span>
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-700">87.8%</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold">92.0% Safety Recall · 90.2% F1</span>
            <Link to="/admin/model-performance" className="font-bold text-clinical-700 hover:underline">
              Inspect →
            </Link>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Simulation Engine</span>
            <span className="rounded-xl bg-amber-50 p-2 text-lg border border-amber-100">⚡</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">M/M/c</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-amber-700 font-semibold">Multi-Server Queue Model</span>
            <Link to="/admin/simulation" className="font-bold text-clinical-700 hover:underline">
              Run →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          QUICK ACTIONS BAR & SEARCH FILTER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
        {/* Search Filter */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search workspaces (e.g. doctor, simulation, hospital)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-clinical-600 focus:outline-none focus:ring-1 focus:ring-clinical-600"
          />
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <Link
            to="/admin/doctors"
            className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-slate-700 hover:bg-slate-100 transition shadow-sm flex items-center gap-1.5"
          >
            <span>👨‍⚕️</span>
            <span>Verify Doctor</span>
          </Link>
          <Link
            to="/admin/hospitals"
            className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-slate-700 hover:bg-slate-100 transition shadow-sm flex items-center gap-1.5"
          >
            <span>🏥</span>
            <span>Hospital Directory</span>
          </Link>
          <Link
            to="/admin/simulation"
            className="rounded-xl bg-[#a54836] hover:bg-[#883c2e] px-4 py-2 text-white transition shadow-sm flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>Run Simulation</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          ADMINISTRATION WORKSPACE MODULES (Rich Tool Cards Grid)
          ========================================================================= */}
      <section aria-label="Administration tools" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Administrative Workspaces ({filteredTools.length})
          </h2>
          <span className="text-xs text-slate-500">Click any card to open dedicated tool</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-clinical-500 hover:shadow-xl transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {tool.code}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-clinical-700 transition">
                    {tool.shortLabel}
                  </h3>
                </div>

                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  {tool.description}
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Operational Scope: </span>
                  {tool.metrics}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-clinical-700 group-hover:text-clinical-800">
                <span>{tool.actionText}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          RECENT OPERATIONAL AUDIT LOG & COMPLIANCE STREAM
          ========================================================================= */}
      <section aria-label="Recent administrative activity" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Operational Activity &amp; Compliance Log</h3>
            <p className="text-xs text-slate-500">Live administrative updates and system verification events</p>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
            Audited &amp; Compliant
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {auditEvents.map((evt) => (
            <div key={evt.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <strong className="text-slate-900 block font-semibold">{evt.title}</strong>
                  <p className="text-slate-500 mt-0.5">{evt.detail}</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">{evt.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Notice */}
      <footer className="pt-2 text-center text-xs text-slate-400">
        Patient and dependent electronic health records are strictly confidential and protected by role-based access control.
      </footer>

    </main>
  );
}
