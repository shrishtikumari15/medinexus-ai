const UNAVAILABLE_HOSPITAL_HOSTS = new Set(['abhijayhospital.com', 'www.abhijayhospital.com']);

export function normalizeHospitalWebsite(rawValue, hospitalName = '') {
  if (/aiims.*bhubaneswar|bhubaneswar.*aiims/i.test(hospitalName)) {
    return 'https://aiimsbhubaneswar.nic.in/';
  }

  if (/aiims.*patna|patna.*aiims/i.test(hospitalName) || /aiimspatna\.org/i.test(rawValue || '')) {
    return 'https://aiimspatna.edu.in/';
  }

  if (typeof rawValue !== 'string') return null;

  const cleaned = rawValue.trim();
  if (!cleaned) return null;

  const blocked = ['NA', 'N/A', 'NO WEBSITE', 'NOT AVAILABLE', 'WEBSITE IS NOT WORKING'];
  if (blocked.includes(cleaned.toUpperCase())) return null;

  const value = cleaned.replace(/\s+/g, '').replace(/^\/+/, '');
  if (!value || /^(na|n\/a|nowebsite|websiteisnotworking)$/i.test(value)) return null;

  const withProtocol = value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `https://${value}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      if (UNAVAILABLE_HOSPITAL_HOSTS.has(url.hostname.toLowerCase())) return null;
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}
