import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecommendationHistory } from '../services/recommendationApi';

export default function UserDashboard() {
  const { user } = useAuth();
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRecommendationHistory()
      .then((res) => setRecentAssessments(res.data.slice(0, 5)))
      .catch(() => setError('Could not load recent activity.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="panel-shell space-y-8">
      <header className="panel-header">
        <div>
          <p className="panel-eyebrow">Patient workspace</p>
          <h1 className="panel-title">Welcome, {user?.name}</h1>
          <p className="panel-subtitle">Your care activity, family profiles, and hospital search in one place.</p>
        </div>
        <Link to="/assessment" className="primary-btn">Start an assessment</Link>
      </header>

      <section aria-label="Care shortcuts" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/assessment" className="panel-link-card">
          <span className="panel-eyebrow">01 · Care</span>
          <h2 className="mt-3 text-lg font-semibold text-clinical-700">New assessment</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">Enter symptoms and vitals to receive a clinical risk estimate and hospital matches.</p>
          <span className="mt-5 inline-block text-sm font-semibold text-clinical-600">Begin assessment →</span>
        </Link>
        <Link to="/hospitals" className="panel-link-card">
          <span className="panel-eyebrow">02 · Directory</span>
          <h2 className="mt-3 text-lg font-semibold text-clinical-700">Find hospitals</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">Search by location, specialty, and listed emergency services.</p>
          <span className="mt-5 inline-block text-sm font-semibold text-clinical-600">Open directory →</span>
        </Link>
        <Link to="/history" className="panel-link-card">
          <span className="panel-eyebrow">03 · Records</span>
          <h2 className="mt-3 text-lg font-semibold text-clinical-700">Care history</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">Review your recommendations and filter family assessments separately.</p>
          <span className="mt-5 inline-block text-sm font-semibold text-clinical-600">View history →</span>
        </Link>
        <Link to="/family" className="panel-link-card">
          <span className="panel-eyebrow">04 · Caregivers</span>
          <h2 className="mt-3 text-lg font-semibold text-clinical-700">Family profiles</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">Manage dependents and keep each person’s assessment history distinct.</p>
          <span className="mt-5 inline-block text-sm font-semibold text-clinical-600">Manage family →</span>
        </Link>
      </section>

      <section className="health-card overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-clinical-100 px-5 py-4">
          <div>
            <p className="panel-eyebrow">Recent records</p>
            <h2 className="mt-1 text-lg font-semibold text-clinical-700">Assessment activity</h2>
          </div>
          <Link to="/history" className="text-sm font-semibold text-clinical-600 hover:text-clinical-700">Full history →</Link>
        </div>
        <div className="p-5">
          {loading && <p className="text-sm text-ink/50">Loading recent activity...</p>}
          {error && <p role="alert" className="text-sm text-urgent-500">{error}</p>}
          {!loading && !error && recentAssessments.length === 0 && (
            <p className="text-sm text-ink/50">No assessments yet. Start an assessment to see your care activity here.</p>
          )}
          <ul className="divide-y divide-clinical-50">
            {recentAssessments.map((rec) => (
              <li key={rec._id}>
                <Link to={`/recommendations/${rec._id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm hover:text-clinical-700">
                  <span>
                    <span className="block font-semibold text-ink">{rec.assessmentId?.dependentSnapshot ? `For ${rec.assessmentId.dependentSnapshot.name}` : 'My assessment'}</span>
                    <span className="mt-1 block text-xs text-ink/50">{rec.assessmentId?.clinicalInputs?.chiefComplaint || 'Clinical assessment'} · {new Date(rec.createdAt).toLocaleString()}</span>
                  </span>
                  <span className="soft-chip">{rec.hospitalRankings.length} hospitals ranked</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
