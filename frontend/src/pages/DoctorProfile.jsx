import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDoctorById } from '../services/doctorApi';

const NOT_AVAILABLE = 'Not available from public source';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDoctorById(id)
      .then((result) => { if (active) setDoctor(result.data); })
      .catch(() => { if (active) setError('Doctor record could not be loaded.'); });
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="mx-auto max-w-4xl px-5 py-12 text-urgent-500">{error}</main>;
  if (!doctor) return <main className="mx-auto max-w-4xl px-5 py-12 text-ink/60">Loading doctor profile...</main>;

  const hospitalName = doctor.hospitalName || doctor.hospitalId?.name || null;
  const hospitalId = doctor.hospitalId?._id || (typeof doctor.hospitalId === 'string' ? doctor.hospitalId : null);
  const location = [doctor.city || doctor.hospitalId?.town || doctor.hospitalId?.district, doctor.state || doctor.hospitalId?.state].filter(Boolean).join(', ');
  const profileUrl = doctor.officialDoctorProfileUrl || doctor.hospitalAssociationSourceUrl || doctor.sourceUrl || doctor.profileUrl;
  const isVerified = doctor.verificationStatus === 'Verified' || doctor.verificationStatus === 'VERIFIED';
  const registrationAvailable = Boolean(doctor.registrationNumber || doctor.nmrId);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm font-semibold text-clinical-600 hover:text-clinical-700">
        ← Back to doctor directory
      </Link>

      <div className="mt-6 rounded-2xl border border-clinical-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {doctor.photoUrl ? (
              <img
                src={doctor.photoUrl}
                alt={doctor.name}
                className="h-20 w-20 shrink-0 rounded-full border-2 border-clinical-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-clinical-50 text-2xl font-bold text-clinical-700 border-2 border-clinical-200">
                {doctor.name ? doctor.name.replace(/^Dr\.?\s*/i, '').charAt(0) : 'D'}
              </div>
            )}

            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <span>✓ {isVerified ? 'VERIFIED DOCTOR' : 'PARTIALLY VERIFIED'}</span>
              </div>

              <h1 className="text-2xl font-bold text-ink sm:text-3xl">{doctor.name}</h1>
              <p className="mt-1 text-base font-semibold text-clinical-600">
                {doctor.specialization || 'Medical Specialist'}
                {doctor.subSpecialty && <span className="text-ink/60 font-normal"> · {doctor.subSpecialty}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:flex-col sm:items-end">
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-clinical-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-clinical-700"
              >
                <span>View Official Profile</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}
            {hospitalId && (
              <Link
                to={`/hospitals/${hospitalId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-clinical-200 bg-clinical-50 px-4 py-2 text-xs font-semibold text-clinical-700 transition hover:bg-clinical-100"
              >
                <span>View Hospital Details</span>
              </Link>
            )}
          </div>
        </div>

        {/* Verification Summary Banner */}
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-emerald-950">
          <p className="font-semibold">Level 1 Source-Verified Profile</p>
          <p className="mt-0.5 text-emerald-800">
            This doctor is confirmed associated with {hospitalName || 'the hospital'} via official hospital directory records. Medical registration is tracked where publicly reported.
          </p>
        </div>

        {/* Attributes List */}
        <dl className="mt-6 divide-y divide-clinical-100 border-t border-clinical-100 text-sm">
          <div className="grid gap-1 py-3.5 sm:grid-cols-[220px_1fr]">
            <dt className="text-ink/55 font-medium">Qualification</dt>
            <dd className="font-semibold text-ink">{doctor.qualification || NOT_AVAILABLE}</dd>
          </div>

          <div className="grid gap-1 py-3.5 sm:grid-cols-[220px_1fr]">
            <dt className="text-ink/55 font-medium">Experience</dt>
            <dd className="font-semibold text-ink">{doctor.experience || NOT_AVAILABLE}</dd>
          </div>

          <div className="grid gap-1 py-3.5 sm:grid-cols-[220px_1fr]">
            <dt className="text-ink/55 font-medium">Hospital Affiliation</dt>
            <dd className="font-semibold text-ink">
              {hospitalId ? (
                <Link className="text-clinical-600 underline hover:text-clinical-800" to={`/hospitals/${hospitalId}`}>
                  {hospitalName || 'View Hospital'}
                </Link>
              ) : (
                hospitalName || NOT_AVAILABLE
              )}
            </dd>
          </div>

          <div className="grid gap-1 py-3.5 sm:grid-cols-[220px_1fr]">
            <dt className="text-ink/55 font-medium">Location</dt>
            <dd className="font-medium text-ink">{location || NOT_AVAILABLE}</dd>
          </div>

          <div className="grid gap-1 py-3.5 sm:grid-cols-[220px_1fr]">
            <dt className="text-ink/55 font-medium">Medical Registration</dt>
            <dd className="font-medium text-ink">
              {registrationAvailable
                ? `${doctor.registrationNumber ? `Reg #${doctor.registrationNumber}` : ''} ${doctor.stateMedicalCouncil || doctor.registrationCouncil ? `(${doctor.stateMedicalCouncil || doctor.registrationCouncil})` : ''} ${doctor.registrationYear ? `· Year: ${doctor.registrationYear}` : ''}`
                : 'Not publicly available'}
            </dd>
          </div>

          <div className="grid gap-1 py-3.5 sm:grid-cols-[220px_1fr]">
            <dt className="text-ink/55 font-medium">Official Source Directory</dt>
            <dd className="font-medium text-ink">
              {profileUrl ? (
                <a className="text-clinical-600 underline" href={profileUrl} target="_blank" rel="noreferrer">
                  {doctor.source || doctor.sourceName || 'Official Hospital Profile'} ↗
                </a>
              ) : (
                NOT_AVAILABLE
              )}
            </dd>
          </div>

          {doctor.lastVerifiedAt && (
            <div className="grid gap-1 py-3.5 sm:grid-cols-[220px_1fr]">
              <dt className="text-ink/55 font-medium">Last Verified</dt>
              <dd className="text-xs text-ink/70">{new Date(doctor.lastVerifiedAt).toLocaleString()}</dd>
            </div>
          )}
        </dl>
      </div>
    </main>
  );
}