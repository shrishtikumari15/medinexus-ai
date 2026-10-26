const CITY_ALIASES = [
  ['gurugram', 'gurgaon'],
  ['bengaluru', 'bangalore'],
  ['mysuru', 'mysore'],
  ['mangaluru', 'mangalore'],
  ['hubballi', 'hubli'],
  ['belagavi', 'belgaum'],
  ['thiruvananthapuram', 'trivandrum'],
  ['kozhikode', 'calicut'],
  ['kochi', 'cochin'],
  ['panaji', 'panjim'],
  ['prayagraj', 'allahabad'],
  ['varanasi', 'banaras', 'benares'],
  ['vadodara', 'baroda'],
  ['mumbai', 'bombay'],
  ['kolkata', 'calcutta'],
  ['chennai', 'madras'],
  ['pune', 'poona'],
  ['bhubaneswar', 'bhubaneshwar'],
  ['visakhapatnam', 'vizag'],
  ['tiruchirappalli', 'trichy'],
  ['thoothukudi', 'tuticorin'],
  ['thrissur', 'trichur'],
  ['kollam', 'quilon'],
  ['delhi', 'new delhi'],
];

function getCityAliases(value) {
  const city = String(value || '').trim();
  if (!city) return [];
  const normalized = city.toLowerCase().replace(/\s+/g, ' ');
  return CITY_ALIASES.find((aliases) => aliases.includes(normalized)) || [city];
}

module.exports = { getCityAliases };