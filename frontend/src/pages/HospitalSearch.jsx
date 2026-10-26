import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HospitalCard from '../components/HospitalCard';
import HospitalSearchInput from '../components/HospitalSearchInput';
import { getOperationalReference, searchHospitals } from '../services/hospitalApi';

const POPULAR_SPECIALTIES = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Emergency Medicine',
  'Oncology',
  'Nephrology',
  'Pediatrics',
  'Gastroenterology',
];

const POPULAR_METROS = ['Mumbai', 'Bengaluru', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'];
const POPULAR_NETWORKS = ['Apollo', 'Fortis', 'Manipal'];

export default function HospitalSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    specialty: searchParams.get('specialty') || '',
    emergency: searchParams.get('emergency') || '',
  });
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compareSelection, setCompareSelection] = useState([]);
  const [datasetReference, setDatasetReference] = useState(null);

  async function runSearch(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await searchHospitals({ ...cleaned, page });
      setResults(res.data);
      setPagination(res.pagination);
      setSearchMeta(res.meta || null);
    } catch (err) {
      setError('Could not load hospitals. Please ensure the backend service is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(1);
    getOperationalReference()
      .then((response) => setDatasetReference(response.data || null))
      .catch(() => setDatasetReference(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleCompare(id) {
    setCompareSelection((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : sel.length < 3 ? [...sel, id] : sel
    );
  }

  function triggerSearchWithFilters(newFilters, page = 1) {
    setLoading(true);
    setError(null);
    const cleaned = Object.fromEntries(Object.entries(newFilters).filter(([, v]) => v));
    searchHospitals({ ...cleaned, page })
      .then((res) => {
        setResults(res.data);
        setPagination(res.pagination);
        setSearchMeta(res.meta || null);
      })
      .catch(() => setError('Could not load hospitals.'))
      .finally(() => setLoading(false));
  }

  function handleSpecialtyClick(spec) {
    const nextSpecialty = filters.specialty.toLowerCase() === spec.toLowerCase() ? '' : spec;
    const nextFilters = { ...filters, specialty: nextSpecialty };
    setFilters(nextFilters);
    triggerSearchWithFilters(nextFilters);
  }

  function handleMetroClick(metro) {
    const nextState = filters.state.toLowerCase() === metro.toLowerCase() ? '' : metro;
    const nextFilters = { ...filters, state: nextState, city: '' };
    setFilters(nextFilters);
    triggerSearchWithFilters(nextFilters);
  }

  function handleNetworkClick(net) {
    const nextQ = filters.q.toLowerCase() === net.toLowerCase() ? '' : net;
    const nextFilters = { ...filters, q: nextQ };
    setFilters(nextFilters);
    triggerSearchWithFilters(nextFilters);
  }

  function handleResetFilters() {
    const reset = { q: '', state: '', city: '', specialty: '', emergency: '' };
    setFilters(reset);
    triggerSearchWithFilters(reset, 1);
  }

  const hasActiveFilters = Boolean(
    filters.q || filters.state || filters.city || filters.specialty || filters.emergency
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-clinical-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-clinical-50 px-2.5 py-0.5 text-xs font-semibold text-clinical-700 uppercase tracking-wider">
            Directory & Resource Search
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-clinical-900 tracking-tight">
            Find Verified Hospitals & Specialists
          </h1>
          <p className="mt-1 text-sm text-ink/70">
            Search healthcare facilities across India with operational bed capacity, XGBoost waiting time estimates, and source-verified doctors.
          </p>
        </div>

        {compareSelection.length >= 2 && (
          <button
            onClick={() => navigate(`/hospitals/compare?ids=${compareSelection.join(',')}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-clinical-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-clinical-700 transition"
          >
            <span>⚖️ Compare ({compareSelection.length}) Hospitals</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Search & Filter Box */}
      <div className="rounded-2xl border border-clinical-100 bg-white p-5 shadow-sm mb-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(1);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-ink/70 mb-1">Hospital Name</label>
              <HospitalSearchInput
                type="hospital"
                placeholder="e.g. Apollo, Manipal, Fortis..."
                className="w-full border border-clinical-200 rounded-lg px-3 py-2 text-sm text-ink focus:border-clinical-500 focus:ring-1 focus:ring-clinical-200"
                value={filters.q}
                onChange={(e) => setFilters((current) => ({ ...current, q: e.target.value }))}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-ink/70 mb-1">State</label>
              <HospitalSearchInput
                type="state"
                placeholder="e.g. Karnataka"
                className="w-full border border-clinical-200 rounded-lg px-3 py-2 text-sm text-ink focus:border-clinical-500 focus:ring-1 focus:ring-clinical-200"
                value={filters.state}
                onChange={(e) => setFilters((current) => ({ ...current, state: e.target.value }))}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-ink/70 mb-1">City / Town</label>
              <input
                aria-label="City"
                placeholder="e.g. Bengaluru"
                className="w-full border border-clinical-200 rounded-lg px-3 py-2 text-sm text-ink focus:border-clinical-500 focus:ring-1 focus:ring-clinical-200"
                value={filters.city}
                onChange={(e) => setFilters((current) => ({ ...current, city: e.target.value }))}
                maxLength={80}
              />
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-ink/70 mb-1">Clinical Specialty</label>
              <HospitalSearchInput
                type="specialty"
                placeholder="e.g. Cardiology, Neurology..."
                className="w-full border border-clinical-200 rounded-lg px-3 py-2 text-sm text-ink focus:border-clinical-500 focus:ring-1 focus:ring-clinical-200"
                value={filters.specialty}
                onChange={(e) => setFilters((current) => ({ ...current, specialty: e.target.value }))}
              />
            </div>
          </div>

          {/* Quick Filter Pills (Specialties, Metros, Networks) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {/* Metros */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500 mr-1">Metros:</span>
              {POPULAR_METROS.map((metro) => {
                const isActive = filters.state.toLowerCase() === metro.toLowerCase();
                return (
                  <button
                    key={metro}
                    type="button"
                    onClick={() => handleMetroClick(metro)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-clinical-700 text-white font-bold shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📍 {metro}
                  </button>
                );
              })}
            </div>

            {/* Networks */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500 mr-1">Networks:</span>
              {POPULAR_NETWORKS.map((net) => {
                const isActive = filters.q.toLowerCase() === net.toLowerCase();
                return (
                  <button
                    key={net}
                    type="button"
                    onClick={() => handleNetworkClick(net)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-emerald-700 text-white font-bold shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
                    }`}
                  >
                    🏥 {net}
                  </button>
                );
              })}
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500 mr-1">Specialties:</span>
              {POPULAR_SPECIALTIES.map((spec) => {
                const isActive = filters.specialty.toLowerCase() === spec.toLowerCase();
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleSpecialtyClick(spec)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-clinical-600 text-white font-bold shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-clinical-50 hover:text-clinical-700'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-ink/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.emergency === 'true'}
                  onChange={(e) => {
                    const nextEmergency = e.target.checked ? 'true' : '';
                    const nextFilters = { ...filters, emergency: nextEmergency };
                    setFilters(nextFilters);
                    triggerSearchWithFilters(nextFilters);
                  }}
                  className="rounded border-slate-300 text-clinical-600 focus:ring-clinical-500"
                />
                <span className="text-rose-700 font-bold">🚨 24/7 Emergency Listed Only</span>
              </label>

              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-clinical-700 px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-clinical-800 transition disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search Facilities →'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Floating Compare Notification Bar */}
      {compareSelection.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-clinical-50 border border-clinical-200 px-4 py-2.5 text-xs">
          <span className="text-clinical-800 font-medium">
            <strong>{compareSelection.length}</strong> / 3 hospitals selected for side-by-side comparison.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareSelection([])}
              className="text-ink/60 hover:text-ink underline"
            >
              Clear selection
            </button>
            {compareSelection.length >= 2 && (
              <button
                onClick={() => navigate(`/hospitals/compare?ids=${compareSelection.join(',')}`)}
                className="rounded-lg bg-clinical-600 px-3 py-1 font-bold text-white hover:bg-clinical-700"
              >
                Compare Now →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fallback Notice */}
      {searchMeta?.fallback && (
        <div role="note" className="mb-5 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3.5 text-xs text-amber-900 leading-relaxed shadow-sm">
          <strong>Notice:</strong> {searchMeta.note} Showing hospitals matched by name and location.
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-clinical-700">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Filtering facilities & verifying doctor credentials...
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-center text-xs font-semibold text-rose-700 mb-6">
          {error}
        </div>
      )}

      {/* Hospital Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {results.map((h) => (
            <HospitalCard
              key={h._id}
              hospital={h}
              datasetReference={datasetReference}
              searchState={filters.state}
              searchSpecialty={filters.specialty}
              searchQuery={filters.q}
              onCompareToggle={toggleCompare}
              isSelectedForCompare={compareSelection.includes(h._id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 mb-3">
            🔍
          </div>
          <h3 className="text-base font-bold text-ink">No matching hospitals found</h3>
          <p className="mt-1 text-xs text-ink/60 max-w-sm mx-auto">
            Try adjusting your search filters or clearing the specialty constraint to view all available regional facilities.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-4 rounded-lg bg-clinical-50 border border-clinical-200 px-4 py-2 text-xs font-semibold text-clinical-700 hover:bg-clinical-100"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-8 text-xs font-semibold">
          <button
            disabled={pagination.page <= 1}
            onClick={() => runSearch(pagination.page - 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-ink/70 hover:bg-slate-50 disabled:opacity-40"
          >
            ← Previous
          </button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).slice(0, 10).map((p) => (
            <button
              key={p}
              onClick={() => runSearch(p)}
              className={`rounded-lg px-3 py-1.5 transition ${
                p === pagination.page
                  ? 'bg-clinical-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-ink/75 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => runSearch(pagination.page + 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-ink/70 hover:bg-slate-50 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
