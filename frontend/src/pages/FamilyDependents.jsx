import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createDependent,
  deleteDependent,
  getDependents,
  getDependentAssessments,
  updateDependent,
} from '../services/dependentApi';

const EMPTY_FORM = { name: '', relationship: '', dateOfBirth: '', gender: '' };
const RELATIONSHIPS = ['Son', 'Daughter', 'Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Grandparent', 'Other'];

function ageFromDob(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

export default function FamilyDependents() {
  const [dependents, setDependents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadDependents() {
    setLoading(true);
    try {
      const response = await getDependents();
      setDependents(response.data);
      setError('');
    } catch {
      setError('Could not load family members. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDependents();
  }, []);

  function startEdit(dependent) {
    setEditingId(dependent._id);
    setForm({
      name: dependent.name,
      relationship: dependent.relationship,
      dateOfBirth: new Date(dependent.dateOfBirth).toISOString().slice(0, 10),
      gender: dependent.gender || '',
    });
    setError('');
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) await updateDependent(editingId, form);
      else await createDependent(form);
      resetForm();
      await loadDependents();
    } catch (requestError) {
      const details = requestError.response?.data?.details?.map((item) => item.msg).filter(Boolean);
      setError(details?.join(' ') || requestError.response?.data?.error || 'Could not save this family member.');
    } finally {
      setSaving(false);
    }
  }

  async function removeDependent(dependent) {
    if (!window.confirm(`Remove ${dependent.name} from your family list? Their previous assessment history will remain available.`)) return;
    try {
      await deleteDependent(dependent._id);
      if (historyFor === dependent._id) setHistoryFor(null);
      await loadDependents();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not remove this family member.');
    }
  }

  async function showHistory(dependent) {
    if (historyFor === dependent._id) {
      setHistoryFor(null);
      return;
    }
    setHistoryFor(dependent._id);
    setHistoryLoading(true);
    setError('');
    try {
      const response = await getDependentAssessments(dependent._id);
      setHistory(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not load this family member’s history.');
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-7 px-4 py-10">
      <header>
        <p className="health-badge">Caregiver mode</p>
        <h1 className="mt-3 text-2xl font-semibold text-clinical-700">Family members</h1>
        <p className="mt-1 text-sm text-ink/60">Manage profiles and keep each person’s assessment history separate.</p>
      </header>

      <section className="health-card p-5">
        <h2 className="mb-4 font-semibold text-ink">{editingId ? 'Edit family member' : 'Add family member'}</h2>
        <form onSubmit={submitForm} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-ink/70">
            Name
            <input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-md border border-clinical-100 px-3 py-2" />
          </label>
          <label className="text-sm text-ink/70">
            Relationship
            <select required value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} className="mt-1 w-full rounded-md border border-clinical-100 bg-white px-3 py-2">
              <option value="">Choose relationship</option>
              {RELATIONSHIPS.map((relationship) => <option key={relationship}>{relationship}</option>)}
            </select>
          </label>
          <label className="text-sm text-ink/70">
            Date of birth
            <input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} className="mt-1 w-full rounded-md border border-clinical-100 px-3 py-2" />
          </label>
          <label className="text-sm text-ink/70">
            Gender (optional)
            <select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="mt-1 w-full rounded-md border border-clinical-100 bg-white px-3 py-2">
              <option value="">Not provided</option>
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="Other">Other</option>
            </select>
          </label>
          {error && <p role="alert" className="text-sm text-urgent-500 sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={saving} className="primary-btn disabled:opacity-50" type="submit">
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add family member'}
            </button>
            {editingId && <button type="button" onClick={resetForm} className="secondary-btn">Cancel</button>}
          </div>
        </form>
      </section>

      <section aria-labelledby="family-list-heading">
        <h2 id="family-list-heading" className="mb-3 font-semibold text-ink">Your family profiles</h2>
        {loading && <p className="text-sm text-ink/50">Loading family profiles...</p>}
        {!loading && dependents.length === 0 && <p className="rounded-md border border-clinical-100 bg-white p-4 text-sm text-ink/60">No family members yet. Add a profile above to assess someone in your care.</p>}
        <div className="space-y-3">
          {dependents.map((dependent) => (
            <article key={dependent._id} className="health-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-clinical-700">{dependent.name}</h3>
                  <p className="mt-1 text-sm text-ink/60">{dependent.relationship} · Age {ageFromDob(dependent.dateOfBirth)} · Born {new Date(dependent.dateOfBirth).toLocaleDateString()}</p>
                  {dependent.gender && <p className="text-xs text-ink/50">Gender: {dependent.gender}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/assessment?dependentId=${dependent._id}`} className="primary-btn">Assess</Link>
                  <button type="button" onClick={() => startEdit(dependent)} className="secondary-btn">Edit</button>
                  <button type="button" onClick={() => removeDependent(dependent)} className="secondary-btn text-urgent-500">Delete</button>
                  <button type="button" onClick={() => showHistory(dependent)} className="secondary-btn">{historyFor === dependent._id ? 'Hide history' : 'View history'}</button>
                </div>
              </div>
              {historyFor === dependent._id && (
                <div className="mt-4 border-t border-clinical-100 pt-3">
                  <h4 className="mb-2 text-sm font-medium text-ink">{dependent.name}’s assessment history</h4>
                  {historyLoading && <p className="text-sm text-ink/50">Loading history...</p>}
                  {!historyLoading && history.length === 0 && <p className="text-sm text-ink/50">No assessments for this family member yet.</p>}
                  {!historyLoading && history.map((recommendation) => (
                    <Link key={recommendation._id} to={`/recommendations/${recommendation._id}`} className="block border-t border-clinical-50 py-2 text-sm hover:text-clinical-700">
                      {recommendation.assessmentId?.clinicalInputs?.chiefComplaint || 'Assessment'} · {new Date(recommendation.createdAt).toLocaleString()}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}