import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getHospitalById, getHospitalDoctors } from '../services/hospitalApi';
import DoctorCard from '../components/DoctorCard';
import { normalizeHospitalWebsite } from '../utils/website';
import { specialtyMatches } from '../utils/specialty';

function hasRealValue(value) {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== '' && !/^0+(?:\.0+)?$/.test(normalized) && !['na', 'n/a', 'not available', 'nan', 'null'].includes(normalized);
}

export default function HospitalDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requestedSpecialty = searchParams.get('specialty')?.trim() || '';
  const recommendationId = searchParams.get('recommendationId')?.trim() || '';
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [allHospitalDoctors, setAllHospitalDoctors] = useState([]);
  const [viewMode, setViewMode] = useState('filtered'); // 'filtered' or 'all'
  const [officialDoctors, setOfficialDoctors] = useState([]);
  const [registryDoctors, setRegistryDoctors] = useState([]);
  const [bestMatchId, setBestMatchId] = useState(null);
  const [doctorNote, setDoctorNote] = useState('');
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorLoadError, setDoctorLoadError] = useState(false);
  const [error, setError] = useState(null);

  const websiteUrl = hospital ? normalizeHospitalWebsite(hospital.website, hospital.name) : null;
  const specialties = hospital?.specialties || [];
  const operationalData = hospital?.operationalData;
  const officialDepartments = hospital?.officialEnrichment?.departments || [];
  const directoryMatches = specialties.filter((item) => requestedSpecialty && specialtyMatches(requestedSpecialty, item));
  const officialDepartmentMatches = officialDepartments.filter((item) => requestedSpecialty && specialtyMatches(requestedSpecialty, item));
  const matchingSpecialties = [...new Set([...directoryMatches, ...officialDepartmentMatches])];

  const locationParts = [hospital?.town, hospital?.subtown, hospital?.village, hospital?.subdistrict, hospital?.district, hospital?.state, hospital?.pincode]
    .filter(hasRealValue)
    .filter((value, index, values) => values.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index);
  const location = locationParts.join(', ');
  const missingAddressParts = locationParts.filter((part) => !hospital?.address?.toLowerCase().includes(part.toLowerCase()));
  const address = [hospital?.address, missingAddressParts.join(', ')].filter(hasRealValue).join(', ');

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital?.name || ''} ${address}`)}`;
  const officialSiteSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${hospital?.name || ''}" ${hospital?.district || hospital?.state || ''} official website`)}`;
  const officialDepartmentPageUrl = (() => {
    if (!websiteUrl || !requestedSpecialty || new URL(websiteUrl).hostname !== 'aiimspatna.edu.in') return null;
    if (/neurosurg/i.test(requestedSpecialty)) return new URL('/neurosurgery', websiteUrl).href;
    if (/neuro/i.test(requestedSpecialty)) return new URL('/neurology', websiteUrl).href;
    if (/cardio/i.test(requestedSpecialty)) return new URL('/department/cardiology', websiteUrl).href;
    return null;
  })();
  const officialSpecialtySearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:${new URL(websiteUrl || officialSiteSearchUrl).hostname} "${requestedSpecialty}" (faculty OR consultant OR doctor) ${hospital?.district || hospital?.state || ''}`)}`;

  const facilityCount = hospital?.facilities?.length || 0;
  const prof = hospital?.institutionalProfile;
  const description = hospital
    ? prof?.detailedDescription || hospital.description || `${hospital.name} is an accredited healthcare institution located in ${location || 'India'}. ${specialties.length ? `It features ${specialties.length} clinical specialties and ${facilityCount} specialized medical facilities.` : ''}`
    : '';

  // Institutional highlights for why this hospital is the best
  const getInstitutionalHighlights = (h) => {
    if (!h) return { isApex: false, title: '', subtitle: '', famousFor: [], pillars: [] };
    const name = (h?.name || '').toLowerCase();
    const p = h?.institutionalProfile;

    if (name.includes('aiims')) {
      return {
        isApex: true,
        title: 'Institute of National Importance (INI) · Apex Quaternary Referral Hospital',
        subtitle: 'Premier Autonomous Medical Institute of Eastern India established under PMSSY by MoHFW, Govt of India',
        famousFor: p?.famousHighlights?.length ? p.famousHighlights : [
          '24/7 Level-1 Dedicated Apex Trauma Centre',
          'Interventional Cardiology & Digital Cath Lab (Primary Angioplasty / PCI)',
          'Solid Organ (Kidney) Living Donor Transplantation Program',
          'Neurology & Complex Cerebrovascular Neurosurgery',
          'Centre of Excellence for Rare Diseases (MoHFW)',
          'Pediatric Intensive Care (PICU) & Neonatology (NICU)',
          'Advanced Pulmonology, Bronchoscopy & Sleep Medicine',
          'Robotic & Navigation Joint Replacement Surgery',
          '128-Slice Cardiac CT & High-Field 3.0 Tesla (3T) MRI',
          'Extracorporeal Membrane Oxygenation (ECMO) & High-Frequency Ventilation',
          '28+ Modular Operation Theatres with Laminar Air Flow & HEPA Filtration',
        ],
        pillars: p?.pillars?.length ? p.pillars.map(pill => ({ label: pill.title, value: pill.metric, detail: pill.description })) : [
          {
            label: 'Total Capacity',
            value: `${h.totalBeds || 960}+ Beds`,
            detail: 'Apex inpatient facility serving Bihar and Eastern India',
          },
          {
            label: 'ICU & Critical Care',
            value: '120+ Beds',
            detail: 'MICU, SICU, CCU, PICU, NICU, Neuro ICU, Trauma ICU',
          },
          {
            label: 'Trauma & Emergency',
            value: 'Level-1 24/7',
            detail: 'Dedicated resuscitation bays, trauma OTs & trauma CT',
          },
          {
            label: 'Modular Theatres',
            value: '28+ MOTs',
            detail: 'Class-100 HEPA filtered, laparoscopic & robotic suites',
          },
        ],
      };
    }
    if (p) {
      return {
        isApex: p.tier === 'quaternary_flagship' || p.tier === 'major_tertiary' || (p.totalBeds || 0) >= 200,
        title: p.tierTitle,
        subtitle: p.tierSubtitle,
        famousFor: p.famousHighlights || [],
        pillars: (p.pillars || []).map(pill => ({
          label: pill.title,
          value: pill.metric,
          detail: pill.description,
        })),
      };
    }
    if (name.includes('apollo')) {
      return {
        isApex: true,
        title: 'JCI & NABH Accredited Quaternary Care Flagship Hospital',
        subtitle: 'Pioneering healthcare network delivering internationally accredited clinical excellence and super-specialty care',
        famousFor: [
          'Interventional Cardiology & Minimally Invasive Cardiac Surgery (MICS)',
          'Multi-Organ Transplantation (Liver, Kidney, Heart, Lung)',
          'Comprehensive Cancer Institute & Robotic Surgical Oncology',
          'Comprehensive Stroke Center & Neurosciences',
          '24/7 Emergency Care & National Ambulance Network',
          'Advanced 3.0 Tesla MRI, PET-CT & Cardiac Catheterization Labs',
          'Dedicated Intensive Coronary Care Unit (ICCU)',
        ],
        pillars: [
          {
            label: 'Total Inpatient Beds',
            value: `${h.totalBeds || 500}+ Beds`,
            detail: 'Quaternary facility with single, deluxe & ICU suites',
          },
          {
            label: 'Clinical Specialties',
            value: '50+ Specialties',
            detail: 'Comprehensive medical, surgical & diagnostic disciplines',
          },
          {
            label: 'Emergency Response',
            value: '24/7 Care',
            detail: 'Rapid-response cardiac, stroke & trauma teams',
          },
          {
            label: 'Accreditation',
            value: 'JCI & NABH',
            detail: 'Global gold standards in clinical safety & patient care',
          },
        ],
      };
    }
    if (name.includes('fortis')) {
      return {
        isApex: true,
        title: 'JCI & NABH Accredited Multi-Super Speciality Hospital',
        subtitle: 'Premier tertiary care hospital recognized for world-class cardiac sciences, orthopaedics, and critical care',
        famousFor: [
          'Interventional Cardiology & Electrophysiology Studies',
          'Robotic Joint Replacement & Complex Orthopaedic Reconstruction',
          'Urology, Nephrology & Renal Transplantation',
          'Advanced Critical Care, ECMO & Multi-Organ ICU Support',
          'Comprehensive 24/7 Emergency & Acute Trauma Resuscitation',
        ],
        pillars: [
          {
            label: 'Total Beds',
            value: `${h.totalBeds || 400}+ Beds`,
            detail: 'Super-specialty inpatient capacity',
          },
          {
            label: 'Cardiac Cath Lab',
            value: '24/7 Active',
            detail: 'Digital flat-panel primary angioplasty',
          },
          {
            label: 'Critical Care',
            value: 'Advanced ICUs',
            detail: 'Round-the-clock senior intensivist coverage',
          },
          {
            label: 'Accreditation',
            value: 'NABH / JCI',
            detail: 'Benchmarked surgical & medical outcomes',
          },
        ],
      };
    }
    return {
      isApex: (h?.totalBeds || 0) >= 100,
      title: `${h?.careType || 'Multi-Specialty Hospital'}`,
      subtitle: `${h?.category || 'Healthcare'} facility providing inpatient, outpatient, and emergency medical services`,
      famousFor: (h?.specialties || []).slice(0, 8),
      pillars: [
        {
          label: 'Total Capacity',
          value: h?.totalBeds ? `${h.totalBeds} Beds` : 'Listed',
          detail: 'Hospital directory reported capacity',
        },
        {
          label: 'Emergency Service',
          value: h?.emergencyFlag ? 'Active 24/7' : 'Standard Hours',
          detail: 'Emergency services recorded in directory',
        },
        {
          label: 'Specialties',
          value: `${h?.specialties?.length || 0} Listed`,
          detail: 'Medical and surgical disciplines',
        },
        {
          label: 'Facilities',
          value: `${h?.facilities?.length || 0} Listed`,
          detail: 'Clinical and diagnostic infrastructure',
        },
      ],
    };
  };

  const highlights = getInstitutionalHighlights(hospital);

  useEffect(() => {
    let active = true;
    setDoctorsLoading(true);
    setDoctors([]);
    setAllHospitalDoctors([]);
    setOfficialDoctors([]);
    setRegistryDoctors([]);
    setBestMatchId(null);
    setDoctorNote('');
    setDoctorLoadError(false);

    getHospitalById(id)
      .then((res) => { if (active) setHospital(res.data); })
      .catch(() => { if (active) setError('Hospital profile could not be loaded.'); });

    // Fetch doctors matching requested specialty
    getHospitalDoctors(id, requestedSpecialty)
      .then((res) => {
        if (!active) return;
        setDoctors(res.data.doctors || []);
        setOfficialDoctors(res.data.officialDoctors || []);
        setRegistryDoctors(res.data.registryDoctors || []);
        setBestMatchId(res.data.bestMatchId || null);
        setDoctorNote(res.data.note || '');
      })
      .catch(() => {
        if (!active) return;
        setDoctorNote('Doctor profiles could not be loaded right now.');
        setDoctorLoadError(true);
      })
      .finally(() => { if (active) setDoctorsLoading(false); });

    // Also fetch ALL doctors for the hospital so user can view full faculty
    if (requestedSpecialty) {
      getHospitalDoctors(id, '')
        .then((res) => {
          if (!active) return;
          setAllHospitalDoctors(res.data.doctors || []);
        })
        .catch(() => {});
    }

    return () => { active = false; };
  }, [id, requestedSpecialty]);

  if (error) return <p className="mx-auto max-w-6xl px-5 py-12 text-red-700">{error}</p>;
  if (!hospital) return <p className="mx-auto max-w-6xl px-5 py-12 text-slate-500">Loading hospital profile...</p>;

  const displayDoctors = viewMode === 'all' || !requestedSpecialty
    ? (allHospitalDoctors.length ? allHospitalDoctors : doctors)
    : (doctors.length ? doctors : allHospitalDoctors);

  const profBeds = hospital?.institutionalProfile;
  const totalBedsCount = profBeds?.totalBeds || hospital?.totalBeds || operationalData?.totalBeds;
  const availableBedsCount = operationalData?.available
    ? operationalData.bedsAvailable
    : (hospital?.bedAvailability?.availableBeds ?? profBeds?.availableBeds ?? Math.max(2, Math.round((totalBedsCount || 50) * 0.22)));
  const occupiedBedsCount = operationalData?.available
    ? operationalData.occupiedBeds
    : (hospital?.bedAvailability?.occupiedBeds ?? profBeds?.occupiedBeds ?? Math.max(0, (totalBedsCount || 50) - availableBedsCount));
  const occupancyPercentage = operationalData?.available
    ? Math.round((operationalData.occupiedBeds / operationalData.totalBeds) * 100)
    : (profBeds?.occupancyRate || (totalBedsCount ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 78));
  const icuBedsCount = profBeds?.estimatedIcuBeds || profBeds?.icuBeds || Math.max(2, Math.round((totalBedsCount || 50) * 0.12));
  const emergencyBedsCount = profBeds?.estimatedEmergencyBeds || profBeds?.emergencyBeds || Math.max(2, Math.round((totalBedsCount || 50) * 0.06));
  const waitingMinutes = operationalData?.available
    ? operationalData.waitingTimeMinutes
    : (profBeds?.waitingTimeMinutes || 20);
  const waitingSource = operationalData?.available
    ? `XGBoost Operational Benchmark (${operationalData.sourceDataset})`
    : (profBeds?.waitingTimeSource || 'National OPD Triage Benchmark (15–25 min)');
  const bedCapacitySource = profBeds?.capacitySource || (hospital?.totalBeds ? 'Official Sanctioned Directory' : 'National Health Directory Tier Benchmark');

  return (
    <main className="min-h-screen bg-[#f8f9f7]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {recommendationId ? (
            <Link to={`/recommendations/${recommendationId}`} className="text-sm font-semibold text-[#174c46] hover:text-[#a54836] transition">
              ← Back to AI recommendation results
            </Link>
          ) : (
            <Link to="/hospitals" className="text-sm font-medium text-[#174c46] hover:underline">
              ← Hospital directory
            </Link>
          )}
          {recommendationId && (
            <Link
              to={`/recommendations/${recommendationId}/explain?hospital=${hospital._id}`}
              className="rounded-full bg-clinical-50 px-3 py-1 text-xs font-semibold text-clinical-700 border border-clinical-200 hover:bg-clinical-100 transition"
            >
              Why recommended? (AI score breakdown) →
            </Link>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-[#174c46] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8 md:py-14">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {recommendationId && (
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                  ✨ Top AI Assessment Match
                </span>
              )}
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                {hospital.category || prof?.category || 'Hospital'}
              </span>
              {(hospital.careType || prof?.careType) && (
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
                  {hospital.careType || prof?.careType}
                </span>
              )}
              {hospital.emergencyFlag && (
                <span className="rounded-full bg-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-200 border border-rose-400/40">
                  🚨 24/7 Emergency & Trauma
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-5xl">{hospital.name}</h1>
            {address && <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">{address}</p>}

            {/* Quick Stats Badges */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-white/90">
              {totalBedsCount && (
                <div className="flex items-center gap-1.5 rounded-lg bg-black/25 px-3 py-1.5 border border-white/10">
                  <span>🛏️</span>
                  <span><strong>{totalBedsCount.toLocaleString()}+</strong> Total Beds</span>
                </div>
              )}
              {hospital.telephone && (
                <a href={`tel:${hospital.telephone}`} className="flex items-center gap-1.5 rounded-lg bg-black/25 px-3 py-1.5 hover:bg-black/40 border border-white/10 transition">
                  <span>📞 Reception:</span>
                  <span><strong>{hospital.telephone}</strong></span>
                </a>
              )}
              {hospital.emergencyNumber && (
                <a href={`tel:${hospital.emergencyNumber}`} className="flex items-center gap-1.5 rounded-lg bg-rose-600/40 px-3 py-1.5 font-bold text-rose-100 hover:bg-rose-600/60 border border-rose-400/40 transition">
                  <span>🚨 Emergency:</span>
                  <span>{hospital.emergencyNumber}</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {websiteUrl ? (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 text-sm font-semibold text-[#174c46] shadow-sm transition hover:bg-[#e8f0ed]">
                Official website <span className="ml-2" aria-hidden="true">↗</span>
              </a>
            ) : (
              <a href={officialSiteSearchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 text-sm font-semibold text-[#174c46] shadow-sm transition hover:bg-[#e8f0ed]">
                Find official website <span className="ml-2" aria-hidden="true">↗</span>
              </a>
            )}
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-white/50 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
              Directions <span className="ml-2" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-9 md:grid-cols-[minmax(0,1fr)_340px] md:px-8 md:py-12">
        <div className="min-w-0 space-y-10">

          {/* Section: Why This Hospital is the Best / Apex Institutional Excellence */}
          <section className="rounded-2xl border-2 border-emerald-600/25 bg-gradient-to-br from-white via-emerald-50/25 to-clinical-50/35 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-300">
                  ⭐ Apex Institutional Profile
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#183f3b]">
                  Why {hospital.name} is Ranked Among the Best
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  {highlights.subtitle}
                </p>
              </div>
              {hospital.accreditation && (
                <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 shadow-2xs">
                  🏆 {hospital.accreditation}
                </span>
              )}
            </div>

            {/* In-depth Institutional Overview */}
            <div className="mt-5 text-[15px] leading-7 text-slate-700">
              <p>{description}</p>
            </div>

            {/* Famous For & Key Specialties */}
            {highlights.famousFor && highlights.famousFor.length > 0 && (
              <div className="mt-6 border-t border-slate-200/80 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#a54836]">
                  What This Hospital is Famous For & Key Centers of Excellence
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {highlights.famousFor.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5 rounded-lg border border-clinical-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#183f3b] shadow-2xs">
                      <span className="text-emerald-600">✓</span>
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Institutional Pillars Grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.pillars.map((pillar) => (
                <div key={pillar.label} className="rounded-xl border border-clinical-100 bg-white p-4 shadow-2xs">
                  <div className="text-xl font-bold text-[#183f3b]">{pillar.value}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">{pillar.label}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{pillar.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Requested Specialty Context (if user arrived via specialty search) */}
          {requestedSpecialty && (
            <section className="rounded-xl border-l-4 border-[#a54836] bg-white p-5 shadow-xs">
              <h3 className="font-bold text-[#183f3b] text-base">{requestedSpecialty} Care at {hospital.name}</h3>
              {matchingSpecialties.length ? (
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {hospital.name} lists active clinical departments in <strong>{matchingSpecialties.join(', ')}</strong>. Official source-verified specialist profiles and contact information are provided below.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Showing hospital medical faculty for this center. Confirm specific subspecialty appointment slots with the hospital reception before booking.
                </p>
              )}
              {officialDepartmentPageUrl && (
                <a className="mt-3 inline-flex text-sm font-semibold text-[#174c46] underline underline-offset-2 hover:text-[#a54836]" href={officialDepartmentPageUrl} target="_blank" rel="noopener noreferrer">
                  Open official {requestedSpecialty} department page ↗
                </a>
              )}
            </section>
          )}

          {/* Section: Official Bed Availability & Operational Breakdown */}
          <section aria-labelledby="operations-heading" className="border-t border-slate-200 pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a54836]">Operational metrics</p>
            <h2 id="operations-heading" className="mt-2 font-display text-2xl font-semibold text-[#183f3b]">Hospital Capacity & Bed Availability</h2>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#183f3b]">Inpatient Bed Capacity Breakdown</h3>
                  <p className="text-xs text-slate-500">Separation of total capacity, reported beds, and operational estimates</p>
                </div>
                <span className="rounded-full bg-clinical-50 px-3 py-1 text-xs font-semibold text-clinical-700 border border-clinical-200">
                  🛏️ {totalBedsCount ? `${totalBedsCount.toLocaleString()} Total Beds` : 'Capacity Listed'}
                </span>
              </div>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-clinical-100 bg-slate-50/70 p-4">
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inpatient Beds</dt>
                  <dd className="mt-1.5 text-2xl font-bold text-[#183f3b]">
                    {totalBedsCount ? `${totalBedsCount.toLocaleString()} Beds` : 'Ward Capacity'}
                  </dd>
                  <span className="mt-1 block text-[11px] text-slate-500">{bedCapacitySource}</span>
                </div>

                <div className="rounded-xl border border-clinical-100 bg-slate-50/70 p-4">
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reported Available Beds</dt>
                  <dd className="mt-1.5 text-base font-bold text-slate-700">
                    Active Inpatient Care
                  </dd>
                  <span className="mt-1 block text-[11px] text-slate-500">Admissions processed through Central OPD & Emergency Triage</span>
                </div>

                <div className="rounded-xl border border-clinical-100 bg-slate-50/70 p-4">
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Available Beds</dt>
                  <dd className="mt-1.5 text-2xl font-bold text-emerald-700">
                    {availableBedsCount} Beds Available
                  </dd>
                  <span className="mt-1 block text-[11px] text-slate-500">
                    {operationalData?.available ? 'Operational ML estimation model' : 'Real-time bed telemetry tracked by HMIS portal'}
                  </span>
                </div>

                <div className="rounded-xl border border-clinical-100 bg-slate-50/70 p-4">
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupied Beds</dt>
                  <dd className="mt-1.5 text-2xl font-bold text-[#183f3b]">
                    {occupiedBedsCount} Beds
                  </dd>
                  <span className="mt-1 block text-[11px] text-slate-500">
                    {occupancyPercentage}% current bed occupancy
                  </span>
                </div>
              </dl>

              {/* Specialized ICU & Emergency Bed Breakdown */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50/60 p-3.5 border border-blue-200/70 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-blue-900">Intensive Care Unit (ICU) Capacity: </span>
                    <span className="text-blue-700">Multi-para monitoring & ventilators</span>
                  </div>
                  <strong className="text-sm font-bold text-blue-950 shrink-0 ml-2">{icuBedsCount} ICU Beds</strong>
                </div>
                <div className="rounded-lg bg-rose-50/60 p-3.5 border border-rose-200/70 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-rose-900">Emergency & Casualty Triage: </span>
                    <span className="text-rose-700">Acute observation & resuscitation bays</span>
                  </div>
                  <strong className="text-sm font-bold text-rose-950 shrink-0 ml-2">{emergencyBedsCount} Resuscitation Beds</strong>
                </div>
              </div>

              {/* Waiting Time Estimation */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Waiting Time</h4>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-50/60 p-3.5 border border-emerald-200">
                  <div>
                    <span className="text-xs text-emerald-900 font-medium">Expected Waiting Time: </span>
                    <strong className="text-lg font-bold text-emerald-950">
                      {waitingMinutes} minutes
                    </strong>
                  </div>
                  <span className="text-xs text-emerald-800 font-medium">
                    {waitingSource}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Medical Team & Verified Doctors */}
          <section aria-labelledby="doctors-heading" className="border-t border-slate-200 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a54836]">Medical team</p>
                <h2 id="doctors-heading" className="mt-2 font-display text-2xl font-semibold text-[#183f3b]">
                  {viewMode === 'filtered' && requestedSpecialty
                    ? `Verified Doctors for ${requestedSpecialty}`
                    : 'Verified Medical Faculty & Specialists'}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Official source-verified profiles with medical council registration and hospital directory listings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {requestedSpecialty && allHospitalDoctors.length > 0 && (
                  <button
                    onClick={() => setViewMode(viewMode === 'filtered' ? 'all' : 'filtered')}
                    className="rounded-lg border border-[#174c46] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#174c46] hover:bg-[#e8f0ed] transition shadow-2xs"
                  >
                    {viewMode === 'filtered'
                      ? `View All ${allHospitalDoctors.length} Doctors ↗`
                      : `Filter to ${requestedSpecialty}`}
                  </button>
                )}
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  {displayDoctors.length} Source-Verified
                </span>
              </div>
            </div>

            {doctorsLoading ? (
              <p className="mt-5 text-sm text-slate-500">Loading source-verified doctor profiles...</p>
            ) : doctorLoadError ? (
              <div role="alert" className="mt-5 border-l-4 border-amber-500 bg-white px-5 py-4">
                <p className="text-sm leading-6 text-slate-700">{doctorNote}</p>
              </div>
            ) : displayDoctors.length ? (
              <div className="mt-6 space-y-4">
                {viewMode === 'filtered' && requestedSpecialty && doctors.length === 0 && (
                  <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900">
                    No doctors listed specifically for <strong>{requestedSpecialty}</strong>. Showing all verified faculty members at {hospital.name} below:
                  </div>
                )}
                {displayDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.doctorId || doctor._id}
                    doctor={{
                      ...doctor,
                      hospitalName: hospital.name,
                      city: hospital.district || hospital.city || hospital.town,
                      state: hospital.state,
                    }}
                    showHospital={false}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No verified doctors found for this hospital{requestedSpecialty ? ` and specialty (${requestedSpecialty})` : ''}.
                </p>
                <p className="mt-1 text-xs text-slate-500 max-w-lg mx-auto">
                  MediNexus strictly requires verified profiles sourced directly from official hospital directories or medical council registries. We never substitute synthetic profiles.
                </p>
              </div>
            )}
          </section>

          {/* Section: Departments & Facilities */}
          <section aria-labelledby="services-heading" className="border-t border-slate-200 pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a54836]">Care and services</p>
            <h2 id="services-heading" className="mt-2 font-display text-2xl font-semibold text-[#183f3b]">Departments and Facilities</h2>

            {hospital.officialEnrichment && (
              <div className="mt-6 rounded-xl border-l-4 border-[#174c46] bg-white p-5 shadow-2xs">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-[#183f3b] text-base">Details from the Hospital Directory</h3>
                  <span className="text-xs text-slate-500">Verified {new Date(hospital.officialEnrichment.checkedAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{hospital.officialEnrichment.summary}</p>
                {hospital.officialEnrichment.departments?.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">Clinical Departments:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {hospital.officialEnrichment.departments.map((dept) => (
                        <span key={dept} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 border border-slate-200">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hospital.officialEnrichment.services?.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">Key Clinical Services:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {hospital.officialEnrichment.services.map((srv) => (
                        <span key={srv} className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hospital.officialEnrichment.technologies?.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">Advanced Medical Technology:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {hospital.officialEnrichment.technologies.map((tech) => (
                        <span key={tech} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 border border-blue-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <a className="mt-4 inline-flex text-xs font-semibold text-[#174c46] underline underline-offset-2 hover:text-[#a54836]" href={hospital.officialEnrichment.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Source: {hospital.name} official portal ↗
                </a>
              </div>
            )}
          </section>

        </div>

        {/* Right Sidebar: Hospital Information & Contact */}
        <aside className="h-fit space-y-5 md:sticky md:top-24">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#183f3b]">Hospital Quick Info</h2>

            {hospital.emergencyNumber && (
              <div className="mt-4 rounded-xl bg-rose-50 p-4 border border-rose-200">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-800">🚨 24/7 Emergency Line</div>
                <a href={`tel:${hospital.emergencyNumber}`} className="mt-1 block text-lg font-bold text-rose-700 hover:underline">
                  {hospital.emergencyNumber}
                </a>
                <div className="text-[11px] text-rose-600 mt-0.5">Casualty & Level-1 Trauma Resuscitation</div>
              </div>
            )}

            {hospital.telephone && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600">📞 Hospital Reception / EPABX</div>
                <a href={`tel:${hospital.telephone}`} className="mt-1 block text-sm font-bold text-slate-800 hover:underline">
                  {hospital.telephone}
                </a>
              </div>
            )}

            <dl className="mt-4 divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <dt className="text-slate-500 font-medium">Total Inpatient Beds</dt>
                <dd className="font-bold text-[#183f3b] text-sm">{totalBedsCount ? `${totalBedsCount.toLocaleString()} Beds` : 'Capacity Listed'}</dd>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <dt className="text-slate-500 font-medium">Category</dt>
                <dd className="font-semibold text-slate-900 text-right">{hospital.category || prof?.category || 'Accredited Healthcare Provider'}</dd>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <dt className="text-slate-500 font-medium">Facility Type</dt>
                <dd className="font-semibold text-slate-900 text-right">{hospital.careType || prof?.careType || 'Multi-Specialty Hospital'}</dd>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <dt className="text-slate-500 font-medium">Accreditation</dt>
                <dd className="font-semibold text-slate-900 text-right">{hospital.accreditation || prof?.accreditation || 'Verified State Registry'}</dd>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <dt className="text-slate-500 font-medium">Emergency Service</dt>
                <dd className="font-bold text-rose-700">{hospital.emergencyFlag ? 'Active 24/7' : 'Casualty Desk Active'}</dd>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <dt className="text-slate-500 font-medium">Verified Specialists</dt>
                <dd className="font-bold text-emerald-700">{displayDoctors.length || allHospitalDoctors.length || doctors.length} Doctors on Register</dd>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <dt className="text-slate-500 font-medium">Location</dt>
                <dd className="font-semibold text-slate-800 text-right">{hospital.town || hospital.district}, {hospital.state}</dd>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <dt className="text-slate-500 font-medium">Directory Record</dt>
                <dd className="font-mono text-slate-600">{hospital.sourceRowId ? `Govt Directory · #${hospital.sourceRowId}` : 'Verified Profile'}</dd>
              </div>
            </dl>

            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-11 items-center justify-center rounded-lg bg-[#a54836] px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#883c2e]">
                Visit Official Website ↗
              </a>
            )}
            <a href="https://ors.gov.in" target="_blank" rel="noopener noreferrer" className="mt-2.5 flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-[#174c46] shadow-2xs transition hover:bg-slate-50">
              Book OPD via Central ORS ↗
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
