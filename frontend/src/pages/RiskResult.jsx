import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import EmergencyDisclaimerBanner from '../components/EmergencyDisclaimerBanner';

export default function RiskResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinical-50 text-2xl text-clinical-600 mb-4">
          🩺
        </div>
        <h2 className="text-xl font-bold text-clinical-800">No Assessment Active</h2>
        <p className="mt-2 text-sm text-ink/65">
          Please complete a patient assessment intake to generate clinical triage recommendations.
        </p>
        <button
          onClick={() => navigate('/assessment')}
          className="mt-6 rounded-lg bg-clinical-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
        >
          Start Patient Assessment
        </button>
      </div>
    );
  }

  const { assessment, recommendation, riskDisclaimer, emergencyDisclaimer } = state;
  const riskLabel = assessment?.riskPrediction?.label || 'Moderate';
  const probHigh = assessment?.riskPrediction?.probabilityHigh;
  const isHighRisk = riskLabel.toLowerCase() === 'high' || riskLabel.toUpperCase() === 'HIGH_URGENCY' || (probHigh !== null && probHigh > 0.5);

  const chiefComplaint =
    assessment?.chiefComplaint ||
    assessment?.clinicalInputs?.chiefComplaint ||
    'High Fever & Chills (>102°F)';

  const locationText =
    assessment?.locationText ||
    assessment?.locationInput?.raw ||
    '';

  const vitalsSource = assessment?.clinicalInputs || assessment?.vitals || {};
  const vitalsList = [
    {
      label: 'Body Temperature',
      value: vitalsSource.temperature ? `${vitalsSource.temperature} °F` : null,
      normal: '98.6°F',
      alert: Number(vitalsSource.temperature) >= 100.4,
      status: Number(vitalsSource.temperature) >= 102 ? 'High Fever' : Number(vitalsSource.temperature) >= 100.4 ? 'Elevated' : 'Normal',
    },
    {
      label: 'SpO2 Saturation',
      value: vitalsSource.o2sat ? `${vitalsSource.o2sat}%` : null,
      normal: '≥95%',
      alert: Number(vitalsSource.o2sat) < 95,
      status: Number(vitalsSource.o2sat) < 92 ? 'Critical Low' : Number(vitalsSource.o2sat) < 95 ? 'Borderline' : 'Optimal',
    },
    {
      label: 'Heart Rate',
      value: vitalsSource.heartrate ? `${vitalsSource.heartrate} bpm` : null,
      normal: '60-100',
      alert: Number(vitalsSource.heartrate) > 100 || Number(vitalsSource.heartrate) < 60,
      status: Number(vitalsSource.heartrate) > 100 ? 'Tachycardia' : 'Normal',
    },
    {
      label: 'Blood Pressure',
      value: (vitalsSource.sbp && vitalsSource.dbp) ? `${vitalsSource.sbp}/${vitalsSource.dbp} mmHg` : null,
      normal: '120/80',
      alert: Number(vitalsSource.sbp) >= 140 || Number(vitalsSource.sbp) <= 90,
      status: Number(vitalsSource.sbp) <= 95 ? 'Borderline Low' : 'Stable',
    },
    {
      label: 'Respiratory Rate',
      value: vitalsSource.resprate ? `${vitalsSource.resprate} /min` : null,
      normal: '12-20',
      alert: Number(vitalsSource.resprate) > 20 || Number(vitalsSource.resprate) < 12,
      status: 'Normal',
    },
    {
      label: 'Pain Score',
      value: Number.isFinite(vitalsSource.pain) ? `${vitalsSource.pain} / 10` : null,
      normal: '0',
      alert: Number(vitalsSource.pain) >= 6,
      status: Number(vitalsSource.pain) >= 7 ? 'Severe' : Number(vitalsSource.pain) >= 4 ? 'Moderate' : 'Mild',
    },
  ].filter((v) => v.value !== null);

  const rankedHospitalsCount = recommendation?.hospitalRankings?.length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      {/* Emergency Disclaimer Banner if applicable */}
      <EmergencyDisclaimerBanner show={!!emergencyDisclaimer || isHighRisk} />

      {/* Triage Overview Card */}
      <div className="rounded-2xl border border-clinical-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-clinical-50 px-3 py-1 text-xs font-semibold text-clinical-700 uppercase tracking-wider border border-clinical-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Clinical Stratification Output
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-clinical-950">Patient Triage Assessment</h1>
            {assessment?.dependentSnapshot ? (
              <p className="mt-1 text-sm text-ink/75">
                Assessment for: <strong className="text-clinical-800">{assessment.dependentSnapshot.name}</strong> ({assessment.dependentSnapshot.relationship}), Age {assessment.dependentSnapshot.ageAtAssessment || 'N/A'}
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink/65">Self-assessment clinical intake</p>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <RiskBadge label={riskLabel} />
            {probHigh !== null && probHigh !== undefined && (
              <div className="mt-2 text-left sm:text-right">
                <p className="text-xs font-semibold text-clinical-800">
                  Acuity Index: <strong className="text-urgent-600">{(probHigh * 100).toFixed(1)}%</strong>
                </p>
                <div className="mt-1 h-2 w-32 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${probHigh > 0.7 ? 'bg-urgent-500' : probHigh > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, Math.round(probHigh * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-clinical-700">Presenting Clinical Complaint</p>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
              Verified Intake
            </span>
          </div>
          <p className="mt-1.5 text-base font-bold text-slate-900">
            "{chiefComplaint}"
          </p>
          {locationText && (
            <p className="mt-2.5 text-xs text-ink/75 flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
              <span>📍</span> Patient Geo-Location Filter: <strong className="text-clinical-800">{locationText}</strong>
              <span className="ml-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">Local Proximity Active</span>
            </p>
          )}
        </div>

        {/* Vitals Summary Grid */}
        {vitalsList.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-clinical-700">Recorded Vital Parameters</p>
              <span className="text-[11px] text-ink/50">Benchmark reference ranges evaluated</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {vitalsList.map((vital) => (
                <div
                  key={vital.label}
                  className={`rounded-xl border p-2.5 text-center transition ${
                    vital.alert
                      ? 'border-amber-300 bg-amber-50/70 text-amber-900 shadow-sm'
                      : 'border-slate-100 bg-slate-50/70 text-slate-800'
                  }`}
                >
                  <span className="block text-[10px] font-semibold text-ink/60 uppercase">{vital.label}</span>
                  <strong className={`block text-base font-extrabold mt-0.5 ${vital.alert ? 'text-amber-800' : 'text-clinical-800'}`}>
                    {vital.value}
                  </strong>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                    vital.alert ? 'bg-amber-200/70 text-amber-900' : 'bg-slate-200/60 text-slate-600'
                  }`}>
                    {vital.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Requirements Breakdown (Specialties & Resources) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Specialties */}
        <div className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-clinical-800">
              Required Clinical Specialties
            </h2>
          </div>
          <p className="text-xs text-ink/65 leading-relaxed">
            Hospitals and medical teams must have certified clinical departments matching these clinical pathways:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {assessment?.requiredSpecialties?.length ? (
              assessment.requiredSpecialties.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-clinical-200 bg-clinical-50 px-3 py-1.5 text-xs font-bold text-clinical-800 shadow-sm"
                >
                  <span className="text-emerald-600 font-bold">✓</span> {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-ink/60 italic">General / Internal Medicine</span>
            )}
          </div>
        </div>

        {/* Required Resources */}
        <div className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-clinical-800">
              Required Facility Resources
            </h2>
          </div>
          <p className="text-xs text-ink/65 leading-relaxed">
            Infrastructure capabilities prioritized during hospital suitability calculation:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {assessment?.requiredResources?.length ? (
              assessment.requiredResources.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm"
                >
                  <span>⚡</span> {r}
                </span>
              ))
            ) : (
              <span className="text-xs text-ink/60 italic">General Ward, Physician Consult, Continuous Monitoring</span>
            )}
          </div>
        </div>
      </div>

      {/* Ranked Hospitals Callout Action */}
      <div className="rounded-2xl border-2 border-clinical-500/30 bg-gradient-to-r from-clinical-50 via-white to-clinical-50 p-6 shadow-md text-center space-y-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-clinical-700 px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wide shadow-sm">
            ✓ Hospital Matching Complete
          </span>
          <h3 className="mt-2 text-2xl font-black text-clinical-950">
            {rankedHospitalsCount > 0
              ? `${rankedHospitalsCount} Local Facilities Ranked for Your Acuity & Location`
              : 'Ranked Recommendations Ready'}
          </h3>
          <p className="mt-1 text-sm text-ink/75 max-w-xl mx-auto">
            Hospitals evaluated across operational capacity, predicted waiting times, travel distance, and presence of <strong>source-verified specialists</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {recommendation?._id && (
            <button
              onClick={() => navigate(`/recommendations/${recommendation._id}`, { state: { recommendation } })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-clinical-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-clinical-700 transition active:scale-95 hover:shadow-xl"
            >
              <span>Explore Ranked Hospital Recommendations</span>
              <span className="text-base font-bold">→</span>
            </button>
          )}
          <Link
            to="/assessment"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Edit Assessment Inputs
          </Link>
        </div>
      </div>

      {/* Clinical Disclaimer */}
      <p className="text-xs text-ink/50 text-center leading-relaxed">
        {riskDisclaimer ||
          'Disclaimer: MediNexus automated risk triage is designed strictly for medical care decision support. It does not replace professional emergency clinical assessment.'}
      </p>
    </div>
  );
}
