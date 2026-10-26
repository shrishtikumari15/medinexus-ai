import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { runSimulationScenario, getSimulationHistory } from '../../services/adminApi';

const related = [
  { to: '/admin/model-performance', label: 'Model performance' },
  { to: '/admin/analytics', label: 'Operational analytics' },
  { to: '/admin', label: 'Admin overview' },
];

export default function WhatIfSimulation() {
  const [baseline, setBaseline] = useState({
    arrivalRatePerHour: 20,
    doctorsAvailable: 4,
    bedsAvailable: 25,
    serviceRateMinutesPerPatient: 10,
  });

  const [scenario, setScenario] = useState({
    arrivalRatePerHour: 28,
    doctorsAvailable: 5,
    bedsAvailable: 30,
    serviceRateMinutesPerPatient: 9,
  });

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const res = await getSimulationHistory();
      setHistory(res.data || []);
    } catch {
      // Non-blocking
    }
  }

  async function handleRunSimulation(e) {
    e.preventDefault();
    setRunning(true);
    setError('');
    try {
      const res = await runSimulationScenario({ baseline, scenario });
      setResult(res.data?.full || res.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Simulation failed to run. Check service parameters.');
    } finally {
      setRunning(false);
    }
  }

  const bAnalytical = result?.baseline?.analytical;
  const sAnalytical = result?.scenario?.analytical;

  return (
    <main className="panel-shell">
      <header className="panel-header">
        <div>
          <p className="panel-eyebrow">Administration / Operations Planning</p>
          <h1 className="panel-title">What-If Resource &amp; Staffing Simulation</h1>
          <p className="panel-subtitle">
            Simulate patient arrival surges, staffing adjustments, and bed expansions using Erlang C queueing theory and discrete-event simulation.
          </p>
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-950">
          {error}
        </div>
      )}

      {/* Parameter Input Form */}
      <form onSubmit={handleRunSimulation} className="mb-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Baseline Panel */}
          <div className="rounded-xl border border-clinical-200 bg-white p-5 shadow-sm">
            <div className="border-b border-clinical-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-ink">Baseline Operational Parameters</h2>
              <p className="text-xs text-ink/60">Current nominal hospital operating state</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-ink/75">
              <div>
                <label htmlFor="b-arrival">Patient Arrival Rate (patients/hour)</label>
                <input
                  id="b-arrival"
                  type="number"
                  min="1"
                  max="200"
                  step="0.5"
                  value={baseline.arrivalRatePerHour}
                  onChange={(e) => setBaseline({ ...baseline, arrivalRatePerHour: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-clinical-200 p-2.5 text-sm font-normal text-ink focus:border-clinical-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="b-docs">Active Doctors on Shift</label>
                <input
                  id="b-docs"
                  type="number"
                  min="1"
                  max="100"
                  value={baseline.doctorsAvailable}
                  onChange={(e) => setBaseline({ ...baseline, doctorsAvailable: parseInt(e.target.value, 10) || 0 })}
                  className="mt-1 w-full rounded-lg border border-clinical-200 p-2.5 text-sm font-normal text-ink focus:border-clinical-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="b-beds">Available Emergency/Inpatient Beds</label>
                <input
                  id="b-beds"
                  type="number"
                  min="1"
                  max="500"
                  value={baseline.bedsAvailable}
                  onChange={(e) => setBaseline({ ...baseline, bedsAvailable: parseInt(e.target.value, 10) || 0 })}
                  className="mt-1 w-full rounded-lg border border-clinical-200 p-2.5 text-sm font-normal text-ink focus:border-clinical-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="b-rate">Average Consultation / Service Time (minutes/patient)</label>
                <input
                  id="b-rate"
                  type="number"
                  min="1"
                  max="120"
                  step="0.5"
                  value={baseline.serviceRateMinutesPerPatient}
                  onChange={(e) => setBaseline({ ...baseline, serviceRateMinutesPerPatient: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-clinical-200 p-2.5 text-sm font-normal text-ink focus:border-clinical-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Scenario Panel */}
          <div className="rounded-xl border border-clinical-300 bg-clinical-50/40 p-5 shadow-sm">
            <div className="border-b border-clinical-200 pb-3 mb-4">
              <h2 className="text-base font-bold text-clinical-800">What-If Hypothesis Scenario</h2>
              <p className="text-xs text-ink/60">Simulated demand surge or intervention</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-ink/75">
              <div>
                <label htmlFor="s-arrival">Projected Arrival Rate (patients/hour)</label>
                <input
                  id="s-arrival"
                  type="number"
                  min="1"
                  max="200"
                  step="0.5"
                  value={scenario.arrivalRatePerHour}
                  onChange={(e) => setScenario({ ...scenario, arrivalRatePerHour: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-clinical-200 bg-white p-2.5 text-sm font-normal text-ink focus:border-clinical-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="s-docs">Planned Active Doctors</label>
                <input
                  id="s-docs"
                  type="number"
                  min="1"
                  max="100"
                  value={scenario.doctorsAvailable}
                  onChange={(e) => setScenario({ ...scenario, doctorsAvailable: parseInt(e.target.value, 10) || 0 })}
                  className="mt-1 w-full rounded-lg border border-clinical-200 bg-white p-2.5 text-sm font-normal text-ink focus:border-clinical-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="s-beds">Planned Bed Capacity</label>
                <input
                  id="s-beds"
                  type="number"
                  min="1"
                  max="500"
                  value={scenario.bedsAvailable}
                  onChange={(e) => setScenario({ ...scenario, bedsAvailable: parseInt(e.target.value, 10) || 0 })}
                  className="mt-1 w-full rounded-lg border border-clinical-200 bg-white p-2.5 text-sm font-normal text-ink focus:border-clinical-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="s-rate">Target Service Time (minutes/patient)</label>
                <input
                  id="s-rate"
                  type="number"
                  min="1"
                  max="120"
                  step="0.5"
                  value={scenario.serviceRateMinutesPerPatient}
                  onChange={(e) => setScenario({ ...scenario, serviceRateMinutesPerPatient: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-clinical-200 bg-white p-2.5 text-sm font-normal text-ink focus:border-clinical-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-clinical-700 px-6 py-3 font-semibold text-white shadow transition hover:bg-clinical-800 disabled:opacity-50"
        >
          {running ? 'Simulating queuing dynamics...' : '▶ Run What-If Simulation'}
        </button>
      </form>

      {/* Simulation Results Display */}
      {result && (
        <section aria-labelledby="sim-results-heading" className="space-y-6">
          <div className="border-b border-clinical-100 pb-2">
            <h2 id="sim-results-heading" className="text-xl font-bold text-ink">
              Simulation Outcomes Comparison
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Waiting Time */}
            <article className="health-card p-5">
              <p className="text-xs font-semibold uppercase text-ink/50">Expected Waiting Time</p>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-sm text-ink/60">Base: </span>
                  <span className="text-lg font-bold text-ink">{bAnalytical?.waiting_time_minutes?.toFixed(1) ?? '—'}m</span>
                </div>
                <div>
                  <span className="text-sm text-ink/60">Scenario: </span>
                  <span className="text-xl font-bold text-clinical-700">{sAnalytical?.waiting_time_minutes?.toFixed(1) ?? '—'}m</span>
                </div>
              </div>
            </article>

            {/* Queue Length */}
            <article className="health-card p-5">
              <p className="text-xs font-semibold uppercase text-ink/50">Queue Length</p>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-sm text-ink/60">Base: </span>
                  <span className="text-lg font-bold text-ink">{bAnalytical?.queue_length?.toFixed(1) ?? '—'} pts</span>
                </div>
                <div>
                  <span className="text-sm text-ink/60">Scenario: </span>
                  <span className="text-xl font-bold text-clinical-700">{sAnalytical?.queue_length?.toFixed(1) ?? '—'} pts</span>
                </div>
              </div>
            </article>

            {/* Doctor Utilization */}
            <article className="health-card p-5">
              <p className="text-xs font-semibold uppercase text-ink/50">Doctor Utilization</p>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-sm text-ink/60">Base: </span>
                  <span className="text-lg font-bold text-ink">{bAnalytical?.doctor_utilization ? `${(bAnalytical.doctor_utilization * 100).toFixed(0)}%` : '—'}</span>
                </div>
                <div>
                  <span className="text-sm text-ink/60">Scenario: </span>
                  <span className="text-xl font-bold text-clinical-700">{sAnalytical?.doctor_utilization ? `${(sAnalytical.doctor_utilization * 100).toFixed(0)}%` : '—'}</span>
                </div>
              </div>
            </article>

            {/* Hospital Load */}
            <article className="health-card p-5">
              <p className="text-xs font-semibold uppercase text-ink/50">Hospital System Load</p>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-sm text-ink/60">Base: </span>
                  <span className="text-lg font-bold text-ink">{bAnalytical?.hospital_load ? `${(bAnalytical.hospital_load * 100).toFixed(0)}%` : '—'}</span>
                </div>
                <div>
                  <span className="text-sm text-ink/60">Scenario: </span>
                  <span className="text-xl font-bold text-clinical-700">{sAnalytical?.hospital_load ? `${(sAnalytical.hospital_load * 100).toFixed(0)}%` : '—'}</span>
                </div>
              </div>
            </article>
          </div>

          {/* Model Method & Stability Note */}
          <div className="rounded-xl border border-clinical-100 bg-white p-5 text-xs text-ink/70 leading-relaxed shadow-sm">
            <p className="font-semibold text-ink">Analytical Basis: Erlang C (M/M/c Queueing Model)</p>
            <p className="mt-1">
              Evaluates steady-state probability of waiting and expected delay for parallel medical providers with Markovian arrival patterns. Discrete-event simulation stochastic validation is run concurrently across 100 runs.
            </p>
          </div>
        </section>
      )}

      {/* Historical Simulations Table */}
      {history.length > 0 && (
        <section aria-labelledby="history-heading" className="mt-10 space-y-4">
          <h2 id="history-heading" className="text-lg font-bold text-ink">Recent Simulation Runs</h2>
          <div className="overflow-x-auto rounded-xl border border-clinical-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold uppercase text-slate-700">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Arrival Surge</th>
                  <th className="px-4 py-3">Doctors (Base → Sim)</th>
                  <th className="px-4 py-3">Wait (Base → Sim)</th>
                  <th className="px-4 py-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 5).map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{new Date(entry.createdAt).toLocaleTimeString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {entry.baseline?.arrivalRatePerHour}/h → {entry.scenario?.arrivalRatePerHour}/h
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {entry.baseline?.doctorsAvailable} → {entry.scenario?.doctorsAvailable} docs
                    </td>
                    <td className="px-4 py-3 font-semibold text-clinical-700">
                      {entry.results?.baseline?.waitingTimeMinutes?.toFixed(1) ?? '—'}m → {entry.results?.scenario?.waitingTimeMinutes?.toFixed(1) ?? '—'}m
                    </td>
                    <td className="px-4 py-3 text-slate-500 uppercase">{entry.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <nav className="mt-10 flex flex-wrap gap-3" aria-label="Related admin pages">
        {related.map(({ to, label }) => (
          <Link key={to} className="secondary-btn" to={to}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
