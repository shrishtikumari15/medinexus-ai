const axios = require('axios');
const env = require('../config/env');

const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/search';

const KNOWN_INDIAN_COORDINATES = [
  { patterns: [/navi mumbai/i], lat: 19.0330, lon: 73.0297 },
  { patterns: [/mumbai/i, /bombay/i], lat: 19.0760, lon: 72.8777 },
  { patterns: [/thane/i], lat: 19.2183, lon: 72.9781 },
  { patterns: [/pune/i, /poona/i], lat: 18.5204, lon: 73.8567 },
  { patterns: [/nagpur/i], lat: 21.1458, lon: 79.0882 },
  { patterns: [/nashik/i, /nasik/i], lat: 19.9975, lon: 73.7898 },
  { patterns: [/gurgaon/i, /gurugram/i], lat: 28.4595, lon: 77.0266 },
  { patterns: [/noida/i], lat: 28.5355, lon: 77.3910 },
  { patterns: [/delhi/i, /new delhi/i, /ncr/i], lat: 28.6139, lon: 77.2090 },
  { patterns: [/bengaluru/i, /bangalore/i], lat: 12.9716, lon: 77.5946 },
  { patterns: [/chennai/i, /madras/i], lat: 13.0827, lon: 80.2707 },
  { patterns: [/hyderabad/i, /secunderabad/i], lat: 17.3850, lon: 78.4867 },
  { patterns: [/kolkata/i, /calcutta/i], lat: 22.5726, lon: 88.3639 },
  { patterns: [/ahmedabad/i], lat: 23.0225, lon: 72.5714 },
  { patterns: [/surat/i], lat: 21.1702, lon: 72.8311 },
  { patterns: [/jaipur/i], lat: 26.9124, lon: 75.7873 },
  { patterns: [/lucknow/i], lat: 26.8467, lon: 80.9462 },
  { patterns: [/kanpur/i], lat: 26.4499, lon: 80.3319 },
  { patterns: [/patna/i], lat: 25.5941, lon: 85.1376 },
  { patterns: [/chandigarh/i], lat: 30.7333, lon: 76.7794 },
  { patterns: [/bhopal/i], lat: 23.2599, lon: 77.4126 },
  { patterns: [/indore/i], lat: 22.7196, lon: 75.8577 },
  { patterns: [/kochi/i, /cochin/i], lat: 9.9312, lon: 76.2673 },
  { patterns: [/thiruvananthapuram/i, /trivandrum/i], lat: 8.5241, lon: 76.9366 },
  { patterns: [/coimbatore/i], lat: 11.0168, lon: 76.9558 },
  { patterns: [/visakhapatnam/i, /vizag/i], lat: 17.6868, lon: 83.2185 },
  { patterns: [/bhubaneswar/i], lat: 20.2961, lon: 85.8245 },
  { patterns: [/guwahati/i], lat: 26.1445, lon: 91.7362 },
  { patterns: [/raipur/i], lat: 21.2514, lon: 81.6296 },
  { patterns: [/ranchi/i], lat: 23.3441, lon: 85.3096 },
  { patterns: [/dehradun/i], lat: 30.3165, lon: 78.0322 },
  { patterns: [/goa/i, /panaji/i], lat: 15.4909, lon: 73.8278 },
  { patterns: [/maharashtra/i], lat: 19.0760, lon: 72.8777 },
  { patterns: [/karnataka/i], lat: 12.9716, lon: 77.5946 },
  { patterns: [/tamil nadu/i], lat: 13.0827, lon: 80.2707 },
  { patterns: [/telangana/i], lat: 17.3850, lon: 78.4867 },
  { patterns: [/west bengal/i], lat: 22.5726, lon: 88.3639 },
  { patterns: [/gujarat/i], lat: 23.0225, lon: 72.5714 },
  { patterns: [/uttar pradesh/i], lat: 26.8467, lon: 80.9462 },
  { patterns: [/haryana/i], lat: 28.4595, lon: 77.0266 },
  { patterns: [/bihar/i], lat: 25.5941, lon: 85.1376 },
  { patterns: [/rajasthan/i], lat: 26.9124, lon: 75.7873 },
  { patterns: [/punjab/i], lat: 30.7333, lon: 76.7794 },
  { patterns: [/kerala/i], lat: 9.9312, lon: 76.2673 },
];

function getOfflineCityCoordinates(addressText) {
  if (!addressText || typeof addressText !== 'string') return null;
  const match = KNOWN_INDIAN_COORDINATES.find((item) =>
    item.patterns.some((pattern) => pattern.test(addressText))
  );
  return match ? { lat: match.lat, lon: match.lon } : null;
}

/**
 * Forward-geocodes a free-text address/location string into { lat, lon }.
 * Falls back to offline regional coordinate centroids if the API key is unconfigured.
 */
async function geocodeAddress(addressText) {
  if (!addressText || typeof addressText !== 'string') return null;

  if (env.geoapifyApiKey) {
    try {
      const response = await axios.get(GEOAPIFY_BASE_URL, {
        params: { text: addressText, apiKey: env.geoapifyApiKey, limit: 1, format: 'json' },
        timeout: 5000,
      });
      const first = response.data?.results?.[0];
      if (first && Number.isFinite(first.lat) && Number.isFinite(first.lon)) {
        return { lat: first.lat, lon: first.lon };
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[geocodingService] live geocode failed, using offline fallback:', err.message);
    }
  }

  // Fallback to offline lookup
  const offlineCoords = getOfflineCityCoordinates(addressText);
  if (offlineCoords) {
    return offlineCoords;
  }
  return null;
}

/** Haversine distance in km between two {lat, lon} points. */
function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

module.exports = { geocodeAddress, distanceKm };
