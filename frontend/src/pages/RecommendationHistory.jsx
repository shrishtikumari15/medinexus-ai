import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendationHistory } from '../services/recommendationApi';
import { getDependents } from '../services/dependentApi';

export default function RecommendationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dependents, setDependents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getDependents()
      .then((res) => setDependents(res.data))
      .catch(() => setError('Could not load family profiles for history filters.'));
  }, []);

  useEffect(() => {
    const filters = filter.startsWith('dependent:')
      ? { dependentId: filter.slice('dependent:'.length) }
      : { scope: filter };
    setLoading(true);
    getRecommendationHistory(filters)
      .then((res) => setHistory(res.data))
      .catch(() => setError('Could not load history.'))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-clinical-700 mb-6">Recommendation History</h1>
      <label className="mb-5 block max-w-sm text-sm text-ink/70">
        Show history
        <select value={filter} onChange={(event) => setFilter(event.target.value)} className="mt-1 block w-full rounded-md border border-clinical-100 bg-white px-3 py-2">
          <option value="all">All assessments</option>
          <option value="mine">My assessments</option>
          <option value="family">Family members</option>
          {dependents.map((dependent) => <option key={dependent._id} value={`dependent:${dependent._id}`}>{dependent.name} - {dependent.relationship}</option>)}
        </select>
      </label>
      {loading && <p className="text-ink/50">Loading...</p>}
      {error && <p className="text-urgent-500">{error}</p>}
      {!loading && !error && history.length === 0 && <p className="text-ink/50">No assessments in this history filter yet.</p>}
      <ul className="space-y-3">
        {history.map((rec) => (
          <li key={rec._id}>
            <Link
              to={`/recommendations/${rec._id}`}
              className="block border border-clinical-100 rounded-lg p-4 bg-white hover:border-clinical-500"
            >
              <p className="text-sm text-ink/50">{new Date(rec.createdAt).toLocaleString()}</p>
              <p className="font-medium text-clinical-700 mt-1">
                {rec.assessmentId?.dependentSnapshot
                  ? `For ${rec.assessmentId.dependentSnapshot.name} (${rec.assessmentId.dependentSnapshot.relationship}) · `
                  : 'For me · '}
                {rec.hospitalRankings.length} hospitals ranked
                {rec.hospitalRankings[0] && ` - top pick: ${rec.hospitalRankings[0].hospitalId?.name || 'Hospital'} (${rec.hospitalRankings[0].score}/100)`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
