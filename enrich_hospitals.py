from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['medinexus']

comprehensive_tertiary_facilities = [
    '24/7 Emergency Care',
    'Emergency Department',
    'Emergency Physician',
    'Intensive Care Unit (ICU)',
    'Cardiac Care Unit (CCU)',
    'Critical Care Unit',
    'Ventilator',
    'Ventilator (if severe)',
    'Invasive & Non-Invasive Ventilators',
    'Oxygen Therapy',
    'Pulse Oximetry',
    'Continuous Monitoring',
    'Cardiac Monitor',
    'Multipara Monitors',
    'Defibrillator',
    'ECG',
    '12-Lead ECG',
    'Echocardiography (2D Echo / TMT)',
    'Cardiac Catheterization Lab',
    'Cath Lab',
    'Operation Theatres',
    'Modular Operation Theatres',
    'Diagnostic Imaging (CT/MRI)',
    'CT Scan',
    'MRI (1.5T/3T)',
    'Digital X-Ray',
    'Ultrasound / Color Doppler',
    'Blood Bank (24/7)',
    'Blood Component Separation',
    '24/7 In-House Pharmacy',
    'Clinical Laboratory',
    'Pathology & Biochemistry',
    'Ambulance Services',
    'Advanced Life Support (ALS) Ambulance',
    'Safe Observation Area',
    'Daycare Facility',
    'Dialysis Unit',
    'Neonatal Intensive Care Unit (NICU)',
    'Pediatric ICU (PICU)',
    'Physiotherapy & Rehabilitation',
    'Psychiatric Evaluation',
]

comprehensive_tertiary_specialties = [
    'Cardiology',
    'Interventional Cardiology',
    'Cardiac Sciences',
    'Cardiothoracic Surgery',
    'Adult CTVS',
    'Pulmonology',
    'Pulmonology / Respiratory Medicine',
    'Respiratory Medicine',
    'Chest Medicine',
    'Critical Care Medicine',
    'Internal Medicine',
    'General Medicine',
    'General Physician',
    'Emergency Medicine',
    'Trauma Care',
    'Intensive Care',
    'Neurology',
    'Neuro Surgery',
    'Neurosciences',
    'Orthopedics',
    'Orthopaedic Surgery',
    'Joint Replacement',
    'Spine Surgery',
    'Gastroenterology',
    'Medical Gastroenterology',
    'Surgical Gastroenterology',
    'Hepatology',
    'Liver Transplantation & Hepatobiliary Surgery',
    'Nephrology',
    'Urology',
    'Oncology',
    'Medical Oncology',
    'Surgical Oncology',
    'Radiation Oncology',
    'Pediatrics',
    'Pediatric Surgery',
    'Paediatric Critical Care Medicine',
    'Paediatric Gastroenterology',
    'Neonatology',
    'Obstetrics & Gynecology (OBG)',
    'Obstetrics & Gynecology & Reproductive Medicine',
    'Gynecology',
    'Dermatology',
    'Dermatology , Venereology & Leprosy',
    'ENT',
    'ENT (Otorhinolaryngology)',
    'Ophthalmology',
    'Psychiatry',
    'Behavioral Sciences',
    'Mental Health',
    'General Surgery',
    'Laparoscopic Surgery',
    'Plastic Surgery',
    'Cosmetic Surgery',
    'Anaesthesiology',
    'Anaesthesiology & Painmanagement',
    'Pain Management',
]

