from pymongo import MongoClient
import re

client = MongoClient('mongodb://localhost:27017')
db = client['medinexus']

req_specs = ['Cardiology']
location_text = 'Bengaluru, Karnataka'

# 1. Specialty terms
specialty_terms = ['cardiology', 'cardiac', 'heart']
spec_regexes = [re.compile(t, re.I) for t in specialty_terms]

# 2. Verified doctors matching specialty
verified_docs = list(db.registrydoctors.find({'verificationStatus': 'Verified'}))
matching_hosp_ids = set()
for d in verified_docs:
    dspec = d.get('specialization', '')
    if any(r.search(dspec) for r in spec_regexes):
        matching_hosp_ids.add(d.get('hospitalId'))

print(f"Hospitals with verified doctors for {req_specs}: {len(matching_hosp_ids)}")

# 3. Location matching regexes
loc_tokens = ['bengaluru', 'karnataka', 'bangalore']
loc_regexes = [re.compile(t, re.I) for t in loc_tokens]

def is_loc_match(h):
    combined = f"{h.get('state', '')} {h.get('district', '')} {h.get('town', '')} {h.get('address', '')}"
    return any(r.search(combined) for r in loc_regexes)

# 4. Priority hospitals query
priority_hospitals = list(db.hospitals.find({
    '$or': [
        {'_id': {'$in': list(matching_hosp_ids)}},
        {'operationalHospitalId': {'$in': ['H001', 'H002', 'H003', 'H004', 'H005']}}
    ]
}))

local_priority = [h for h in priority_hospitals if is_loc_match(h)]
other_priority = [h for h in priority_hospitals if not is_loc_match(h)]

print(f"Local priority hospitals in Bengaluru: {len(local_priority)}")
for h in local_priority:
    docs = [d for d in verified_docs if d.get('hospitalId') == h['_id'] and any(r.search(d.get('specialization', '')) for r in spec_regexes)]
    print(f" - {h.get('name')} | OpID: {h.get('operationalHospitalId')} | TotalBeds: {h.get('totalBeds')} | Matching Docs: {len(docs)}")
