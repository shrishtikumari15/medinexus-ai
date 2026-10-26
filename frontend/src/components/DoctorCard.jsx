import React from 'react';

export default function DoctorCard({ doctor, showHospital = true }) {
  if (!doctor) return null;

  const isVerified = doctor.verificationStatus === 'Verified' || doctor.verificationStatus === 'VERIFIED';
  const profileUrl = doctor.officialDoctorProfileUrl || doctor.hospitalAssociationSourceUrl || doctor.sourceUrl || doctor.profileUrl;
  const registrationAvailable = Boolean(doctor.registrationNumber || doctor.nmrId);
  const locationText = [doctor.city, doctor.state].filter(Boolean).join(', ');

  return (
    <article className="rounded-xl border border-clinical-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Doctor Avatar / Photo */}
          {doctor.photoUrl ? (
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="h-16 w-16 shrink-0 rounded-full border-2 border-clinical-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-clinical-50 text-xl font-bold text-clinical-700 border-2 border-clinical-200">
              {doctor.name ? doctor.name.replace(/^Dr\.?\s*/i, '').charAt(0) : 'D'}
            </div>
          )}

          <div className="min-w-0">
            {/* Verification Badge */}
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span>✓ {isVerified ? 'VERIFIED DOCTOR' : 'PARTIALLY VERIFIED'}</span>
            </div>

            <h3 className="text-lg font-bold text-ink">
              {doctor.name}
            </h3>

            <p className="text-sm font-semibold text-clinical-600">
              {doctor.specialization || 'Specialist'}
              {doctor.subSpecialty && <span className="text-ink/60 font-normal"> · {doctor.subSpecialty}</span>}
            </p>

            {doctor.qualification && (
              <p className="mt-1 text-xs text-ink/75">
                <span className="font-medium text-slate-500">Degree: </span>
                {doctor.qualification}
              </p>
            )}

            {doctor.experience && (
              <p className="mt-0.5 text-xs text-ink/75">
                <span className="font-medium text-slate-500">Experience: </span>
                {doctor.experience}
              </p>
            )}
          </div>
        </div>

        {/* Official Profile Button */}
        {profileUrl && (
          <div className="shrink-0 self-start sm:self-auto">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-clinical-600 bg-clinical-50 px-3 py-1.5 text-xs font-semibold text-clinical-700 transition hover:bg-clinical-600 hover:text-white"
            >
              <span>View Official Profile</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>

      {/* Hospital & Location */}
      <div className="mt-4 border-t border-clinical-100 pt-3 text-xs text-ink/70">
        <div className="grid gap-2 sm:grid-cols-2">
          {showHospital && (doctor.hospitalName || doctor.hospitalId?.name || doctor.hospitalAffiliation) && (
            <div>
              <span className="text-slate-500">Hospital: </span>
              <span className="font-semibold text-ink">
                {doctor.hospitalName || doctor.hospitalId?.name || doctor.hospitalAffiliation}
              </span>
            </div>
          )}

          {locationText && (
            <div>
              <span className="text-slate-500">Location: </span>
              <span>{locationText}</span>
            </div>
          )}
        </div>

        {/* Medical Registration Info */}
        <div className="mt-2.5 flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5 text-[11px] text-ink/65 border border-slate-100">
          <span className="font-medium text-slate-500">Medical Registration:</span>
          <span className="font-medium text-ink/80">
            {registrationAvailable
              ? `Available ${doctor.registrationNumber ? `(#${doctor.registrationNumber})` : ''} ${doctor.registrationCouncil ? `· ${doctor.registrationCouncil}` : ''}`
              : 'Not publicly available'}
          </span>
        </div>
      </div>
    </article>
  );
}
