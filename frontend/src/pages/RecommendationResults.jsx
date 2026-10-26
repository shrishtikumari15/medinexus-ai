import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import HospitalCard from '../components/HospitalCard';
import DoctorCard from '../components/DoctorCard';
import { getRecommendationById } from '../services/recommendationApi';

export default function RecommendationResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [compareSelection, setCompareSelection] = useState([]);

  useEffect(() => {
    setLoading(true);
    getRecommendationById(id)
      .then((res) => setRecommendation(res.data))
      .catch((err) => {
        if (err.response && [401, 403].includes(err.response.status)) {
          navigate('/login', { replace: true });
          return;
        }
        setError('Could not load this recommendation.');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <p className="max-w-5xl mx-auto px-4 py-10 text-ink/50">Loading recommendations...</p>;
  if (error) return <p className="max-w-5xl mx-auto px-4 py-10 text-urgent-500">{error}</p>;

  const assessment = recommendation.assessmentId;
  const dependent = assessment?.dependentSnapshot;

    function toggleCompare(hospitalId) {
      setCompareSelection((current) => current.includes(hospitalId)
        ? current.filter((id) => id !== hospitalId)
        : current.length < 3 ? [...current, hospitalId] : current);
    }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="health-card mb-8 overflow-hidden p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="health-badge">Network-aware care matching</span>
            <h1 className="mt-3 text-3xl font-bold text-clinical-700">Hospitals matched to care and local demand</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/60">
              Clinical fit stays central while recent recommendation volume helps spread demand across suitable hospitals.
            </p>
            {dependent && (
              <div className="mt-4 border-l-2 border-clinical-500 pl-3">
                <p className="text-xs font-semibold uppercase text-clinical-600">Assessment for</p>
                <p className="font-semibold text-clinical-700">{dependent.name}</p>
                <p className="text-sm text-ink/60">{dependent.relationship} · Age {dependent.ageAtAssessment}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="soft-chip bg-clinical-50 text-clinical-700">Best match: #{recommendation.hospitalRankings[0]?.score ?? 0}</span>
            <span className="soft-chip bg-stable-100 text-stable-500">{recommendation.hospitalRankings.length} options</span>
          </div>
        </div>
        {recommendation.demandContext && (
          <p className="mt-5 border-t border-clinical-100 pt-4 text-xs leading-relaxed text-ink/60">
            Demand signal: recommendations from the last {recommendation.demandContext.windowHours || 6} hours
            {recommendation.demandContext.locationScoped ? ` within about ${recommendation.demandContext.radiusKm} km` : ' across the network'}.
            {' '}This is not a live occupancy or capacity feed.
          </p>
        )}
      </div>

      <div className="space-y-5">
        {recommendation.hospitalRankings.map((ranking, i) => {
          const hospital = ranking.hospitalId;
          if (!hospital || typeof hospital === 'string') return null;

          return (
            <div key={hospital._id} className="relative">
              <div className="absolute -left-4 top-5 hidden h-10 w-10 items-center justify-center rounded-full bg-clinical-700 text-sm font-bold text-white shadow-lg sm:flex">
                #{i + 1}
              </div>

              <div className="ml-0 sm:ml-10">
                <HospitalCard
                  hospital={{
                    ...hospital,
                    bedAvailability: ranking.bedAvailability,
                    operationalData: ranking.operationalData
                      ? { available: true, ...ranking.operationalData }
                      : { available: false, message: 'Operational data not available' },
                    registryDoctors: ranking.doctors || [],
                  }}
                  score={ranking.score}
                  distanceKm={ranking.distanceKm}
                  breakdown={ranking.breakdown}
                  recentRecommendationCount={ranking.recentRecommendationCount}
                  demandWindowHours={recommendation.demandContext?.windowHours || 6}
                  reasons={ranking.reasons}
                  recommendationId={recommendation._id}
                  searchSpecialty={assessment?.requiredSpecialties?.[0] || ''}
                  onCompareToggle={toggleCompare}
                  isSelectedForCompare={compareSelection.includes(hospital._id)}
                />

                <p className="mt-3 rounded-md border-l-4 border-clinical-500 bg-white px-4 py-3 text-sm leading-6 text-ink/70">
                  {ranking.explanation}
                </p>

                {ranking.waitingTimeDataMode === 'simulated' && (
                  <p className="mt-2 text-xs text-amber-800">
                    Simulated operational benchmark estimate (XGBoost). This is derived from our operational dataset and is not live telemetry.
                  </p>
                )}

                {/* Verified Specialists Section */}
                <div className="mt-4 rounded-xl border border-clinical-200 bg-clinical-50/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink">
                        {assessment?.requiredSpecialties?.[0]
                          ? `Verified Specialists for ${assessment.requiredSpecialties[0]}`
                          : 'Verified Specialists'}
                      </h3>
                      <p className="text-xs text-ink/65">
                        Only official, source-verified doctor profiles affiliated with this hospital.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      {ranking.doctors?.length || 0} Verified
                    </span>
                  </div>

                  {ranking.doctors && ranking.doctors.length > 0 ? (
                    <div className="grid gap-3">
                      {ranking.doctors.map((doctor) => (
                        <DoctorCard
                          key={doctor.doctorId || doctor._id}
                          doctor={{
                            ...doctor,
                            hospitalName: hospital.name,
                            city: hospital.district || hospital.city,
                            state: hospital.state,
                          }}
                          showHospital={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-clinical-200 bg-white p-4 text-center">
                      <p className="text-xs font-medium text-ink/75">
                        No verified doctors found for this hospital and {assessment?.requiredSpecialties?.[0] || 'the required specialty'}.
                      </p>
                      <p className="mt-1 text-[11px] text-ink/50">
                        MediNexus strictly displays official hospital-verified doctors and never substitutes synthetic profiles.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/recommendations/${recommendation._id}/explain?hospital=${hospital._id}`}
                    state={{ recommendation }}
                    className="primary-btn"
                  >
                    Why this hospital?
                  </Link>
                  <Link
                    to={`/hospitals/${hospital._id}?recommendationId=${recommendation._id}${assessment?.requiredSpecialties?.[0] ? `&specialty=${encodeURIComponent(assessment.requiredSpecialties[0])}` : ''}`}
                    className="secondary-btn"
                  >
                    View hospital details
                  </Link>
                </div>
                {compareSelection.length >= 2 && (
                  <button
                    className="primary-btn mt-6"
                    onClick={() => navigate(`/hospitals/compare?ids=${compareSelection.join(',')}&recommendationId=${recommendation._id}`)}
                  >
                    Compare {compareSelection.length} selected hospitals
                  </button>
                )}
                <p className="mt-8 border-t border-clinical-100 pt-4 text-xs leading-5 text-ink/55">Recommendations are decision support only, not a medical diagnosis or guaranteed treatment recommendation. Confirm current services, capacity, and care needs directly with a licensed professional or hospital.</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
