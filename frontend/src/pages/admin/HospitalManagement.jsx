import AdminModulePage from '../../components/AdminModulePage';
import React, { useEffect, useState } from 'react';
import { createAdminHospital, listAdminHospitals, updateAdminHospital } from '../../services/adminApi';

const related = [
  { to: '/admin/doctors', label: 'Doctor verification' },
  { to: '/admin/analytics', label: 'Operational analytics' },
  { to: '/admin', label: 'Admin overview' },
];

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ name: '', state: '', district: '', address: '', description: '', specialties: '', facilities: '', totalBeds: '', availableBeds: '', occupiedBeds: '', bedDataSource: 'unknown', bedDataSourceName: '', bedDataSourceUrl: '', sourceName: '', sourceUrl: '', telephone: '', website: '', emergencyFlag: false, operationalHospitalId: '' });
  const [operationalHospitalId, setOperationalHospitalId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    try { setHospitals((await listAdminHospitals({ limit: 100 })).data || []); }
    catch { setError('Hospital records could not be loaded.'); }
  }

  useEffect(() => { refresh(); }, []);

  function selectHospital(hospital) {
    setSelectedId(hospital._id);
    setForm({
      name: hospital.name || '', state: hospital.state || '', district: hospital.district || '', address: hospital.address || '',
      description: hospital.description || '', specialties: (hospital.specialties || []).join(', '), facilities: (hospital.facilities || []).join(', '),
      totalBeds: hospital.totalBeds ?? '', availableBeds: hospital.availableBeds ?? '', occupiedBeds: hospital.occupiedBeds ?? '',
      bedDataSource: hospital.bedDataSource || 'unknown', bedDataSourceName: hospital.bedDataSourceName || '', bedDataSourceUrl: hospital.bedDataSourceUrl || '',
      sourceName: hospital.sourceName || '', sourceUrl: hospital.sourceUrl || '', telephone: hospital.telephone || '', website: hospital.website || '',
      emergencyFlag: Boolean(hospital.emergencyFlag), operationalHospitalId: hospital.operationalHospitalId || '',
    });
    setOperationalHospitalId(hospital.operationalHospitalId || '');
  }

  async function submit(event) {
    event.preventDefault();
    setError(''); setNotice('');
    const payload = { ...form, specialties: form.specialties.split(',').map((item) => item.trim()).filter(Boolean), facilities: form.facilities.split(',').map((item) => item.trim()).filter(Boolean) };
    for (const field of ['totalBeds', 'availableBeds', 'occupiedBeds']) payload[field] = payload[field] === '' ? null : Number(payload[field]);
    payload.operationalHospitalId = operationalHospitalId || null;
    delete payload.operationalSnapshot;
    try {
      if (selectedId) await updateAdminHospital(selectedId, payload);
      else await createAdminHospital(payload);
      setNotice(selectedId ? 'Hospital record updated.' : 'Hospital record created.');
      setSelectedId('');
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not save hospital record.');
    }
  }

  const textField = (key, label, props = {}) => <label key={key} className="grid gap-1 text-xs font-semibold text-ink/60">{label}<input {...props} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="min-h-10 rounded border border-clinical-100 bg-white px-3 text-sm font-normal text-ink" /></label>;
  return (
    <main className="panel-shell">
      <header className="panel-header"><div><p className="panel-eyebrow">Administration / Network</p><h1 className="panel-title">Hospital management</h1><p className="panel-subtitle">Manage sourced hospital profiles and explicitly labeled operational snapshots.</p></div></header>
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-t border-clinical-100 pt-4"><h2 className="font-semibold text-clinical-700">Hospital records</h2><div className="mt-3 max-h-[70vh] divide-y divide-clinical-50 overflow-y-auto">{hospitals.map((hospital) => <button key={hospital._id} onClick={() => selectHospital(hospital)} className={`block w-full px-2 py-3 text-left text-sm ${selectedId === hospital._id ? 'bg-clinical-50 text-clinical-700' : 'text-ink/70 hover:bg-slate-50'}`}>{hospital.name}<span className="block text-xs text-ink/50">{hospital.district ? `${hospital.district}, ` : ''}{hospital.state}</span></button>)}</div></aside>
        <form onSubmit={submit} className="space-y-6 border-t border-clinical-100 pt-4">
          <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-clinical-700">{selectedId ? 'Edit hospital' : 'Add hospital'}</h2>{selectedId && <button type="button" className="text-sm text-clinical-600 underline" onClick={() => { setSelectedId(''); setOperationalHospitalId(''); setForm((current) => ({ ...current, name: '', state: '', address: '', sourceName: '', sourceUrl: '', operationalHospitalId: '' })); }}>New record</button>}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {textField('name', 'Hospital name', { required: true, maxLength: 180 })}{textField('state', 'State', { required: true, maxLength: 80 })}
            {textField('district', 'City / district', { maxLength: 80 })}{textField('telephone', 'Contact telephone', { maxLength: 40 })}
            {textField('website', 'Website (HTTPS)', { type: 'url' })}{textField('sourceName', 'Hospital source name', { required: !selectedId })}
            {textField('sourceUrl', 'Hospital source URL (HTTPS)', { type: 'url', required: !selectedId })}
            {textField('totalBeds', 'Total beds', { type: 'number', min: 0, step: 1 })}{textField('availableBeds', 'Available beds', { type: 'number', min: 0, step: 1 })}
            {textField('occupiedBeds', 'Occupied beds', { type: 'number', min: 0, step: 1 })}{textField('bedDataSourceName', 'Bed-count source name')}
            {textField('bedDataSourceUrl', 'Bed-count source URL (HTTPS)', { type: 'url' })}
            <label className="grid gap-1 text-xs font-semibold text-ink/60">Bed data status<select value={form.bedDataSource} onChange={(event) => setForm((current) => ({ ...current, bedDataSource: event.target.value }))} className="min-h-10 rounded border border-clinical-100 bg-white px-3 text-sm font-normal text-ink"><option value="unknown">Unknown</option><option value="reported">Reported snapshot</option><option value="simulated">Simulated/demo</option></select></label>
            <label className="flex items-center gap-2 text-sm text-ink/70"><input type="checkbox" checked={form.emergencyFlag} onChange={(event) => setForm((current) => ({ ...current, emergencyFlag: event.target.checked, emergencyFlagSource: 'raw' }))} />Emergency service is explicitly listed by source</label>
            <label className="grid gap-1 text-xs font-semibold text-ink/60 sm:col-span-2">Address<textarea value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="rounded border border-clinical-100 bg-white px-3 py-2 text-sm font-normal text-ink" rows="2" /></label>
            {textField('description', 'Description', { maxLength: 1000 })}{textField('specialties', 'Specialties (comma-separated)')}{textField('facilities', 'Facilities (comma-separated)')}
          </div>
          <fieldset className="border-t border-clinical-100 pt-4">
            <legend className="font-semibold text-clinical-700">Operational dataset mapping</legend>
            <p className="my-2 text-xs leading-5 text-ink/55">
              Link an H001–H005 dataset ID only when its identity is verified against this hospital record. Values are then selected from the operational CSV; this form does not accept manually entered operational metrics.
            </p>
            <label className="grid max-w-md gap-1 text-xs font-semibold text-ink/60">
              Verified operational hospital ID
              <select value={operationalHospitalId} onChange={(event) => setOperationalHospitalId(event.target.value)} className="min-h-10 rounded border border-clinical-100 bg-white px-3 text-sm font-normal">
                <option value="">No operational mapping</option>
                {['H001', 'H002', 'H003', 'H004', 'H005'].map((id) => <option key={id} value={id}>{id}</option>)}
              </select>
            </label>
          </fieldset>
          {error && <p role="alert" className="text-sm text-urgent-500">{error}</p>}{notice && <p role="status" className="text-sm text-stable-500">{notice}</p>}
          <button className="primary-btn" type="submit">{selectedId ? 'Save hospital changes' : 'Add hospital'}</button>
        </form>
      </div>
    </main>
  );
}
