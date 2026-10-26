import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { compareHospitals } from '../services/hospitalApi';
import { getRecommendationById } from '../services/recommendationApi';
import { normalizeHospitalWebsite } from '../utils/website';

function display(value) {
  if (value === null || value === undefined || value === '') return 'Not available';
  return value;
}

export default function HospitalComparison() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ids = (params.get('ids') || '').split(',').filter(Boolean).slice(0, 3);
  const recommendationId = params.get('recommendationId');
  const [hospitals, setHospitals] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setError(null);
    setLoading(true);
    const requests = [compareHospitals(ids)];
    if (recommendationId) requests.push(getRecommendationById(recommendationId));
    Promise.all(requests)
      .then(([hospitalResult, recommendationResult]) => {
        if (!active) return;
        setHospitals(hospitalResult.data || []);
        setRecommendation(recommendationResult?.data || null);
      })
      .catch(() => {
        if (active) setError('Could not load hospital comparison. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params, recommendationId, ids.join(',')]);

  if (ids.length < 2) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500 mb-4">
          ⚖️
        </div>
        <h2 className="text-xl font-bold text-ink">Compare Facilities</h2>
        <p className="mt-2 text-sm text-ink/65">
          Select at least 2 hospitals (up to 3) from the search page or recommendation results to view a side-by-side clinical and operational comparison.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="mt-6 rounded-lg bg-clinical-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-clinical-700"
        >
          Find Hospitals to Compare →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-clinical-700">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Loading comparative metrics and specialist profiles...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  const getRanking = (hospital) =>
    recommendation?.hospitalRankings?.find(
      (ranking) => String(ranking.hospitalId?._id || ranking.hospitalId) === String(hospital._id)
    );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-clinical-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-clinical-50 px-2.5 py-0.5 text-xs font-semibold text-clinical-700 uppercase tracking-wider">
            Comparative Decision Support
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-clinical-900 tracking-tight">
            Side-by-Side Hospital Comparison
          </h1>
          <p className="mt-1 text-sm text-ink/70">
            Comparing {hospitals.length} healthcare facilities across operational capacity, triage suitability, waiting times, and source-verified doctors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {recommendationId && (
            <Link
              to={`/recommendations/${recommendationId}`}
              className="rounded-lg border border-clinical-200 bg-white px-3.5 py-2 text-xs font-semibold text-clinical-700 hover:bg-clinical-50"
            >
              ← Back to Recommendations
            </Link>
          )}
          <Link
            to="/search"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink/75 hover:bg-slate-50"
          >
            Search More
          </Link>
        </div>
      </div>

      {/* Hospital Overview Cards Row */}
      <div className={`grid grid-cols-1 md:grid-cols-${hospitals.length} gap-4 mb-6`}>
        {hospitals.map((hospital) => {
          const ranking = getRanking(hospital);
          const websiteUrl = normalizeHospitalWebsite(hospital.website, hospital.name);
          const city = hospital.town || hospital.subtown || hospital.district;

          return (
            <div
              key={hospital._id}
              className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    {hospital.ownership || 'Hospital'}
                  </span>
                  {ranking && typeof ranking.score === 'number' && (
                    <div className="rounded-lg bg-clinical-50 px-2.5 py-1 text-center border border-clinical-100">
                      <span className="text-base font-extrabold text-clinical-700">{ranking.score}</span>
                      <span className="text-[10px] text-clinical-500 font-semibold uppercase">/100</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/hospitals/${hospital._id}`}
                  className="mt-2 block text-lg font-bold text-clinical-900 hover:text-clinical-700 transition"
                >
                  {hospital.name}
                </Link>
                <p className="mt-1 text-xs text-ink/65">
                  {[city, hospital.state].filter(Boolean).join(', ')}
                </p>

                {ranking?.distanceKm !== null && ranking?.distanceKm !== undefined && (
                  <p className="mt-1 text-xs font-medium text-clinical-700">
                    📍 {ranking.distanceKm} km from patient
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/hospitals/${hospital._id}`}
                  className="rounded-lg bg-clinical-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-clinical-700 transition"
                >
                  View Details
                </Link>
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink/75 hover:bg-slate-50 transition"
                  >
                    Official Site ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured Comparison Sections */}
      <div className="rounded-2xl border border-clinical-100 bg-white shadow-sm overflow-hidden">
        {/* Section 1: Clinical Capabilities */}
        <div className="bg-clinical-50/70 px-5 py-3 border-b border-clinical-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-clinical-800 flex items-center gap-1.5">
            <span>🩺</span> 1. Clinical Specialties & Emergency Preparedness
          </h2>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="grid grid-cols-12 p-4 items-center">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">
              Emergency Services (24/7)
            </div>
            {hospitals.map((h) => (
              <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)}`}>
                {h.emergencyFlag ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 font-bold text-rose-700">
                    🚨 Emergency Listed
                  </span>
                ) : (
                  <span className="text-ink/60 italic">Not confirmed</span>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 p-4 items-start">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">
              Clinical Specialties
            </div>
            {hospitals.map((h) => {
              const specs = [...new Set([...(h.specialties || []), ...(h.officialEnrichment?.departments || [])])];
              return (
                <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)} space-y-1`}>
                  {specs.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {specs.slice(0, 6).map((s) => (
                        <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-ink/80">
                          {s}
                        </span>
                      ))}
                      {specs.length > 6 && (
                        <span className="text-[11px] text-ink/50">+{specs.length - 6} more</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-ink/50 italic">General Care</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-12 p-4 items-start">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">
              Key Facilities
            </div>
            {hospitals.map((h) => (
              <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)}`}>
                {h.facilities?.length > 0 ? (
                  <p className="text-ink/75 leading-relaxed">{h.facilities.join(', ')}</p>
                ) : (
                  <span className="text-ink/50 italic">Standard Hospital Infrastructure</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Bed Capacity & Utilization */}
        <div className="bg-clinical-50/70 px-5 py-3 border-y border-clinical-100 mt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-clinical-800 flex items-center gap-1.5">
            <span>🛏️</span> 2. Bed Capacity Breakdown (Truthful Separation)
          </h2>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="grid grid-cols-12 p-4 items-center">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">Total Beds</div>
            {hospitals.map((h) => {
              const total = h.bedAvailability?.totalBeds || h.operationalData?.totalBeds || h.totalBeds;
              return (
                <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)}`}>
                  <strong className="text-sm font-bold text-ink">{total ? Number(total).toLocaleString() : 'Not reported'}</strong>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-12 p-4 items-center">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">
              Reported Available Beds
            </div>
            {hospitals.map((h) => {
              const live = h.bedAvailability?.isLive ? h.bedAvailability?.availableBeds : null;
              return (
                <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)}`}>
                  {live !== null && live !== undefined ? (
                    <strong className="text-emerald-700 font-bold">{live} (Live facility reported)</strong>
                  ) : (
                    <span className="text-ink/60 italic">Not reported</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-12 p-4 items-center">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">
              Estimated Available Beds
            </div>
            {hospitals.map((h) => {
              const est = h.operationalData?.available ? h.operationalData.bedsAvailable : null;
              return (
                <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)}`}>
                  {est !== null && est !== undefined ? (
                    <span className="font-semibold text-amber-800">
                      {est} <span className="text-[10px] text-ink/50 font-normal">(Operational Model)</span>
                    </span>
                  ) : (
                    <span className="text-ink/60 italic">Cannot be estimated from data</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-12 p-4 items-center">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">Occupied Beds</div>
            {hospitals.map((h) => {
              const occ = h.bedAvailability?.occupiedBeds || h.operationalData?.occupiedBeds;
              return (
                <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)}`}>
                  {occ ? (
                    <span className="font-semibold text-ink">{occ.toLocaleString()}</span>
                  ) : (
                    <span className="text-ink/60 italic">Not reported</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Waiting Time & Telemetry */}
        <div className="bg-clinical-50/70 px-5 py-3 border-y border-clinical-100 mt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-clinical-800 flex items-center gap-1.5">
            <span>⏳</span> 3. Waiting Time Estimation (XGBoost Operational Model)
          </h2>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="grid grid-cols-12 p-4 items-center">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">
              Estimated Wait Time
            </div>
            {hospitals.map((h) => {
              const ranking = getRanking(h);
              const opWait = h.operationalData?.waitingTimeMinutes;
              const predWait = ranking?.expectedWaitMinutes || opWait || h.predictedWaitingTime;

              return (
                <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)}`}>
                  {predWait ? (
                    <div>
                      <strong className="text-base font-bold text-clinical-800">{predWait} mins</strong>
                      <p className="text-[10px] text-ink/50 mt-0.5">
                        Model: XGBoost Operational Regressor
                      </p>
                    </div>
                  ) : (
                    <span className="text-ink/60 italic">Waiting time estimate unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Verified Doctors */}
        <div className="bg-clinical-50/70 px-5 py-3 border-y border-clinical-100 mt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-clinical-800 flex items-center gap-1.5">
            <span>👨‍⚕️</span> 4. Source-Verified Doctors & Specialists
          </h2>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="grid grid-cols-12 p-4 items-start">
            <div className="col-span-12 sm:col-span-3 font-semibold text-ink/75 mb-1 sm:mb-0">
              Verified Medical Faculty
            </div>
            {hospitals.map((h) => {
              const verifiedDocs = [
                ...(h.registryDoctors || []),
                ...(h.officialEnrichment?.doctors || []),
              ];

              return (
                <div key={h._id} className={`col-span-12 sm:col-span-${Math.floor(9 / hospitals.length)} space-y-2`}>
                  {verifiedDocs.length > 0 ? (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        ✓ {verifiedDocs.length} Verified Specialist{verifiedDocs.length > 1 ? 's' : ''}
                      </span>
                      <ul className="space-y-1.5 mt-1">
                        {verifiedDocs.slice(0, 3).map((doc, idx) => (
                          <li key={doc._id || idx} className="rounded bg-slate-50 p-2 border border-slate-200/60">
                            <strong className="block text-ink text-xs">{doc.name}</strong>
                            <span className="text-clinical-700 font-medium block">{doc.specialization || doc.title}</span>
                            {doc.qualification && (
                              <span className="text-[10px] text-ink/60 block">{doc.qualification}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <span className="text-ink/60 italic">No verified doctors listed for this facility</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advisory Footer */}
      <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-ink/65 leading-relaxed text-center">
        This comparative report synthesizes official facility records, verified hospital doctor directories, and predictive operational benchmarks. MediNexus does not guarantee bed reservation. Contact hospital emergency admissions directly to confirm current bed readiness.
      </div>
    </main>
  );
}