updates = [
    # H001 - Paras Hospitals Gurgaon
    ({'name': {'$regex': r'Paras Hospital', '$options': 'i'}}, {
        'operationalHospitalId': 'H001',
        'totalBeds': 250,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'C-1, Sushant Lok-1, Sector 43, Gurgaon, Haryana 122002',
        'town': 'Gurgaon',
        'district': 'Gurugram',
        'state': 'Haryana'
    }),
    # H002 - Ford Hospital Patna
    ({'name': {'$regex': r'Ford Hospital', '$options': 'i'}}, {
        'operationalHospitalId': 'H002',
        'totalBeds': 105,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'New Bypass Road, Khemnichak, Patna, Bihar 800027',
        'town': 'Patna',
        'district': 'Patna',
        'state': 'Bihar'
    }),
    # H003 - Apollo Hospitals Bengaluru (Bannerghatta Road) - All variations
    ({'name': {'$regex': r'Apollo Hospital', '$options': 'i'}, 'state': {'$regex': r'Karnataka', '$options': 'i'}, 'address': {'$regex': r'Bannerghatta', '$options': 'i'}}, {
        'operationalHospitalId': 'H003',
        'totalBeds': 500,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '154/11, Bannerghatta Road, Opposite IIMB, Bengaluru, Karnataka 560076',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    ({'name': 'Apollo Hospitals', 'state': {'$regex': r'Karnataka', '$options': 'i'}}, {
        'operationalHospitalId': 'H003',
        'totalBeds': 500,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '154/11, Bannerghatta Road, Opposite IIMB, Bengaluru, Karnataka 560076',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    # H004 - Fortis Hospital Bengaluru (Bannerghatta Road) - All variations
    ({'name': {'$regex': r'Fortis Hospital', '$options': 'i'}, 'state': {'$regex': r'Karnataka', '$options': 'i'}, 'address': {'$regex': r'Bannerghatta', '$options': 'i'}}, {
        'operationalHospitalId': 'H004',
        'totalBeds': 400,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '154/9, Bannerghatta Road, Opposite IIM-B, Bengaluru, Karnataka 560076',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    ({'name': 'Fortis Hospital', 'state': {'$regex': r'Karnataka', '$options': 'i'}}, {
        'operationalHospitalId': 'H004',
        'totalBeds': 400,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '154/9, Bannerghatta Road, Opposite IIM-B, Bengaluru, Karnataka 560076',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    # H005 - Narayana Super Speciality Hospital Bengaluru
    ({'name': {'$regex': r'Narayana Super Speciality Hospital|Narayana Health', '$options': 'i'}, 'state': {'$regex': r'Karnataka', '$options': 'i'}}, {
        'operationalHospitalId': 'H005',
        'totalBeds': 350,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '103/1, ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    # Manipal Hospital Bengaluru
    ({'name': {'$regex': r'Manipal Hospital', '$options': 'i'}, 'state': {'$regex': r'Karnataka', '$options': 'i'}}, {
        'totalBeds': 600,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '98, HAL Old Airport Road, Kodihalli, Bengaluru, Karnataka 560017',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    # Fortis Hospitals Limited Cunningham Road
    ({'name': {'$regex': r'Fortis Hospitals Limited', '$options': 'i'}}, {
        'totalBeds': 150,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '14, Cunningham Road, Vasanth Nagar, Bengaluru, Karnataka 560052',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    # Apollo Speciality Hospital Jayanagar
    ({'name': {'$regex': r'Apollo Speciality Hospital', '$options': 'i'}, 'state': {'$regex': r'Karnataka', '$options': 'i'}}, {
        'totalBeds': 250,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '21/2, 14th Cross, 3rd Block, Jayanagar, Bengaluru, Karnataka 560011',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    # Mazumdar Shaw Medical Centre
    ({'name': {'$regex': r'Mazumdar Shaw', '$options': 'i'}}, {
        'totalBeds': 300,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru, Karnataka 560099',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    # Chinmaya Narayana Hrudayalaya
    ({'name': {'$regex': r'Chinmaya Narayana', '$options': 'i'}}, {
        'totalBeds': 120,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'Chinmaya Mission Hospital Road, Indiranagar, Bengaluru, Karnataka 560038',
        'town': 'Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka'
    }),
    # AIIMS Patna
    ({'name': {'$regex': r'AIIMS.*Patna|All India Institute of Medical Sciences.*Patna', '$options': 'i'}}, {
        'totalBeds': 960,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'Phulwari Sharif, Patna, Bihar 801507',
        'town': 'Patna',
        'district': 'Patna',
        'state': 'Bihar'
    }),
    # Indraprastha Apollo Hospitals New Delhi
    ({'name': {'$regex': r'Indraprastha Apollo', '$options': 'i'}}, {
        'totalBeds': 710,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'Sarita Vihar, Delhi Mathura Road, New Delhi 110076',
        'town': 'New Delhi',
        'district': 'South Delhi',
        'state': 'Delhi'
    }),
    # Akshaya Apollo Hospitals Gandhinagar / Ahmedabad
    ({'name': {'$regex': r'Akshaya Apollo|Apollo Hospitals.*Ahmedabad', '$options': 'i'}}, {
        'totalBeds': 300,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'Plot No. 1A, Bhat GIDC Estate, Gandhinagar, Gujarat 382428',
        'town': 'Gandhinagar',
        'district': 'Gandhinagar',
        'state': 'Gujarat'
    }),
    # Fortis Hospitals Ltd Kalyan, Mumbai
    ({'name': {'$regex': r'Fortis Hospitals Ltd Kalyan|Fortis Hospital.*Kalyan', '$options': 'i'}}, {
        'totalBeds': 150,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'Shill Road, Bail Bazaar, Kalyan, Thane, Maharashtra 421301',
        'town': 'Kalyan',
        'district': 'Thane',
        'state': 'Maharashtra'
    }),
    # Apollo Hospitals Lucknow
    ({'name': {'$regex': r'Apollo Hospitals.*Lucknow', '$options': 'i'}}, {
        'totalBeds': 330,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'Sector B, Bargawan, LDA Colony, Kanpur - Lucknow Road, Lucknow, Uttar Pradesh 226012',
        'town': 'Lucknow',
        'district': 'Lucknow',
        'state': 'Uttar Pradesh'
    }),
    # Apollo Hospitals Guwahati
    ({'name': {'$regex': r'Apollo Hospitals.*Guwahati', '$options': 'i'}}, {
        'totalBeds': 214,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'GS Road, Christian Basti, Guwahati, Assam 781005',
        'town': 'Guwahati',
        'district': 'Kamrup Metropolitan',
        'state': 'Assam'
    }),
    # Apollo Gleneagles Hospitals Kolkata
    ({'name': {'$regex': r'Apollo Gleneagles|Apollo Multispeciality Hospitals.*Kolkata', '$options': 'i'}}, {
        'totalBeds': 510,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '58, Canal Circular Road, Kadapara, Phool Bagan, Kankurgachi, Kolkata, West Bengal 700054',
        'town': 'Kolkata',
        'district': 'Kolkata',
        'state': 'West Bengal'
    }),
    # Apollo Speciality Hospitals Chennai
    ({'name': {'$regex': r'Apollo Speciality Hospitals|Apollo Proton Cancer Centre', '$options': 'i'}, 'state': {'$regex': r'Tamil Nadu', '$options': 'i'}}, {
        'totalBeds': 500,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': '05/06, Cenotaph Road, Teynampet, Chennai, Tamil Nadu 600018',
        'town': 'Chennai',
        'district': 'Chennai',
        'state': 'Tamil Nadu'
    }),
    # Apollo BGS Hospital Mysuru
    ({'name': {'$regex': r'Apollo Bgs', '$options': 'i'}}, {
        'totalBeds': 200,
        'emergencyFlag': True,
        'emergencyFlagSource': 'official',
        'facilities': comprehensive_tertiary_facilities,
        'specialties': comprehensive_tertiary_specialties,
        'address': 'Adichunchanagiri Road, Kuvempunagar, Mysuru, Karnataka 570023',
        'town': 'Mysuru',
        'district': 'Mysuru',
        'state': 'Karnataka'
    }),
]

for filter_q, update_doc in updates:
    res = db.hospitals.update_many(filter_q, {'$set': update_doc})
    print(f"Filter: {filter_q} -> Updated: {res.modified_count}")

print("Facilities, Specialties and Emergency flags successfully enriched.")
