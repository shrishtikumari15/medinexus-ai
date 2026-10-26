import AdminModulePage from '../../components/AdminModulePage';
import React, { useEffect, useState } from 'react';
import { createRegistryDoctor, listAdminDoctors, listAdminHospitals, updateRegistryDoctor } from '../../services/adminApi';

const related = [
  { to: '/admin/hospitals', label: 'Hospital directory' },
  { to: '/admin/analytics', label: 'Operational analytics' },
  { to: '/admin', label: 'Admin overview' },
];

export default function DoctorVerification() {
  const emptyForm = { name: '', nmrId: '', registrationNumber: '', registrationYear: '', stateMedicalCouncil: '', qualification: '', qualificationSourceUrl: '', specialization: '', specializationSourceUrl: '', experience: '', experienceSourceUrl: '', hospitalId: '', hospitalAssociationSourceUrl: '', sourceUrl: 'https://nmr.nmc.org.in/search-doctor', lastVerifiedAt: '' };
  const [form, setForm] = useState(emptyForm);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    try {
      const [doctorResult, hospitalResult] = await Promise.all([listAdminDoctors(), listAdminHospitals({ limit: 100 })]);
      setDoctors(doctorResult.data || []);
      setHospitals(hospitalResult.data || []);
    } catch { setError('Doctor or hospital records could not be loaded.'); }
  }

  useEffect(() => { refresh(); }, []);

  function selectDoctor(doctor) {
    setSelectedId(doctor._id);
    setForm({ ...emptyForm, ...doctor, hospitalId: doctor.hospitalId?._id || doctor.hospitalId || '', registrationYear: doctor.registrationYear || '', lastVerifiedAt: doctor.lastVerifiedAt ? new Date(doctor.lastVerifiedAt).toISOString().slice(0, 10) : '' });
  }

  async function submit(event) {
    event.preventDefault(); setError(''); setNotice('');
    const payload = { ...form, registrationYear: form.registrationYear ? Number(form.registrationYear) : undefined, lastVerifiedAt: form.lastVerifiedAt || undefined, hospitalId: form.hospitalId || null };
    try {
      if (selectedId) await updateRegistryDoctor(selectedId, payload);
      else await createRegistryDoctor(payload);
      setNotice(selectedId ? 'NMR reference updated.' : 'NMR reference added.');
      setSelectedId(''); setForm(emptyForm); await refresh();
    } catch (requestError) { setError(requestError.response?.data?.error || 'Could not save doctor reference.'); }
  }

  const fields = [
    ['name', 'Doctor name', true], ['nmrId', 'NMR ID'], ['registrationNumber', 'SMC registration number', true],
    ['registrationYear', 'Registration year', false, 'number'], ['stateMedicalCouncil', 'State Medical Council', true],
    ['qualification', 'Qualification'], ['qualificationSourceUrl', 'Qualification source URL'],
    ['specialization', 'Specialization'], ['specializationSourceUrl', 'Specialty source URL'],
    ['experience', 'Experience'], ['experienceSourceUrl', 'Experience source URL'], ['sourceUrl', 'NMR record/reference URL', true],
    ['hospitalAssociationSourceUrl', 'Hospital association source URL'], ['lastVerifiedAt', 'Last checked date', false, 'date'],
  ];

  return (
    <main className="panel-shell">
      <header className="panel-header"><div><p className="panel-eyebrow">Administration / People</p><h1 className="panel-title">Doctor reference records</h1><p className="panel-subtitle">NMR registration is a public reference only. MediNexus does not independently verify these records. Specialty, qualification, experience, and hospital links require their own source URLs.</p></div></header>
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-t border-clinical-100 pt-4"><h2 className="font-semibold text-clinical-700">Sourced records</h2><div className="mt-3 max-h-[70vh] divide-y divide-clinical-50 overflow-y-auto">{doctors.map((doctor) => <button key={doctor._id} onClick={() => selectDoctor(doctor)} className={`block w-full px-2 py-3 text-left text-sm ${selectedId === doctor._id ? 'bg-clinical-50 text-clinical-700' : 'text-ink/70 hover:bg-slate-50'}`}>{doctor.name}<span className="block text-xs text-ink/50">{doctor.registrationNumber} · {doctor.stateMedicalCouncil}</span></button>)}</div></aside>
        <form onSubmit={submit} className="grid gap-3 border-t border-clinical-100 pt-4 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 sm:col-span-2"><h2 className="font-semibold text-clinical-700">{selectedId ? 'Update doctor reference' : 'Add permitted doctor record'}</h2>{selectedId && <button type="button" className="text-sm text-clinical-600 underline" onClick={() => { setSelectedId(''); setForm(emptyForm); }}>New record</button>}</div>
          {fields.map(([key, label, required, type]) => <label key={key} className="grid gap-1 text-xs font-semibold text-ink/60">{label}{required && <span className="sr-only"> required</span>}<input type={type || 'text'} required={Boolean(required && !selectedId)} maxLength={key.toLowerCase().includes('url') ? 500 : 160} value={form[key] || ''} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="min-h-10 rounded border border-clinical-100 bg-white px-3 text-sm font-normal text-ink" /></label>)}
          <label className="grid gap-1 text-xs font-semibold text-ink/60 sm:col-span-2">Hospital association<select value={form.hospitalId || ''} onChange={(event) => setForm((current) => ({ ...current, hospitalId: event.target.value }))} className="min-h-10 rounded border border-clinical-100 bg-white px-3 text-sm font-normal"><option value="">No sourced association</option>{hospitals.map((hospital) => <option key={hospital._id} value={hospital._id}>{hospital.name} · {hospital.state}</option>)}</select><span className="font-normal">A separate hospitalAssociationSourceUrl is required to save a link.</span></label>
          <div className="sm:col-span-2"><p className="text-xs text-ink/55">Registration reference source: <a className="underline" href="https://nmr.nmc.org.in/search-doctor" target="_blank" rel="noreferrer">NMC National Medical Register</a></p></div>
          {error && <p role="alert" className="text-sm text-urgent-500 sm:col-span-2">{error}</p>}{notice && <p role="status" className="text-sm text-stable-500 sm:col-span-2">{notice}</p>}
          <button className="primary-btn sm:col-span-2" type="submit">{selectedId ? 'Save reference changes' : 'Add doctor reference'}</button>
        </form>
      </div>
    </main>
  );
}
