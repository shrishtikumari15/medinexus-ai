from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['medinexus']

doc_hids = db.registrydoctors.distinct('hospitalId')
for hid in doc_hids:
    h = db.hospitals.find_one({'_id': hid})
    if h:
        print(str(h['_id']) + " | " + str(h.get('name')) + " | OpID: " + str(h.get('operationalHospitalId')) + " | State: " + str(h.get('state')) + " | District: " + str(h.get('district')) + " | Specs: " + str(h.get('specialties')))
