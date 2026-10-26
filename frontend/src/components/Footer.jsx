import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#091e1c] text-white">
      {/* Emergency & 24/7 Rapid Response Helpline Strip */}
      <div className="border-b border-white/10 bg-[#0d2a27] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-xl font-bold shadow-md">
              🚑
            </span>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                24/7 Emergency Medical Helpline &amp; Critical Trauma Care
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </p>
              <p className="text-xs text-slate-300">
                Direct nationwide routing to accredited trauma units, ICU facilities, and ambulance fleets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <a
              href="tel:1066"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-white shadow-sm hover:bg-rose-500 transition"
              title="Apollo Hospitals Emergency Network"
            >
              <span>🚨 Apollo: 1066</span>
            </a>
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-white shadow-sm hover:bg-amber-500 transition"
              title="National Ambulance Service"
            >
              <span>📞 Ambulance: 108 / 102</span>
            </a>
            <a
              href="tel:18605001066"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-slate-200 hover:bg-white/20 transition"
              title="Apollo 24/7 Care Helpline"
            >
              <span>💬 Helpline: 1860-500-1066</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Directory */}
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 lg:px-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group" aria-label="MediNexus Home">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xl shadow-md">
                M+
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">MediNexus</span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    AI Health
                  </span>
                </div>
                <p className="text-xs text-slate-400">Intelligent Hospital &amp; Doctor Recommendation</p>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-slate-300 max-w-sm">
              Empowering patients across India with AI-driven clinical acuity stratification, verified hospital directories, official medical registries, and direct quaternary care connections.
            </p>

            {/* Quality & Accreditation Badges */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                Quality &amp; Clinical Accreditations
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-md bg-white/10 px-2 py-1 text-slate-200 border border-white/10 font-medium">
                  🏛️ Apex Quaternary Protocols
                </span>
                <span className="rounded-md bg-white/10 px-2 py-1 text-slate-200 border border-white/10 font-medium">
                  🌐 Verified Specialist Network
                </span>
                <span className="rounded-md bg-white/10 px-2 py-1 text-slate-200 border border-white/10 font-medium">
                  🔬 NABL Testing Labs
                </span>
                <span className="rounded-md bg-white/10 px-2 py-1 text-slate-200 border border-white/10 font-medium">
                  📋 NMC Doctor Verified
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Centres of Excellence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3.5">
              Centres of Excellence
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/hospitals?specialty=Cardiology" className="hover:text-emerald-300 transition">
                  🫀 Cardiology &amp; Heart Care
                </Link>
              </li>
              <li>
                <Link to="/hospitals?specialty=Neurology" className="hover:text-emerald-300 transition">
                  🧠 Neurology &amp; Neurosurgery
                </Link>
              </li>
              <li>
                <Link to="/hospitals?specialty=Orthopedics" className="hover:text-emerald-300 transition">
                  🦴 Orthopedics &amp; Joint Surgery
                </Link>
              </li>
              <li>
                <Link to="/hospitals?specialty=Oncology" className="hover:text-emerald-300 transition">
                  🎗️ Oncology &amp; Cancer Care
                </Link>
              </li>
              <li>
                <Link to="/hospitals?specialty=Gastroenterology" className="hover:text-emerald-300 transition">
                  🔬 Gastroenterology &amp; Hepatology
                </Link>
              </li>
              <li>
                <Link to="/hospitals?specialty=Pulmonology" className="hover:text-emerald-300 transition">
                  🫁 Pulmonology &amp; Chest Care
                </Link>
              </li>
              <li>
                <Link to="/hospitals?specialty=Pediatrics" className="hover:text-emerald-300 transition">
                  👶 Pediatrics &amp; Neonatology
                </Link>
              </li>
              <li>
                <Link to="/hospitals?specialty=Nephrology" className="hover:text-emerald-300 transition">
                  💧 Nephrology &amp; Kidney Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Major Metro Hospital Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3.5">
              Major Metro Hubs
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/hospitals?state=Mumbai" className="hover:text-emerald-300 transition">
                  Mumbai &amp; Navi Mumbai
                </Link>
              </li>
              <li>
                <Link to="/hospitals?state=Bengaluru" className="hover:text-emerald-300 transition">
                  Bengaluru Urban &amp; Rural
                </Link>
              </li>
              <li>
                <Link to="/hospitals?state=Delhi" className="hover:text-emerald-300 transition">
                  Delhi NCR &amp; Gurgaon
                </Link>
              </li>
              <li>
                <Link to="/hospitals?state=Chennai" className="hover:text-emerald-300 transition">
                  Chennai &amp; Tamil Nadu
                </Link>
              </li>
              <li>
                <Link to="/hospitals?state=Hyderabad" className="hover:text-emerald-300 transition">
                  Hyderabad &amp; Telangana
                </Link>
              </li>
              <li>
                <Link to="/hospitals?state=Kolkata" className="hover:text-emerald-300 transition">
                  Kolkata &amp; West Bengal
                </Link>
              </li>
              <li>
                <Link to="/hospitals?state=Pune" className="hover:text-emerald-300 transition">
                  Pune &amp; Maharashtra
                </Link>
              </li>
              <li>
                <Link to="/hospitals?q=Apollo" className="hover:text-emerald-300 transition font-semibold text-emerald-300">
                  Apollo Flagship Networks →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Patient Portals & Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3.5">
              Patient Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/assessment" className="hover:text-emerald-300 transition font-bold text-white flex items-center gap-1.5">
                  <span>✨ AI Symptom Triage</span>
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-emerald-300 transition">
                  Find Accredited Hospitals
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-emerald-300 transition">
                  Consult Verified Doctors
                </Link>
              </li>
              <li>
                <Link to="/hospitals/compare" className="hover:text-emerald-300 transition">
                  Side-by-Side Hospital Compare
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-300 transition">
                  Patient Health Dashboard
                </Link>
              </li>
              <li>
                <Link to="/family" className="hover:text-emerald-300 transition">
                  Family Dependents Care
                </Link>
              </li>
              <li>
                <Link to="/doctor/register" className="hover:text-emerald-300 transition">
                  Doctor Registration Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-300 transition">
                  Administrative Analytics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Statutory Medical Disclaimer */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-[#061614] p-5 text-[11px] leading-relaxed text-slate-400">
          <p className="font-bold text-slate-300 uppercase tracking-wide mb-1">
            ⚠️ Clinical Notice &amp; Statutory Medical Disclaimer
          </p>
          <p>
            MediNexus AI provides clinical acuity stratification and healthcare resource recommendations based on machine learning models, published medical registries, and public healthcare directories. It is designed to assist patients in navigating healthcare services and does <strong>not</strong> provide a definitive medical diagnosis or replace consultation with a qualified medical practitioner. If you or someone you are assisting is experiencing severe chest pain, shortness of breath, sudden numbness, excessive bleeding, or any life-threatening symptoms, please call national emergency services (<strong>108 / 102</strong>) or Apollo Emergency (<strong>1066</strong>) immediately, or visit the nearest hospital emergency room.
          </p>
        </div>

        {/* Copyright & Legal Sub-bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} MediNexus AI Health Network. All rights reserved. Quaternary Care Partner Portal.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
            <span className="text-white/20">|</span>
            <span className="hover:text-slate-200 cursor-pointer">Terms of Healthcare Service</span>
            <span className="text-white/20">|</span>
            <span className="hover:text-slate-200 cursor-pointer">Patient Data Security</span>
            <span className="text-white/20">|</span>
            <span className="hover:text-slate-200 cursor-pointer">Clinical Ethics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
