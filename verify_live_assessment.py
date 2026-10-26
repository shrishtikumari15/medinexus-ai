import requests
import jwt
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta

client = MongoClient('mongodb://localhost:27017')
db = client['medinexus']
user = db.users.find_one({'email': 'shrishtikumari1505@gmail.com'}) or db.users.find_one({'role': 'user'})

secret = 'medinexus_dev_secret_change_this'
payload = {
    'id': str(user['_id']),
    'role': user.get('role', 'user'),
    'exp': datetime.now(timezone.utc) + timedelta(days=1)
}
token = jwt.encode(payload, secret, algorithm='HS256')
headers = {'Authorization': f'Bearer {token}'}

BASE_URL = 'http://localhost:5000/api/v1'

# Run assessment with symptoms and location Bengaluru
assessment_payload = {
    'chiefComplaint': 'Severe left-sided chest pain radiating to left arm, shortness of breath',
    'locationText': 'Bengaluru, Karnataka',
    'temperature': 98.6,
    'heartrate': 98,
    'resprate': 18,
    'o2sat': 96,
    'sbp': 130,
    'dbp': 85,
    'pain': 8,
}

res = requests.post(f"{BASE_URL}/assessments", json=assessment_payload, headers=headers)
print("Assessment HTTP Status:", res.status_code)
if res.status_code != 201:
    print(res.text)
    exit(1)

data = res.json().get('data', {})
rec = data.get('recommendation', {})
rankings = rec.get('hospitalRankings', [])
print(f"Total Ranked Hospitals: {len(rankings)}")

for i, r in enumerate(rankings[:5]):
    h = r.get('hospitalId', {})
    h_name = h.get('name') if isinstance(h, dict) else h
    h_city = h.get('town') or h.get('district') if isinstance(h, dict) else 'N/A'
    h_state = h.get('state') if isinstance(h, dict) else 'N/A'
    h_addr = h.get('address') if isinstance(h, dict) else 'N/A'
    
    beds = r.get('bedAvailability', {})
    wait = r.get('expectedWaitMinutes')
    docs = r.get('doctors', [])
    
    print(f"\n#{i+1}: {h_name} (Score: {r.get('score')})")
    print(f"  Location: {h_addr}, {h_city}, {h_state}")
    print(f"  Beds: Total={beds.get('totalBeds')}, Available={beds.get('availableBeds')}, Occupied={beds.get('occupiedBeds')}, Source={beds.get('source')}")
    print(f"  Estimated Waiting Time: {wait} minutes (DataMode: {r.get('waitingTimeDataMode')})")
    print(f"  Verified Doctors: {len(docs)}")
    for d in docs[:3]:
        print(f"    - {d.get('name')} | {d.get('specialization')} | {d.get('qualification')} | Exp: {d.get('experience')} | Status: {d.get('verificationStatus')}")
