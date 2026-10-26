const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');

const hospitalQueries = [
  { label: 'Apollo Bannerghatta Bangalore', state: /karnataka/i, dist: /bengaluru/i, name: /apollo/i, loc: /bannerghatta/i },
  { label: 'Apollo Seshadripuram Bangalore', state: /karnataka/i, dist: /bengaluru/i, name: /apollo/i, loc: /seshadripuram/i },
  { label: 'Apollo Jayanagar Bangalore', state: /karnataka/i, dist: /bengaluru/i, name: /apollo/i, loc: /jayanagar|tilak/i },
  { label: 'Apollo BGS Mysore', state: /karnataka/i, dist: /mys/i, name: /apollo|bgs/i },
  { label: 'Fortis BG Road Bangalore', state: /karnataka/i, dist: /bengaluru/i, name: /fortis/i, loc: /bannerghatta|bg road/i },
  { label: 'Fortis CG Road Bangalore (Chord Rd / Cunningham)', state: /karnataka/i, dist: /bengaluru/i, name: /fortis/i, loc: /chord|mahalakshmipuram|cunningham/i },
  { label: 'Fortis Kalyan Mumbai/Thane', state: /maharashtra/i, $or: [{ name: /fortis/i }, { district: /mumbai|thane/i }] },
  { label: 'Mazumdar Shaw Bangalore', state: /karnataka/i, dist: /bengaluru/i, name: /mazumdar/i },
  { label: 'Narayana Multispeciality HSR Bangalore', state: /karnataka/i, dist: /bengaluru/i, name: /narayana/i, loc: /hsr/i },
  { label: 'Narayana Health Bangalore (Hrudayalaya / Bommasandra)', state: /karnataka/i, dist: /bengaluru/i, name: /narayana/i },
  { label: 'Apollo Delhi', state: /delhi/i, name: /apollo/i },
  { label: 'Apollo Guwahati', state: /assam/i, name: /apollo/i },
  { label: 'Apollo Secunderabad Hyderabad', state: /telangana|andhra/i, name: /apollo/i, loc: /secunderabad/i },
  { label: 'Apollo DRDO Kanchanbagh Hyderabad', state: /telangana|andhra/i, name: /apollo/i, loc: /drdo|kanchanbagh/i },
  { label: 'Apollo Jubilee Hills Hyderabad', state: /telangana|andhra/i, name: /apollo/i, loc: /jubilee/i },
  { label: 'Apollo Hyderguda Hyderabad', state: /telangana|andhra/i, name: /apollo/i, loc: /hyderguda/i },
  { label: 'Apollo Lucknow', state: /uttar pradesh/i, name: /apollo/i, loc: /lucknow/i },
  { label: 'Apollo Proton Cancer Centre Chennai', state: /tamil nadu/i, name: /apollo/i, loc: /proton|chennai/i },
  { label: 'Apollo Kolkata EM Bypass', state: /west bengal/i, name: /apollo/i, loc: /kolkata|canal|bypass/i },
  { label: 'Manipal Bangalore', state: /karnataka/i, dist: /bengaluru/i, name: /manipal/i }
];

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('Finding hospital matches in MongoDB:');
  for (const q of hospitalQueries) {
    const filter = { state: q.state, name: q.name };
    if (q.dist) filter.district = q.dist;
    if (q.loc) filter.$or = [{ location: q.loc }, { address: q.loc }, { name: q.loc }];
    const matches = await Hospital.find(filter).select('sourceRowId name state district town location address totalBeds specialties').limit(5).lean();
    console.log(`\n--- ${q.label} (Found ${matches.length}) ---`);
    matches.forEach(m => console.log(`  ID: ${m.sourceRowId} | ${m.name} | ${m.district} | Loc: ${m.location || m.address} | TotalBeds: ${m.totalBeds}`));
  }
  await mongoose.disconnect();
}

run().catch(console.error);
