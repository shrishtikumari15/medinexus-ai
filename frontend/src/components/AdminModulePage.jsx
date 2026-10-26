import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminModulePage({ title, summary, section, status, related }) {
  return (
    <main className="panel-shell">
      <header className="panel-header">
        <div>
          <p className="panel-eyebrow">Administration / {section}</p>
          <h1 className="panel-title">{title}</h1>
          <p className="panel-subtitle">{summary}</p>
        </div>
        <Link to="/admin" className="secondary-btn">Back to administration</Link>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="health-card min-h-64 p-6">
          <div className="flex items-center justify-between gap-3 border-b border-clinical-100 pb-4">
            <div>
              <p className="panel-eyebrow">{section}</p>
              <h2 className="mt-1 text-lg font-semibold text-clinical-700">Workspace</h2>
            </div>
            <span className="soft-chip">{status}</span>
          </div>
          <div className="flex min-h-40 flex-col items-start justify-center py-5">
            <p className="text-sm font-medium text-ink">This module is not connected to live records yet.</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">No operational data is being displayed or implied here. Existing MediNexus workflows remain available from administration.</p>
          </div>
        </div>

        <aside className="health-card p-5">
          <p className="panel-eyebrow">Administration</p>
          <h2 className="mt-2 text-lg font-semibold text-clinical-700">Related workspaces</h2>
          <nav className="mt-4 divide-y divide-clinical-50" aria-label="Related admin workspaces">
            {related.map((item) => (
              <Link key={item.to} to={item.to} className="block py-3 text-sm font-medium text-ink/70 transition hover:text-clinical-700">
                {item.label}<span className="float-right text-clinical-500" aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </aside>
      </section>
    </main>
  );
}