import React from 'react';

const LABELS = {
  specialtyMatch: 'Specialty Match',
  facilityMatch: 'Facility Match',
  emergencyCapability: 'Emergency Capability',
  resourceSuitability: 'Resource Suitability',
    bedAvailability: 'Bed Availability',
  waitingTimeScore: 'Waiting-Time Score',
  locationScore: 'Location Score',
  congestionScore: 'Recent-Demand Balance',
};

export default function ScoreBreakdown({ breakdown }) {
  return (
    <div className="space-y-2">
      {Object.entries(LABELS).map(([key, label]) => {
        const value = breakdown[key];
        const unavailable = value === null || value === undefined;
        return (
          <div key={key} className="flex items-center gap-3 text-sm">
            <span className="w-40 shrink-0 text-ink/70">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-clinical-50 overflow-hidden">
              {!unavailable && (
                <div
                  className="h-full bg-clinical-500 rounded-full"
                  style={{ width: `${value}%` }}
                />
              )}
            </div>
            <span className="w-20 text-right text-ink/60">
              {unavailable ? 'N/A' : `${value}/100`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
