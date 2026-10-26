import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createAssessment } from '../services/recommendationApi';
import { getDependents } from '../services/dependentApi';

const QUICK_SYMPTOMS = [
  'Severe Chest Pain & Pressure',
  'Shortness of Breath / Dyspnea',
  'Acute Abdominal Pain',
  'High Fever & Chills (>102°F)',
  'Sudden Severe Headache',
  'Palpitations & Rapid Heartbeat',
  'Physical Trauma / Fracture',
  'Dizziness & Fainting',
];

const QUICK_LOCATIONS = [
  'Bengaluru, Karnataka',
  'Chennai, Tamil Nadu',
  'Mumbai, Maharashtra',
  'Delhi NCR',
  'Hyderabad, Telangana',
  'Kolkata, West Bengal',
];

const VITALS_GROUPS = [
  {
    title: 'Cardiovascular Function',
    icon: '❤️',
    fields: [
      { key: 'heartrate', label: 'Heart Rate', unit: 'bpm', hint: 'Normal: 60 – 100 bpm', min: 20, max: 250 },
      { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', hint: 'Normal: 90 – 120 mmHg', min: 40, max: 300 },
      { key: 'dbp', label: 'Diastolic BP', unit: 'mmHg', hint: 'Normal: 60 – 80 mmHg', min: 20, max: 200 },
    ],
  },
  {
    title: 'Respiratory & Oxygenation',
    icon: '🫁',
    fields: [
      { key: 'o2sat', label: 'O2 Saturation (SpO2)', unit: '%', hint: 'Normal: ≥ 95%', min: 50, max: 100 },
      { key: 'resprate', label: 'Respiratory Rate', unit: 'breaths/min', hint: 'Normal: 12 – 20 /min', min: 1, max: 80 },
    ],
  },
  {
    title: 'Systemic & Pain Indicators',
    icon: '🌡️',
    fields: [
      { key: 'temperature', label: 'Body Temperature', unit: '°F', hint: 'Normal: 97.0 – 99.0 °F', step: '0.1', min: 70, max: 115 },
      { key: 'pain', label: 'Pain Severity Level', unit: '0–10 scale', hint: '0 = None, 5 = Moderate, 10 = Worst', min: 0, max: 10 },
    ],
  },
];

const ALL_VITAL_KEYS = ['temperature', 'heartrate', 'resprate', 'o2sat', 'sbp', 'dbp', 'pain'];

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export default function PatientAssessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDependentId = searchParams.get('dependentId');
  const [form, setForm] = useState({
    chiefComplaint: '', gender: 'Other', locationText: '',
    temperature: '', heartrate: '', resprate: '', o2sat: '', sbp: '', dbp: '', pain: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportName, setReportName] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [extractedSummary, setExtractedSummary] = useState([]);
  const [readingReport, setReadingReport] = useState(false);
  const [assessmentFor, setAssessmentFor] = useState(preselectedDependentId ? 'family' : 'myself');
  const [dependents, setDependents] = useState([]);
  const [dependentsLoading, setDependentsLoading] = useState(false);
  const [dependentsError, setDependentsError] = useState('');
  const [dependentId, setDependentId] = useState(preselectedDependentId || '');
  const [locatingUser, setLocatingUser] = useState(false);

  const selectedDependent = dependents.find((dependent) => dependent._id === dependentId);

  React.useEffect(() => {
    if (assessmentFor !== 'family') return;
    setDependentsLoading(true);
    setDependentsError('');
    getDependents()
      .then((response) => {
        setDependents(response.data);
        const selected = response.data.find((dependent) => dependent._id === preselectedDependentId);
        setDependentId(selected?._id || response.data[0]?._id || '');
      })
      .catch(() => setDependentsError('Could not load family members.'))
      .finally(() => setDependentsLoading(false));
  }, [assessmentFor]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleQuickSymptom(symptom) {
    setForm((prev) => {
      if (!prev.chiefComplaint) return { ...prev, chiefComplaint: symptom };
      if (prev.chiefComplaint.includes(symptom)) return prev;
      return { ...prev, chiefComplaint: `${prev.chiefComplaint}, ${symptom}` };
    });
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Simple label for coordinates
        const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        setForm((f) => ({ ...f, locationText: coords }));
        setLocatingUser(false);
      },
      () => {
        setLocatingUser(false);
      },
      { timeout: 8000 }
    );
  }

  async function readReport(file) {
    if (!file) return;
    if (!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.type)) {
      setReportStatus('Please select a valid PDF, JPG, PNG, or WebP medical report.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setReportStatus('The report file must be 10 MB or smaller.');
      return;
    }

    setReportName(file.name);
    setReportStatus('Analyzing document and extracting clinical indicators...');
    setReadingReport(true);
    setExtractedSummary([]);

    try {
      let text = '';
      let pages = [];
      if (file.type === 'application/pdf') {
        const [pdfjsLib, pdfjsWorker] = await Promise.all([
          import('pdfjs-dist'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ]);
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 8); pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(' ');
          text += `${pageText}\n`;
          if (!pageText.trim()) {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
            pages.push(canvas);
          }
        }
      } else {
        pages = [file];
      }

      if (pages.length) {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        try {
          for (const page of pages) {
            const result = await worker.recognize(page);
            text += `\n${result.data.text}`;
          }
        } finally {
          await worker.terminate();
        }
      }

      const extracted = extractReportFields(text);
      const keys = Object.keys(extracted);
      if (keys.length) {
        setForm((current) => {
          const additions = Object.fromEntries(
            Object.entries(extracted).filter(([key]) => current[key] === '')
          );
          return { ...current, ...additions };
        });
        const summary = keys.map((k) => `${k.toUpperCase()}: ${extracted[k]}`);
        setExtractedSummary(summary);
        setReportStatus(`✓ Successfully extracted ${keys.length} indicators. Review fields below.`);
      } else {
        setReportStatus('Report scanned, but no clear vital values detected. Please enter them manually.');
      }
    } catch {
      setReportStatus('Unable to parse document. Please input vital measurements manually.');
    } finally {
      setReadingReport(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { ...form };
      if (assessmentFor === 'family') {
        if (!dependentId) {
          setError('Please select or add a family member before starting their assessment.');
          setLoading(false);
          return;
        }
        payload.dependentId = dependentId;
      }
      ALL_VITAL_KEYS.forEach((key) => {
        payload[key] = payload[key] === '' ? null : Number(payload[key]);
      });
      const res = await createAssessment(payload);
      navigate(`/risk-result/${res.data.assessment._id}`, { state: res.data });
    } catch (err) {
      const validationMessages = err.response?.data?.details?.map((detail) => detail.msg).filter(Boolean);
      setError(
        validationMessages?.length
          ? validationMessages.join(' ')
          : err.response?.data?.error || 'Could not complete assessment. Please check the inputs.'
      );
    } finally {
      setLoading(false);
    }
  }

  // Clinical acuity warnings
  const acuityAlerts = [];
  if (form.o2sat && Number(form.o2sat) < 92) {
    acuityAlerts.push('Hypoxemia Alert: SpO2 is below 92% (High Acuity)');
  }
  if (form.heartrate && (Number(form.heartrate) > 120 || Number(form.heartrate) < 45)) {
    acuityAlerts.push('Arrhythmia/Pulse Alert: Heart rate is critically outside normal range');
  }
  if (form.sbp && Number(form.sbp) > 170) {
    acuityAlerts.push('Severe Hypertension: Systolic BP exceeds 170 mmHg');
  }
  if (form.pain && Number(form.pain) >= 8) {
    acuityAlerts.push('Severe Acute Pain Level (≥ 8/10)');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-clinical-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-clinical-50 border border-clinical-200 px-3 py-1 text-xs font-semibold text-clinical-800 uppercase tracking-wide">
            <span className="h-2 w-2 rounded-full bg-clinical-600 animate-pulse"></span>
            AI Clinical Decision-Support Intake
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-clinical-900 tracking-tight">Patient Clinical Assessment</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink/70">
            Provide patient symptoms and available vital measurements. Our validated risk stratification model maps clinical acuity to optimal hospital resources, predicted wait times, and source-verified medical specialists.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 shrink-0 max-w-sm">
          <p className="font-semibold flex items-center gap-1.5">
            <span>🚨</span> Life-Threatening Emergency?
          </p>
          <p className="mt-0.5 text-amber-800/90 leading-relaxed">
            Immediately dial <strong>112</strong> or <strong>108</strong> (India Ambulance) or go to the nearest emergency room.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Context & Chief Complaint (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Who is this assessment for */}
          <div className="rounded-xl border border-clinical-100 bg-white p-5 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-wider text-clinical-700 block mb-3">
              1. Assessment Subject
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setAssessmentFor('myself'); setDependentId(''); }}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold transition ${
                  assessmentFor === 'myself'
                    ? 'border-clinical-600 bg-clinical-50/70 text-clinical-800 ring-2 ring-clinical-500/20'
                    : 'border-slate-200 bg-slate-50/50 text-ink/70 hover:bg-slate-100/60'
                }`}
              >
                <span>👤</span> Myself
              </button>
              <button
                type="button"
                onClick={() => { setAssessmentFor('family'); }}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold transition ${
                  assessmentFor === 'family'
                    ? 'border-clinical-600 bg-clinical-50/70 text-clinical-800 ring-2 ring-clinical-500/20'
                    : 'border-slate-200 bg-slate-50/50 text-ink/70 hover:bg-slate-100/60'
                }`}
              >
                <span>👨‍👩‍👧</span> Family Member
              </button>
            </div>

            {assessmentFor === 'family' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                {dependentsLoading && <p className="text-xs text-ink/50">Loading registered family members...</p>}
                {dependentsError && <p role="alert" className="text-xs text-urgent-500">{dependentsError}</p>}
                {!dependentsLoading && !dependentsError && dependents.length === 0 && (
                  <p className="text-xs text-ink/70">
                    No family members saved yet.{' '}
                    <Link className="font-semibold text-clinical-600 underline" to="/family">
                      Add a family member in profile
                    </Link>
                  </p>
                )}
                {dependents.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-ink/70 mb-1.5">
                      Select dependent profile:
                    </label>
                    <select
                      required
                      value={dependentId}
                      onChange={(e) => setDependentId(e.target.value)}
                      className="w-full rounded-lg border border-clinical-200 bg-white px-3 py-2 text-sm text-ink focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200"
                    >
                      {dependents.map((dep) => (
                        <option key={dep._id} value={dep._id}>
                          {dep.name} ({dep.relationship}) — {calculateAge(dep.dateOfBirth) ? `${calculateAge(dep.dateOfBirth)} yrs` : 'Age N/A'}
                        </option>
                      ))}
                    </select>
                    {selectedDependent && (
                      <p className="mt-2 text-xs text-clinical-700 bg-clinical-50/60 p-2 rounded-md border border-clinical-100">
                        Selected: <strong>{selectedDependent.name}</strong> ({selectedDependent.relationship}), age {calculateAge(selectedDependent.dateOfBirth) ?? 'unspecified'}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chief Complaint & Symptoms */}
          <div className="rounded-xl border border-clinical-100 bg-white p-5 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-clinical-700">
                  2. Chief Complaint & Clinical Symptoms <span className="text-urgent-500">*</span>
                </label>
                <span className="text-[11px] text-ink/50">Required for specialty triage</span>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Describe what the patient is experiencing (e.g. Sudden severe left-sided chest pain radiating to left arm, shortness of breath for past 2 hours)..."
                className="w-full rounded-lg border border-clinical-200 p-3 text-sm text-ink focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200"
                value={form.chiefComplaint}
                onChange={(e) => updateField('chiefComplaint', e.target.value)}
              />
            </div>

            {/* Quick symptom pills */}
            <div>
              <p className="text-xs font-medium text-ink/65 mb-2">⚡ Quick-Select Common Clinical Symptoms:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => handleQuickSymptom(symptom)}
                    className="inline-flex items-center rounded-lg border border-clinical-100 bg-slate-50 px-2.5 py-1 text-xs font-medium text-clinical-800 transition hover:border-clinical-300 hover:bg-clinical-50 active:scale-95"
                  >
                    + {symptom}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Location */}
          <div className="rounded-xl border border-clinical-100 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-clinical-700">
                3. Patient Location (City / State / Coordinates)
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locatingUser}
                className="text-xs font-semibold text-clinical-600 hover:text-clinical-800 hover:underline inline-flex items-center gap-1"
              >
                <span>📍</span> {locatingUser ? 'Detecting...' : 'Use Current Device GPS'}
              </button>
            </div>
            <input
              placeholder="e.g. Bengaluru, Karnataka or Koramangala, Bangalore"
              className="w-full rounded-lg border border-clinical-200 px-3 py-2 text-sm text-ink focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200"
              value={form.locationText}
              onChange={(e) => updateField('locationText', e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink/60">
              <span className="font-medium text-ink/75">Quick Metros:</span>
              {QUICK_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => updateField('locationText', loc)}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-ink/80 hover:bg-clinical-100 hover:text-clinical-900"
                >
                  {loc.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* OCR Document Upload Card */}
          <div className="rounded-xl border border-dashed border-clinical-200 bg-clinical-50/30 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <label htmlFor="medical-report" className="block text-sm font-bold text-clinical-800 cursor-pointer">
                  Automated OCR Lab/Discharge Report Scanner (Optional)
                </label>
                <p className="mt-0.5 text-xs text-ink/65 leading-relaxed">
                  Upload an existing hospital discharge summary, ECG report, or vitals printout (PDF, PNG, JPG ≤ 10 MB). On-device OCR automatically parses vitals and populates measurements.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="medical-report"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    disabled={readingReport}
                    onChange={(event) => readReport(event.target.files?.[0])}
                    className="block text-xs text-ink/70 file:mr-3 file:rounded-md file:border-0 file:bg-clinical-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-clinical-700 cursor-pointer"
                  />
                  {readingReport && (
                    <span className="text-xs text-clinical-700 font-medium animate-pulse">
                      Analyzing document...
                    </span>
                  )}
                </div>
                {reportName && <p className="mt-2 text-xs font-medium text-ink/70 truncate">File: {reportName}</p>}
                {reportStatus && (
                  <p className={`mt-1.5 text-xs font-medium ${reportStatus.startsWith('✓') ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {reportStatus}
                  </p>
                )}
                {extractedSummary.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {extractedSummary.map((item, idx) => (
                      <span key={idx} className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Vitals Measurements & Decision Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-clinical-100 bg-white p-5 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-clinical-700">
                  4. Patient Vitals & Clinical Indicators
                </h2>
                <span className="text-[11px] text-ink/50">Leave unknown blank</span>
              </div>
              <p className="mt-1 text-xs text-ink/65">
                Measurements feed into our hospital triage engine and XGBoost waiting-time estimation model.
              </p>
            </div>

            {/* Vital groups */}
            <div className="space-y-4">
              {VITALS_GROUPS.map((group) => (
                <div key={group.title} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-clinical-800 border-b border-slate-200/60 pb-1.5">
                    <span>{group.icon}</span>
                    <span>{group.title}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.fields.map(({ key, label, unit, hint, step, min, max }) => (
                      <div key={key} className={group.fields.length === 1 ? 'sm:col-span-2' : ''}>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-ink/80">{label}</label>
                          <span className="text-[10px] text-ink/50 font-mono">{unit}</span>
                        </div>
                        <input
                          type="number"
                          step={step || '1'}
                          min={min}
                          max={max}
                          placeholder={hint.replace('Normal: ', '')}
                          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-ink focus:border-clinical-500 focus:ring-1 focus:ring-clinical-200"
                          value={form[key]}
                          onChange={(e) => updateField(key, e.target.value)}
                        />
                        <p className="mt-0.5 text-[10px] text-ink/55">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Acuity Warnings */}
            {acuityAlerts.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 space-y-1">
                <p className="text-xs font-bold text-rose-800 flex items-center gap-1">
                  <span>⚠️</span> High Acuity Indicators Flagged:
                </p>
                <ul className="text-xs text-rose-700 space-y-0.5 pl-4 list-disc">
                  {acuityAlerts.map((alert, idx) => (
                    <li key={idx}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-clinical-600 to-clinical-700 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:from-clinical-700 hover:to-clinical-800 transition active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Evaluating Clinical Urgency & Matching Hospitals...</span>
                  </>
                ) : (
                  <>
                    <span>Run AI Clinical Triage & Rank Hospitals</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-ink/50 text-center leading-relaxed">
              MediNexus clinical algorithms provide evidence-based decision-support. Triage outcomes guide department matching and do not substitute direct physician evaluation.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function extractReportFields(text) {
  const fields = {};
  const complaint = text.match(
    /(?:chief\s*complaint|presenting\s*complaint|reason\s*for\s*(?:visit|consultation))\s*[:=\-]\s*([^\r\n.;]{3,120})/i
  );
  if (complaint) fields.chiefComplaint = complaint[1].trim();

  const rules = [
    ['temperature', /(?:temperature|temp)\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)\s*(?:°\s*[fc])?/i],
    ['heartrate', /(?:heart\s*rate|pulse|HR)\s*[:=]?\s*(\d{2,3})\s*(?:bpm)?/i],
    ['resprate', /(?:respiratory\s*rate|resp\.?\s*rate|RR)\s*[:=]?\s*(\d{1,2})\s*(?:\/\s*min|bpm)?/i],
    ['o2sat', /(?:O2\s*sat(?:uration)?|SpO2|oxygen\s*saturation)\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)\s*%?/i],
    ['pain', /(?:pain(?:\s*level|\s*score)?)\s*[:=]?\s*(\d{1,2})(?:\s*\/\s*10)?/i],
  ];
  for (const [key, pattern] of rules) {
    const match = text.match(pattern);
    if (match) fields[key] = match[1];
  }

  const bloodPressure = text.match(/(?:blood\s*pressure|BP)\s*[:=]?\s*(\d{2,3})\s*\/\s*(\d{2,3})/i);
  if (bloodPressure) {
    fields.sbp = bloodPressure[1];
    fields.dbp = bloodPressure[2];
  }
  return fields;
}
