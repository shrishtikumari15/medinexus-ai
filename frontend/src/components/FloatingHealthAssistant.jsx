import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FloatingHealthAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function handleQuickSymptom(symptom) {
    setIsOpen(false);
    navigate(`/assessment?symptom=${encodeURIComponent(symptom)}`);
  }

  function handleQuickSearch(specialty) {
    setIsOpen(false);
    navigate(`/hospitals?specialty=${encodeURIComponent(specialty)}`);
  }

  return (
    <aside aria-label="Quick Care Assistant" className="fixed bottom-6 right-6 z-50">
      {/* Floating Panel when open */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-clinical-600 to-clinical-800 text-white shadow-sm">
                <span className="text-base font-bold">M+</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Care Assistant
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h4>
                <p className="text-[11px] text-slate-500">24/7 Triage & Hospital Routing</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close assistant"
            >
              ✕
            </button>
          </div>

          {/* Assistant Body */}
          <div className="mt-3.5 space-y-3">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              👋 <strong>Hello!</strong> Need guidance finding the right hospital, doctor, or emergency triage? Choose an option below:
            </div>

            {/* Quick Symptom Check */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Check Acute Symptoms (AI Triage)
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickSymptom('High Fever & Chills (>102°F)')}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-left font-medium text-slate-700 hover:border-clinical-500 hover:bg-clinical-50/50 hover:text-clinical-700 transition"
                >
                  🌡️ High Fever
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSymptom('Severe Chest Pain & Pressure')}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-left font-medium text-slate-700 hover:border-clinical-500 hover:bg-clinical-50/50 hover:text-clinical-700 transition"
                >
                  ❤️ Chest Discomfort
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSymptom('Shortness of Breath / Dyspnea')}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-left font-medium text-slate-700 hover:border-clinical-500 hover:bg-clinical-50/50 hover:text-clinical-700 transition"
                >
                  🫁 Breathlessness
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSymptom('Sudden Severe Headache')}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-left font-medium text-slate-700 hover:border-clinical-500 hover:bg-clinical-50/50 hover:text-clinical-700 transition"
                >
                  🧠 Severe Headache
                </button>
              </div>
            </div>

            {/* Quick Specialty Explorer */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Find Hospital Department
              </p>
              <div className="flex flex-wrap gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickSearch('Cardiology')}
                  className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 hover:bg-clinical-50 hover:text-clinical-700 transition"
                >
                  Cardiology
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('Internal Medicine')}
                  className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 hover:bg-clinical-50 hover:text-clinical-700 transition"
                >
                  Internal Medicine
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('Orthopedics')}
                  className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 hover:bg-clinical-50 hover:text-clinical-700 transition"
                >
                  Orthopedics
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('Neurology')}
                  className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 hover:bg-clinical-50 hover:text-clinical-700 transition"
                >
                  Neurology
                </button>
              </div>
            </div>

            {/* Emergency Hotline Strip */}
            <div className="rounded-xl bg-rose-50 p-2.5 border border-rose-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🚨</span>
                <div>
                  <span className="font-bold text-rose-800 block">Emergency Services</span>
                  <span className="text-[10px] text-rose-600">Ambulance: 108 / 102 · Apollo: 1066</span>
                </div>
              </div>
              <a
                href="tel:108"
                className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
              >
                Call 108
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Apollo style circular assistant button) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-clinical-700 via-clinical-800 to-clinical-900 px-4 py-3 text-white shadow-2xl hover:scale-105 active:scale-95 transition duration-200 border-2 border-white/30"
        aria-label="Open AI Care Assistant"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <span className="text-lg">🩺</span>
        <span className="text-xs font-extrabold tracking-wide hidden sm:inline">
          {isOpen ? 'Close Assistant' : 'Need Help? AI Triage'}
        </span>
      </button>
    </aside>
  );
}
