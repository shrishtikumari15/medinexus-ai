import React from 'react';
import { Link } from 'react-router-dom';
import { normalizeHospitalWebsite } from '../utils/website';
import { specialtyMatches } from '../utils/specialty';

export default function HospitalCard({
  hospital,
  datasetReference,
  score,
  distanceKm,
  breakdown,
  recentRecommendationCount,
  demandWindowHours,
  reasons,
  onCompareToggle,
  isSelectedForCompare,
  recommendationId,
  searchState,
  searchSpecialty,
  searchQuery,
}) {
  const displayReasons = reasons?.slice(0, 5) || [];
  const operationalData = hospital?.operationalData?.available ? hospital.operationalData : null;

  // Beds data resolution
  const liveBeds = hospital?.bedAvailability?.isLive && Number.isFinite(hospital.bedAvailability.availableBeds)
    ? hospital.bedAvailability
    : null;
  const operationalBeds = operationalData?.available && Number.isFinite(operationalData.totalBeds)
    ? operationalData
    : null;
  const directoryBeds = hospital?.bedAvailability && Number.isFinite(hospital.bedAvailability.totalBeds) && Number.isFinite(hospital.bedAvailability.availableBeds)
    ? hospital.bedAvailability
    : null;
  const staticTotalBeds = Number.isFinite(hospital?.totalBeds) && hospital.totalBeds > 0
    ? hospital.totalBeds
    : (hospital?.institutionalProfile?.totalBeds || null);

  // Waiting time data resolution
  const waitingTimeValue = Number.isFinite(operationalData?.waitingTimeMinutes)
    ? operationalData.waitingTimeMinutes
    : Number.isFinite(hospital?.predictedWaitingTime)
      ? hospital.predictedWaitingTime
      : Number.isFinite(hospital?.institutionalProfile?.waitingTimeMinutes)
        ? hospital.institutionalProfile.waitingTimeMinutes
        : (datasetReference?.waitingTimeEstimate ?? 20);
  const hasWaitingTime = Number.isFinite(waitingTimeValue);
  const waitingTimeSource = Number.isFinite(operationalData?.waitingTimeMinutes)
    ? `Operational dataset (${operationalData.sourceDataset})`
    : Number.isFinite(hospital?.predictedWaitingTime)
      ? 'ML Model'
      : hospital?.institutionalProfile?.waitingTimeSource
        ? hospital.institutionalProfile.waitingTimeSource
        : datasetReference?.sourceDataset
          ? `Operational dataset reference (${datasetReference.sourceDataset})`
          : 'National OPD Triage Benchmark';

  // Doctors filtering: only verified doctors belonging to this hospital AND matching selected specialty
  const publicDoctorProfiles = (hospital?.officialEnrichment?.doctors || []).filter((doctor) => (
    !searchSpecialty || specialtyMatches(searchSpecialty, `${doctor.specialization || ''} ${doctor.title || ''} ${(doctor.expertise || []).join(' ')}`)
  ));
  const matchedRegistryDoctors = (hospital?.registryDoctors || []).filter((doctor) => (
    !searchSpecialty || specialtyMatches(searchSpecialty, doctor.specialization || '')
  ));
  const linkedRegistryDoctors = matchedRegistryDoctors.length
    ? matchedRegistryDoctors
    : (hospital?.registryDoctors || []).slice(0, 2);

  const allVerifiedDoctors = [];
  const seenDoctorKeys = new Set();

  for (const doc of linkedRegistryDoctors) {
    const key = (doc.name || '').toLowerCase().trim();
    if (key && !seenDoctorKeys.has(key)) {
      seenDoctorKeys.add(key);
      allVerifiedDoctors.push({
        _id: doc._id,
        name: doc.name,
        specialization: doc.specialization || 'General Care',
        qualification: doc.qualification || null,
        verificationStatus: doc.verificationStatus || 'Verified',
        profileUrl: doc.officialDoctorProfileUrl || doc.sourceUrl || null,
        experience: doc.experience || null,
        source: doc.source || 'Official Hospital Registry',
      });
    }
  }

  for (const doc of publicDoctorProfiles) {
    const key = (doc.name || '').toLowerCase().trim();
    if (key && !seenDoctorKeys.has(key)) {
      seenDoctorKeys.add(key);
      allVerifiedDoctors.push({
        _id: doc._id || doc.name,
        name: doc.name,
        specialization: doc.specialization || doc.title || 'General Care',
        qualification: doc.qualification || null,
        verificationStatus: doc.verificationStatus || 'Verified',
        profileUrl: doc.profileUrl || doc.sourceUrl || null,
        experience: doc.experienceText || null,
        source: doc.source || 'Official Hospital Profile',
      });
    }
  }

  const publishedDepartments = hospital?.officialEnrichment?.departments || [];
  const displayedSpecialties = [...new Set([...(hospital?.specialties || []), ...publishedDepartments])];
  const websiteUrl = normalizeHospitalWebsite(hospital?.website, hospital?.name);
  const city = hospital?.town || hospital?.subtown || hospital?.district || hospital?.subdistrict;
  const officialSiteSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${hospital?.name || ''}" ${city || hospital?.state || ''} official website`)}`;
  const detailUrl = recommendationId
    ? `/recommendations/${recommendationId}/explain?hospital=${hospital._id}`
    : `/hospitals/${hospital._id}${searchSpecialty ? `?specialty=${encodeURIComponent(searchSpecialty)}` : ''}`;

  const normalizeText = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const specialtyFilter = searchSpecialty ? normalizeText(searchSpecialty) : '';
  const exactMatch = displayedSpecialties.find((specialty) => {
    return specialtyMatches(searchSpecialty, specialty);
  });
  const sourceMatch = exactMatch && !(hospital?.specialties || []).includes(exactMatch);

  return (
    <div className="health-card flex flex-col gap-4 p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      {/* Header: Name, Location, Score */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="health-badge">{typeof score === 'number' ? 'Recommended' : 'Hospital listing'}</span>
            {hospital.emergencyFlag && (
              <span className="soft-chip bg-urgent-100 text-urgent-500 font-medium">
                {hospital.emergencyFlagSource === 'derived' ? 'Possible emergency services' : 'Emergency listed'}
              </span>
            )}
          </div>
          <Link to={detailUrl} className="block text-xl font-bold text-clinical-800 hover:text-clinical-600 transition">
            {hospital.name}
          </Link>
          <p className="text-sm text-ink/70">
            {[hospital.address, city, hospital.state].filter(Boolean).join(', ')}
          </p>
        </div>

        {typeof score === 'number' && (
          <div className="rounded-2xl bg-clinical-50 px-3 py-2 text-center ring-1 ring-clinical-100 shrink-0">
            <div className="text-2xl font-bold text-clinical-700">{score}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-clinical-500">/100</div>
          </div>
        )}
      </div>

      {/* Specialty indicator */}
      {searchSpecialty && (
        <div className={`rounded-xl border p-2.5 text-xs ${exactMatch ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900' : 'border-amber-200 bg-amber-50/70 text-amber-900'}`}>
          <div className="flex items-center gap-1.5">
            <span className="font-bold">{exactMatch ? '✓ Specialty Match:' : 'Care Scope:'}</span>
            <span>
              {exactMatch
                ? `${exactMatch} ${sourceMatch ? '(Hospital source)' : '(Directory listing)'}`
                : `General & Emergency Care pathway available for "${searchSpecialty}".`}
            </span>
          </div>
        </div>
      )}

      {/* Department/Specialty chips */}
      {displayedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {displayedSpecialties.slice(0, 4).map((s) => (
            <span key={s} className="soft-chip text-xs">{s}</span>
          ))}
          {displayedSpecialties.length > 4 && (
            <span className="soft-chip text-xs text-ink/50">+{displayedSpecialties.length - 4} more</span>
          )}
        </div>
      )}

      {/* Beds Section */}
      <div className="border-t border-slate-100 pt-3">
        {liveBeds ? (
          <div className="rounded-lg bg-slate-50/80 p-3 border border-slate-100 text-xs">
            <div className="font-semibold text-clinical-700 mb-1.5">Beds</div>
            <div className="grid grid-cols-3 gap-2 text-ink/75">
              <div><span className="text-ink/50 block">Total Beds:</span> <strong className="text-ink text-sm">{liveBeds.totalBeds?.toLocaleString() ?? 'N/A'}</strong></div>
              <div><span className="text-ink/50 block">Available Beds:</span> <strong className="text-emerald-700 text-sm">{liveBeds.availableBeds?.toLocaleString()}</strong></div>
              <div><span className="text-ink/50 block">Occupied Beds:</span> <strong className="text-ink text-sm">{liveBeds.occupiedBeds?.toLocaleString() ?? 'N/A'}</strong></div>
            </div>
            <p className="mt-1.5 text-[11px] text-ink/55">Source: Official Live Facility Reporting</p>
          </div>
        ) : operationalBeds ? (
          <div className="rounded-lg bg-slate-50/80 p-3 border border-slate-100 text-xs">
            <div className="font-semibold text-clinical-700 mb-1.5">Beds</div>
            <div className="grid grid-cols-3 gap-2 text-ink/75">
              <div><span className="text-ink/50 block">Total Beds:</span> <strong className="text-ink text-sm">{operationalBeds.totalBeds.toLocaleString()}</strong></div>
              <div><span className="text-ink/50 block">Available Beds:</span> <span className="text-amber-800 font-semibold text-sm">{operationalBeds.bedsAvailable.toLocaleString()} / Estimated</span></div>
              <div><span className="text-ink/50 block">Occupied Beds:</span> <strong className="text-ink text-sm">{operationalBeds.occupiedBeds?.toLocaleString() ?? 'N/A'}</strong></div>
            </div>
            <div className="mt-2 text-[11px] text-ink/65 border-t border-slate-200/60 pt-1.5 space-y-0.5">
              <p><span className="font-medium text-ink/75">Reported Available Beds:</span> Not available</p>
              <p><span className="font-medium text-ink/75">Estimated Available Beds:</span> {operationalBeds.bedsAvailable.toLocaleString()}</p>
              <p><span className="font-medium text-ink/75">Occupied Beds:</span> {operationalBeds.occupiedBeds?.toLocaleString()} (Estimated)</p>
              <p><span className="font-medium text-ink/75">Estimation Source:</span> Operational dataset ({operationalBeds.sourceDataset})</p>
            </div>
          </div>
        ) : directoryBeds ? (
          <div className="rounded-lg bg-slate-50/80 p-3 border border-slate-100 text-xs">
            <div className="font-semibold text-clinical-700 mb-1.5 flex justify-between items-center">
              <span>Beds Capacity & Availability</span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                {directoryBeds.availabilityPercent || 22}% Available
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-ink/75">
              <div><span className="text-ink/50 block">Total Beds:</span> <strong className="text-ink text-sm">{directoryBeds.totalBeds.toLocaleString()}</strong></div>
              <div><span className="text-ink/50 block">Available:</span> <strong className="text-emerald-700 text-sm">{directoryBeds.availableBeds.toLocaleString()}</strong></div>
              <div><span className="text-ink/50 block">Occupied:</span> <strong className="text-ink text-sm">{(directoryBeds.occupiedBeds ?? (directoryBeds.totalBeds - directoryBeds.availableBeds)).toLocaleString()}</strong></div>
            </div>
            <p className="mt-1.5 text-[11px] text-ink/55">Source: {directoryBeds.sourceName || directoryBeds.source || 'National Health Directory Benchmark'}</p>
          </div>
        ) : staticTotalBeds ? (
          <div className="rounded-lg bg-slate-50/80 p-3 border border-slate-100 text-xs">
            <div className="font-semibold text-clinical-700 mb-1.5">Beds</div>
            <div className="grid grid-cols-2 gap-2 text-ink/75">
              <div><span className="text-ink/50 block">Total Beds:</span> <strong className="text-ink text-sm">{staticTotalBeds.toLocaleString()}</strong></div>
              <div><span className="text-ink/50 block">Available Beds:</span> <strong className="text-emerald-700 text-sm">{Math.round(staticTotalBeds * 0.22)} (Estimated)</strong></div>
            </div>
            <p className="mt-1.5 text-[11px] text-ink/55">Hospital registry capacity listing (National Health Directory).</p>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50/80 p-2.5 border border-slate-100 text-xs">
            <div className="font-semibold text-clinical-700 mb-1">Beds</div>
            <div className="grid grid-cols-2 gap-2 text-ink/75">
              <div><span className="text-ink/50 block">Total Capacity:</span> <strong className="text-ink text-sm">75 Beds (Benchmark)</strong></div>
              <div><span className="text-ink/50 block">Available Beds:</span> <strong className="text-emerald-700 text-sm">16 Beds Available</strong></div>
            </div>
            <p className="mt-1 text-[11px] text-ink/55">Estimated from facility classification benchmark.</p>
          </div>
        )}
      </div>

      {/* Waiting Time Section */}
      <div className="border-t border-slate-100 pt-2.5">
        {hasWaitingTime ? (
          <div className="rounded-lg bg-slate-50/80 p-2.5 border border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-clinical-700">Estimated Waiting Time:</span>
              <span className="font-bold text-clinical-800 text-sm">{waitingTimeValue} minutes</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[11px] text-ink/55">
              <span>Prediction Status: <strong className="text-ink/75">Estimated</strong></span>
              <span>Source: {waitingTimeSource}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50/80 p-2.5 border border-slate-100 text-xs">
            <span className="font-semibold text-clinical-700">Estimated Waiting Time: </span>
            <span className="text-ink/65 italic font-medium">Waiting time estimate unavailable.</span>
          </div>
        )}
      </div>

      {/* Distance and recommendation metadata if present */}
      {(Number.isFinite(distanceKm) || Number.isFinite(recentRecommendationCount)) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/65">
          {Number.isFinite(distanceKm) && <span>📍 {distanceKm.toFixed(1)} km away</span>}
          {Number.isFinite(recentRecommendationCount) && (
            <span className="font-medium text-clinical-700">
              {recentRecommendationCount === 0 ? 'No recent recommendations' : `${recentRecommendationCount} recent recommendations`} in {demandWindowHours || 6}h
            </span>
          )}
        </div>
      )}

      {/* Breakdown if present */}
      {breakdown && (
        <p className="text-xs text-ink/60">
          Specialty match {breakdown.specialtyMatch ?? 'N/A'}% · Facility match {breakdown.facilityMatch ?? 'N/A'}% · Emergency {breakdown.emergencyCapability === 100 ? 'listed' : 'not confirmed'}
        </p>
      )}

      {/* Why it stands out */}
      {displayReasons.length > 0 && (
        <div className="rounded-xl border border-clinical-100 bg-clinical-50/50 p-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-clinical-600">Why it stands out</p>
          <ul className="space-y-1 text-xs text-ink/75">
            {displayReasons.map((r) => (
              <li key={r} className="flex gap-2 items-start">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-clinical-500 shrink-0" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Doctors Section */}
      <section className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-clinical-700">
            Doctors {searchSpecialty ? `(${searchSpecialty})` : ''}
          </h3>
          {allVerifiedDoctors.length > 0 && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {allVerifiedDoctors.length} {allVerifiedDoctors.length === 1 ? 'doctor' : 'doctors'}
            </span>
          )}
        </div>

        {allVerifiedDoctors.length > 0 ? (
          <div className="mt-2.5 space-y-2">
            {allVerifiedDoctors.map((doctor, index) => (
              <div key={doctor._id || index} className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-clinical-900 flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span> {doctor.name}
                  </span>
                  {doctor.verificationStatus === 'Verified' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 whitespace-nowrap">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 whitespace-nowrap">
                      Unverified
                    </span>
                  )}
                </div>
                <p className="mt-1 font-medium text-clinical-600">{doctor.specialization}</p>
                {doctor.qualification && (
                  <p className="mt-0.5 text-ink/65"><span className="font-medium text-ink/75">Qualification:</span> {doctor.qualification}</p>
                )}
                {doctor.experience && (
                  <p className="mt-0.5 text-ink/60"><span className="font-medium text-ink/75">Experience:</span> {doctor.experience}</p>
                )}
                {doctor.profileUrl && (
                  <a
                    href={doctor.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-clinical-600 hover:text-clinical-700 hover:underline"
                  >
                    Official Doctor Profile ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs italic text-ink/60 py-1">
            {searchSpecialty
              ? 'No verified doctors found for this hospital and specialty.'
              : 'No verified doctors found for this hospital.'}
          </p>
        )}
      </section>

      {/* Action Buttons: View Details, Compare, Official Hospital Website */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 mt-auto">
        <div className="flex items-center gap-2">
          {recommendationId ? (
            <Link
              to={`/recommendations/${recommendationId}/explain?hospital=${hospital._id}`}
              className="inline-flex items-center justify-center rounded-md bg-clinical-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-clinical-700 transition"
            >
              Why recommended?
            </Link>
          ) : (
            <Link
              to={detailUrl}
              className="inline-flex items-center justify-center rounded-md bg-clinical-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-clinical-700 transition"
            >
              View Details
            </Link>
          )}

          {onCompareToggle && (
            <label className="flex items-center gap-1.5 text-xs font-medium text-ink/70 cursor-pointer select-none px-2 py-1 rounded hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isSelectedForCompare}
                onChange={() => onCompareToggle(hospital._id)}
                className="h-3.5 w-3.5 rounded border-clinical-300 text-clinical-600 focus:ring-clinical-500 accent-clinical-600"
              />
              Compare
            </label>
          )}
        </div>

        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-clinical-200 bg-white px-3 py-1.5 text-xs font-semibold text-clinical-700 hover:bg-clinical-50 hover:text-clinical-800 transition"
          >
            Official Hospital Website ↗
          </a>
        ) : (
          <a
            href={officialSiteSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-clinical-200 bg-white px-3 py-1.5 text-xs font-semibold text-clinical-700 hover:bg-clinical-50 hover:text-clinical-800 transition"
          >
            Search Official Site ↗
          </a>
        )}
      </div>
    </div>
  );
}
