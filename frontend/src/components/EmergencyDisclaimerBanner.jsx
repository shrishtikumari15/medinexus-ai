import React from 'react';

export default function EmergencyDisclaimerBanner({ show }) {
  if (!show) return null;
  return (
    <div className="bg-urgent-100 border border-urgent-500 text-urgent-500 rounded-lg p-4 text-sm font-medium">
      If this is a medical emergency, seek immediate professional medical care or contact emergency
      services. Medinexus is an AI-assisted decision-support tool and does not replace emergency
      medical assessment.
    </div>
  );
}
