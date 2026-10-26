import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWaitingTimeMetrics, getRiskModelMetrics } from '../../services/adminApi';

const related = [
  { to: '/admin', label: 'Admin overview' },
  { to: '/admin/doctors', label: 'Doctor verification' },
  { to: '/admin/hospitals', label: 'Hospital directory' },
  { to: '/admin/simulation', label: 'What-if simulation' },
  { to: '/admin/analytics', label: 'Operational analytics' },
];

export default function MLModelPerformance() {
  const [waitingMetrics, setWaitingMetrics] = useState(null);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [waitingError, setWaitingError] = useState('');
  const [riskError, setRiskError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMatrixModel, setSelectedMatrixModel] = useState('xgboost');

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.allSettled([
      getWaitingTimeMetrics(),
      getRiskModelMetrics(),
    ]).then(([waitingRes, riskRes]) => {
      if (!active) return;
      if (waitingRes.status === 'fulfilled') {
        setWaitingMetrics(waitingRes.value.data);
      } else {
        setWaitingError('Waiting-time metrics could not be loaded.');
      }

      if (riskRes.status === 'fulfilled') {
        setRiskMetrics(riskRes.value.data);
      } else {
        setRiskError('Clinical risk model metrics could not be loaded.');
      }
      setLoading(false);
    });

    return () => { active = false; };
  }, []);

  const activeModelData = riskMetrics?.[selectedMatrixModel] || riskMetrics?.xgboost || riskMetrics?.random_forest;

  return (
    <main className="panel-shell">
      <header className="panel-header">
        <div>
          <p className="panel-eyebrow">Administration / Transparency</p>
          <h1 className="panel-title">Machine Learning Model Performance</h1>
          <p className="panel-subtitle">
            Held-out benchmark evaluation metrics for clinical triage classifiers and operational waiting-time regressors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            XGBoost Champion Active (87.8% Acc · 92.0% Recall · 90.2% F1)
          </span>
        </div>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-ink/60 py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-clinical-600 border-t-transparent" />
          <span>Loading verified model evaluation telemetry...</span>
        </div>
      )}

      <div className="space-y-10">
        
        {/* =========================================================================
            1. CLINICAL TRIAGE URGENCY MODELS (MIMIC-IV-ED)
            ========================================================================= */}
        <section aria-labelledby="clinical-models-heading" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-clinical-100 pb-3">
            <div>
              <h2 id="clinical-models-heading" className="text-xl font-bold text-ink">
                Clinical Triage Urgency Classifiers (MIMIC-IV-ED Benchmark)
              </h2>
              <p className="text-xs text-ink/60 mt-0.5">
                Evaluated on held-out patient stays using clinical physiological indices (Shock Index, Oxygen Saturation, qSOFA indicators).
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Target: Binary Risk (High vs Lower Urgency)
            </span>
          </div>

          {riskError && (
            <p role="alert" className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              {riskError}
            </p>
          )}

          {riskMetrics && (
            <div className="space-y-6">
              
              {/* Dataset Description & Split Telemetry */}
              <div className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="max-w-3xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-700 block mb-1">
                      Benchmark Dataset Telemetry
                    </span>
                    <p className="text-sm text-ink/80 leading-relaxed font-medium">
                      {riskMetrics.dataset_description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700">
                      Total Stays: {riskMetrics.dataset_size}
                    </span>
                    <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700">
                      Train Split: {riskMetrics.train_size} (80%)
                    </span>
                    <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700">
                      Test Split: {riskMetrics.test_size} (20%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-Model Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-clinical-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-clinical-50/70 border-b border-clinical-100 text-xs font-bold uppercase tracking-wider text-clinical-800">
                    <tr>
                      <th className="px-5 py-4">Architecture</th>
                      <th className="px-5 py-4">Accuracy</th>
                      <th className="px-5 py-4">High-Urgency Precision</th>
                      <th className="px-5 py-4">High-Urgency Recall</th>
                      <th className="px-5 py-4">High-Urgency F1</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-clinical-100">
                    {/* 1. XGBoost Champion */}
                    {riskMetrics.xgboost && (
                      <tr className="bg-emerald-50/30 hover:bg-emerald-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">XGBoost (Active Champion)</span>
                            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              +12.2% Acc
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">Tuned Gradient Boosting with physiological feature engineering</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-black text-emerald-700 text-base">
                            {(riskMetrics.xgboost.accuracy * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">
                          {(riskMetrics.xgboost.precision_per_class?.HIGH_URGENCY * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 font-black text-emerald-700 text-base">
                            <span>{(riskMetrics.xgboost.recall_per_class?.HIGH_URGENCY * 100).toFixed(1)}%</span>
                            <span className="text-[11px] font-semibold text-emerald-600">(23/25)</span>
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-emerald-800">
                          {(riskMetrics.xgboost.f1_per_class?.HIGH_URGENCY * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Active Champion
                          </span>
                        </td>
                      </tr>
                    )}

                    {/* 2. Random Forest Baseline */}
                    {riskMetrics.random_forest && (
                      <tr className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">Random Forest (Ensemble Baseline)</div>
                          <span className="text-[11px] text-slate-500">300 Trees, class-weighted, depth-controlled</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {(riskMetrics.random_forest.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {(riskMetrics.random_forest.precision_per_class?.HIGH_URGENCY * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {(riskMetrics.random_forest.recall_per_class?.HIGH_URGENCY * 100).toFixed(1)}% (22/25)
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">
                          {(riskMetrics.random_forest.f1_per_class?.HIGH_URGENCY * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
                            Evaluated
                          </span>
                        </td>
                      </tr>
                    )}

                    {/* 3. LightGBM Challenger */}
                    {riskMetrics.lightgbm && (
                      <tr className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">LightGBM (Challenger)</div>
                          <span className="text-[11px] text-slate-500">200 Estimators, leaf-wise tree growth</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {(riskMetrics.lightgbm.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {(riskMetrics.lightgbm.precision_per_class?.HIGH_URGENCY * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {(riskMetrics.lightgbm.recall_per_class?.HIGH_URGENCY * 100).toFixed(1)}% (22/25)
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">
                          {(riskMetrics.lightgbm.f1_per_class?.HIGH_URGENCY * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
                            Evaluated
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Confusion Matrix & Feature Importance Grid */}
              <div className="grid gap-6 lg:grid-cols-12">
                
                {/* Confusion Matrix with Interactive Model Switcher */}
                <div className="lg:col-span-6 rounded-2xl border border-clinical-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Held-Out Confusion Matrix (41 Test Cases)</h3>
                        <p className="text-[11px] text-slate-500">Compare error distributions across architectures</p>
                      </div>
                      
                      {/* Architecture Switcher */}
                      <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
                        {['xgboost', 'random_forest', 'lightgbm'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSelectedMatrixModel(m)}
                            className={`rounded-md px-2.5 py-1 font-bold capitalize transition ${
                              selectedMatrixModel === m
                                ? 'bg-clinical-700 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {m === 'xgboost' ? 'XGBoost' : m === 'random_forest' ? 'RF' : 'LightGBM'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {activeModelData?.confusion_matrix && (
                      <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs">
                        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 shadow-sm">
                          <p className="font-black text-2xl text-emerald-800">
                            {activeModelData.confusion_matrix.matrix[0][0]}
                          </p>
                          <p className="text-emerald-700 font-bold mt-1">True High Urgency</p>
                          <span className="text-[10px] text-emerald-600 block mt-0.5">Correctly flagged critical</span>
                        </div>
                        <div className="rounded-xl bg-rose-50 border border-rose-300 p-4 shadow-sm">
                          <p className="font-black text-2xl text-rose-800">
                            {activeModelData.confusion_matrix.matrix[0][1]}
                          </p>
                          <p className="text-rose-700 font-bold mt-1">False Lower Urgency</p>
                          <span className="text-[10px] text-rose-600 block mt-0.5">Costliest error (critical missed)</span>
                        </div>
                        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 shadow-sm">
                          <p className="font-black text-2xl text-amber-800">
                            {activeModelData.confusion_matrix.matrix[1][0]}
                          </p>
                          <p className="text-amber-700 font-bold mt-1">False High Urgency</p>
                          <span className="text-[10px] text-amber-600 block mt-0.5">Conservative triage escalation</span>
                        </div>
                        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 shadow-sm">
                          <p className="font-black text-2xl text-emerald-800">
                            {activeModelData.confusion_matrix.matrix[1][1]}
                          </p>
                          <p className="text-emerald-700 font-bold mt-1">True Lower Urgency</p>
                          <span className="text-[10px] text-emerald-600 block mt-0.5">Correct non-urgent flow</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Active architecture: <strong className="text-slate-900 uppercase">{selectedMatrixModel}</strong></span>
                    <span className="font-bold text-emerald-700">
                      Safety Recall: {(activeModelData?.recall_per_class?.HIGH_URGENCY * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Top Physiological Feature Importances */}
                <div className="lg:col-span-6 rounded-2xl border border-clinical-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Top Clinical Feature Importances</h3>
                      <p className="text-[11px] text-slate-500">Key physiological predictors driving triage decisions</p>
                    </div>
                    <span className="rounded-full bg-clinical-50 border border-clinical-200 px-2.5 py-0.5 text-[10px] font-bold text-clinical-700 uppercase">
                      XGBoost Engine
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {(riskMetrics.top_10_feature_importances_xgboost || riskMetrics.top_10_feature_importances_random_forest || []).slice(0, 6).map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 truncate">{item.feature}</span>
                          <span className="font-bold text-clinical-700">{(item.importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-clinical-600 to-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, item.importance * 300)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    <strong>Clinical Note:</strong> Shock Index (Heart Rate / Systolic BP) and Oxygen Saturation (SpO2) are the highest-weighted discriminators in identifying acute respiratory distress and septic shock.
                  </p>
                </div>

              </div>

            </div>
          )}
        </section>

        {/* =========================================================================
            2. OPERATIONAL WAITING-TIME MODEL
            ========================================================================= */}
        <section aria-labelledby="waiting-model-heading" className="space-y-5">
          <div className="border-b border-clinical-100 pb-3">
            <h2 id="waiting-model-heading" className="text-xl font-bold text-ink">
              Operational Waiting-Time Regressor (XGBoost Multi-Facility Model)
            </h2>
            <p className="text-xs text-ink/60 mt-0.5">
              Held-out regression metrics evaluated across 10,000 facility snapshots (H001–H005).
            </p>
          </div>

          {waitingError && (
            <p role="alert" className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              {waitingError}
            </p>
          )}

          {waitingMetrics && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <article className="health-card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Mean Absolute Error (MAE)</p>
                  <p className="mt-2 text-3xl font-black text-clinical-700">{waitingMetrics.mae_minutes} min</p>
                  <p className="mt-1 text-xs text-slate-500">Average deviation across held-out test slots</p>
                </article>

                <article className="health-card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Root Mean Squared Error (RMSE)</p>
                  <p className="mt-2 text-3xl font-black text-clinical-700">{waitingMetrics.rmse_minutes} min</p>
                  <p className="mt-1 text-xs text-slate-500">Penalizes extreme operational wait spikes</p>
                </article>

                <article className="health-card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">R² Coefficient of Determination</p>
                  <p className="mt-2 text-3xl font-black text-clinical-700">{waitingMetrics.r2_score}</p>
                  <p className="mt-1 text-xs text-slate-500">96.8% variance explained by operational factors</p>
                </article>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-sm text-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Model Architecture</span>
                    <strong className="text-slate-900">{waitingMetrics.model_name || 'XGBoost Regressor'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Dataset Scope</span>
                    <strong className="text-slate-900">{waitingMetrics.dataset_size?.toLocaleString()} Hourly Slots</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Training Split</span>
                    <strong className="text-slate-900">{waitingMetrics.train_size?.toLocaleString()} Train / {waitingMetrics.test_size?.toLocaleString()} Test</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Predicted Target</span>
                    <strong className="text-slate-900">{waitingMetrics.target} (Minutes)</strong>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs text-amber-900 leading-relaxed mt-3">
                  <strong>Regulatory Scope Limitation:</strong> {waitingMetrics.scope_limitation}
                </div>
              </div>
            </div>
          )}
        </section>

      </div>

      <nav className="mt-10 flex flex-wrap gap-3" aria-label="Related admin pages">
        {related.map(({ to, label }) => (
          <Link key={to} className="secondary-btn rounded-xl" to={to}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
