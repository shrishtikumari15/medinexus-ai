import React from 'react';

const STYLES = {
  HIGH_URGENCY: 'bg-urgent-100 text-urgent-500 border-urgent-500',
  LOWER_URGENCY: 'bg-stable-100 text-stable-500 border-stable-500',
  UNKNOWN: 'bg-caution-100 text-caution-500 border-caution-500',
};

const LABELS = {
  HIGH_URGENCY: 'High Urgency',
  LOWER_URGENCY: 'Lower Urgency',
  UNKNOWN: 'Unknown',
};

export default function RiskBadge({ label }) {
  const style = STYLES[label] || STYLES.UNKNOWN;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${style}`}>
      {LABELS[label] || label}
    </span>
  );
}
