import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import HospitalSearchInput from '../components/HospitalSearchInput';
import { searchDoctors } from '../services/doctorApi';

const NOT_AVAILABLE = 'Not available from public source';

export default function DoctorDirectory() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    hospital: searchParams.get('hospital') || '',
    specialty: searchParams.get('specialty') || '',
  });
  const [doctors, setDoctors] = useState([]);
  const [source, setSource] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function executeSearch(customFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(
        Object.entries(customFilters).filter(([, value]) => value && value.trim())
      );
      const result = await searchDoctors(params);
      setDoctors(result.data || []);
      setSource(result.source);
      setSearched(true);
    } catch {
      setError('Doctor records could not be loaded. Please verify the backend service is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    executeSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleReset() {
    const emptyFilters = { q: '', state: '', city: '', hospital: '', specialty: '' };
    setFilters(emptyFilters);
    executeSearch(emptyFilters);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 border-b border-clinical-100 pb-6">
        <p className="panel-eyebrow">Verified Care Directory</p>
        <h1 className="panel-title">Find Verified Doctors &amp; Specialists</h1>
        <p className="panel-subtitle">
          Explore real doctor records verified against official hospital directories and official medical registries.
          Filter by State → City → Hospital → Specialty or search by Doctor Name.
        </p>
      </header>

      {/* Cascading Filter Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch();
        }}
        className="mb-8 space-y-4 rounded-xl border border-clinical-100 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          {/* Doctor Name Search */}
          <div className="grid gap-1 text-xs font-semibold text-ink/70 md:col-span-2">
            <label htmlFor="doctor-search-q">Doctor Name</label>
            <input
              id="doctor-search-q"
              placeholder="e.g. Dr. Abhijit, Dr. Devi..."
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              className="min-h-10 rounded-md border border-clinical-200 bg-white px-3 text-sm font-normal text-ink outline-none focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500"
              maxLength={100}
            />
          </div>

          {/* State */}
          <div className="grid gap-1 text-xs font-semibold text-ink/70">
            <label htmlFor="doctor-search-state">State</label>
            <HospitalSearchInput
              id="doctor-search-state"
              type="state"
              placeholder="e.g. Karnataka, Maharashtra"
              className="min-h-10 rounded-md border border-clinical-200 bg-white px-3 text-sm font-normal text-ink outline-none focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500"
              value={filters.state}
              onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
            />
          </div>

          {/* City */}
          <div className="grid gap-1 text-xs font-semibold text-ink/70">
            <label htmlFor="doctor-search-city">City</label>
            <input
              id="doctor-search-city"
              placeholder="e.g. Bengaluru, Mumbai"
              value={filters.city}
              onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
              className="min-h-10 rounded-md border border-clinical-200 bg-white px-3 text-sm font-normal text-ink outline-none focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500"
              maxLength={80}
            />
          </div>

          {/* Specialty */}
          <div className="grid gap-1 text-xs font-semibold text-ink/70">
            <label htmlFor="doctor-search-specialty">Specialty</label>
            <HospitalSearchInput
              id="doctor-search-specialty"
              type="specialty"
              placeholder="e.g. Cardiology, Neurology"
              className="min-h-10 rounded-md border border-clinical-200 bg-white px-3 text-sm font-normal text-ink outline-none focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500"
              value={filters.specialty}
              onChange={(e) => setFilters((prev) => ({ ...prev, specialty: e.target.value }))}
            />
          </div>
        </div>

        {/* Hospital Cascading Filter */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end pt-1">
          <div className="grid gap-1 text-xs font-semibold text-ink/70">
            <label htmlFor="doctor-search-hospital">Hospital</label>
            <HospitalSearchInput
              id="doctor-search-hospital"
              type="hospital"
              placeholder="e.g. Apollo Hospitals, Fortis Hospital, AIIMS..."
              className="min-h-10 rounded-md border border-clinical-200 bg-white px-3 text-sm font-normal text-ink outline-none focus:border-clinical-500 focus:ring-1 focus:ring-clinical-500"
              value={filters.hospital}
              onChange={(e) => setFilters((prev) => ({ ...prev, hospital: e.target.value }))}
            />
          </div>

          <button
            className="secondary-btn min-h-10 px-4 text-xs font-semibold"
            type="button"
            onClick={handleReset}
          >
            Reset Filters
          </button>

          <button
            className="primary-btn min-h-10 px-6 text-sm font-semibold"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Doctors'}
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500 mr-1">Flagships:</span>
            {['Apollo', 'Fortis', 'Manipal'].map((net) => {
              const isActive = (filters.hospital || '').toLowerCase().includes(net.toLowerCase());
              return (
                <button
                  key={net}
                  type="button"
                  onClick={() => {
                    const nextHospital = isActive ? '' : net;
                    const nextFilters = { ...filters, hospital: nextHospital };
                    setFilters(nextFilters);
                    executeSearch(nextFilters);
                  }}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-700 text-white font-bold shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
                  }`}
                >
                  🏥 {net} Specialists
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500 mr-1">Specialties:</span>
            {['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Gastroenterology', 'Pulmonology', 'Pediatrics'].map((spec) => {
              const isActive = (filters.specialty || '').toLowerCase() === spec.toLowerCase();
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    const nextSpec = isActive ? '' : spec;
                    const nextFilters = { ...filters, specialty: nextSpec };
                    setFilters(nextFilters);
                    executeSearch(nextFilters);
                  }}
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
        </div>
      </form>

      {error && <p role="alert" className="mb-4 text-sm text-urgent-500 font-medium">{error}</p>}

      {source && (
        <div className="mb-6 rounded-lg bg-clinical-50/70 border border-clinical-100 p-3 text-xs text-ink/70 flex flex-wrap items-center justify-between gap-2">
          <span>
            Doctor profiles are sourced from official hospital directories and verified registries (such as NMC/IMR).
          </span>
          <span className="font-medium text-clinical-700">
            {doctors.length} {doctors.length === 1 ? 'doctor record' : 'doctor records'} found
          </span>
        </div>
      )}

      {/* Results List */}
      <section className="space-y-4" aria-label="Doctor search results">
        {doctors.map((doctor) => {
          const hospitalName = doctor.hospitalName || doctor.hospitalId?.name || NOT_AVAILABLE;
          const hospitalCity = doctor.city || doctor.hospitalId?.town || doctor.hospitalId?.district || null;
          const hospitalState = doctor.state || doctor.hospitalId?.state || null;
          const location = [hospitalCity, hospitalState].filter(Boolean).join(', ') || NOT_AVAILABLE;
          const officialProfileUrl = doctor.officialDoctorProfileUrl || doctor.profileUrl || doctor.sourceUrl;
          const officialHospitalUrl = doctor.officialHospitalUrl || doctor.hospitalId?.website;
          const isVerified = doctor.verificationStatus === 'Verified';

          return (
            <article
              key={doctor._id}
              className="health-card p-5 transition duration-200 hover:shadow-md border border-slate-200/80"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-clinical-800">
                      ✓ {doctor.name}
                    </h2>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        Unverified
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-clinical-600">
                    {doctor.specialization || doctor.title || NOT_AVAILABLE}
                  </p>

                  {doctor.title && doctor.title !== doctor.specialization && (
                    <p className="text-xs text-ink/70 font-medium">{doctor.title}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {officialProfileUrl && (
                    <a
                      className="inline-flex items-center justify-center rounded-md border border-clinical-200 bg-white px-3 py-1.5 text-xs font-semibold text-clinical-700 hover:bg-clinical-50 transition"
                      href={officialProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Official Profile ↗
                    </a>
                  )}
                  {doctor.hospitalId?._id && (
                    <Link
                      className="inline-flex items-center justify-center rounded-md bg-clinical-50 px-3 py-1.5 text-xs font-semibold text-clinical-700 hover:bg-clinical-100 transition"
                      to={`/hospitals/${doctor.hospitalId._id}`}
                    >
                      View Hospital
                    </Link>
                  )}
                </div>
              </div>

              {/* Doctor Details Grid */}
              <dl className="mt-4 grid gap-x-6 gap-y-2.5 text-xs sm:grid-cols-2 md:grid-cols-3 border-t border-slate-100 pt-3">
                <div>
                  <dt className="text-ink/50 font-medium">Hospital</dt>
                  <dd className="font-semibold text-ink/80 mt-0.5">{hospitalName}</dd>
                </div>

                <div>
                  <dt className="text-ink/50 font-medium">Location (City, State)</dt>
                  <dd className="font-medium text-ink/80 mt-0.5">{location}</dd>
                </div>

                <div>
                  <dt className="text-ink/50 font-medium">Qualification</dt>
                  <dd className="font-medium text-ink/80 mt-0.5">{doctor.qualification || NOT_AVAILABLE}</dd>
                </div>

                {doctor.experience && (
                  <div>
                    <dt className="text-ink/50 font-medium">Experience</dt>
                    <dd className="font-medium text-ink/80 mt-0.5">{doctor.experience}</dd>
                  </div>
                )}

                {doctor.registrationNumber && (
                  <div>
                    <dt className="text-ink/50 font-medium">Registration / License</dt>
                    <dd className="font-medium text-ink/80 mt-0.5">{doctor.registrationNumber}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-ink/50 font-medium">Verification Source</dt>
                  <dd className="font-medium text-ink/80 mt-0.5">{doctor.source || 'Official Hospital Profile'}</dd>
                </div>
              </dl>

              {doctor.biography && (
                <p className="mt-3 text-xs leading-relaxed text-ink/75 border-t border-slate-100 pt-2">
                  {doctor.biography}
                </p>
              )}

              {doctor.expertise?.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1 text-xs">
                  <span className="font-semibold text-ink/70">Expertise:</span>
                  {doctor.expertise.map((exp, idx) => (
                    <span key={idx} className="soft-chip text-[11px]">{exp}</span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {searched && !loading && doctors.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-sm font-medium text-ink/60">
            No verified doctor records match these filters.
          </p>
          <p className="mt-1 text-xs text-ink/40">
            Try broadening your search or resetting the filters.
          </p>
        </div>
      )}
    </main>
  );
}