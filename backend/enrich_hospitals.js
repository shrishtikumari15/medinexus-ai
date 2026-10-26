const mongoose = require('mongoose');

const comprehensive_tertiary_facilities = [
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
];

const comprehensive_tertiary_specialties = [
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
];

const updates = [
  // H001 - Paras Hospitals Gurgaon
  {
    filter: { name: { $regex: /Paras Hospital/i } },
    set: {
      operationalHospitalId: 'H001',
      totalBeds: 250,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'C-1, Sushant Lok-1, Sector 43, Gurgaon, Haryana 122002',
      town: 'Gurgaon',
      district: 'Gurugram',
      state: 'Haryana'
    }
  },
  // H002 - Ford Hospital Patna
  {
    filter: { name: { $regex: /Ford Hospital/i } },
    set: {
      operationalHospitalId: 'H002',
      totalBeds: 105,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'New Bypass Road, Khemnichak, Patna, Bihar 800027',
      town: 'Patna',
      district: 'Patna',
      state: 'Bihar'
    }
  },
  // H003 - Apollo Hospitals Bengaluru (Bannerghatta Road) - All duplicates / variations
  {
    filter: { name: { $regex: /Apollo Hospital/i }, state: { $regex: /Karnataka/i }, address: { $regex: /Bannerghatta/i } },
    set: {
      operationalHospitalId: 'H003',
      totalBeds: 500,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '154/11, Bannerghatta Road, Opposite IIMB, Bengaluru, Karnataka 560076',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  {
    filter: { name: 'Apollo Hospitals', state: { $regex: /Karnataka/i } },
    set: {
      operationalHospitalId: 'H003',
      totalBeds: 500,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '154/11, Bannerghatta Road, Opposite IIMB, Bengaluru, Karnataka 560076',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  // H004 - Fortis Hospital Bengaluru (Bannerghatta Road) - All duplicates / variations
  {
    filter: { name: { $regex: /Fortis Hospital/i }, state: { $regex: /Karnataka/i }, address: { $regex: /Bannerghatta/i } },
    set: {
      operationalHospitalId: 'H004',
      totalBeds: 400,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '154/9, Bannerghatta Road, Opposite IIM-B, Bengaluru, Karnataka 560076',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  {
    filter: { name: 'Fortis Hospital', state: { $regex: /Karnataka/i } },
    set: {
      operationalHospitalId: 'H004',
      totalBeds: 400,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '154/9, Bannerghatta Road, Opposite IIM-B, Bengaluru, Karnataka 560076',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  // H005 - Narayana Super Speciality Hospital Bengaluru
  {
    filter: { name: { $regex: /Narayana Super Speciality Hospital|Narayana Health/i }, state: { $regex: /Karnataka/i } },
    set: {
      operationalHospitalId: 'H005',
      totalBeds: 350,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '103/1, ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  // Manipal Hospital Bengaluru
  {
    filter: { name: { $regex: /Manipal Hospital/i }, state: { $regex: /Karnataka/i } },
    set: {
      totalBeds: 600,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '98, HAL Old Airport Road, Kodihalli, Bengaluru, Karnataka 560017',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  // Fortis Hospitals Limited Cunningham Road
  {
    filter: { name: { $regex: /Fortis Hospitals Limited/i } },
    set: {
      totalBeds: 150,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '14, Cunningham Road, Vasanth Nagar, Bengaluru, Karnataka 560052',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  // Apollo Speciality Hospital Jayanagar
  {
    filter: { name: { $regex: /Apollo Speciality Hospital/i }, state: { $regex: /Karnataka/i } },
    set: {
      totalBeds: 250,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '21/2, 14th Cross, 3rd Block, Jayanagar, Bengaluru, Karnataka 560011',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  // Mazumdar Shaw Medical Centre
  {
    filter: { name: { $regex: /Mazumdar Shaw/i } },
    set: {
      totalBeds: 300,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru, Karnataka 560099',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  // Chinmaya Narayana Hrudayalaya
  {
    filter: { name: { $regex: /Chinmaya Narayana/i } },
    set: {
      totalBeds: 120,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'Chinmaya Mission Hospital Road, Indiranagar, Bengaluru, Karnataka 560038',
      town: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka'
    }
  },
  // AIIMS Patna
  {
    filter: { name: { $regex: /AIIMS.*Patna|All India Institute of Medical Sciences.*Patna/i } },
    set: {
      totalBeds: 960,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'Phulwari Sharif, Patna, Bihar 801507',
      town: 'Patna',
      district: 'Patna',
      state: 'Bihar'
    }
  },
  // Indraprastha Apollo Hospitals New Delhi
  {
    filter: { name: { $regex: /Indraprastha Apollo/i } },
    set: {
      totalBeds: 710,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'Sarita Vihar, Delhi Mathura Road, New Delhi 110076',
      town: 'New Delhi',
      district: 'South Delhi',
      state: 'Delhi'
    }
  },
  // Akshaya Apollo Hospitals Gandhinagar / Ahmedabad
  {
    filter: { name: { $regex: /Akshaya Apollo|Apollo Hospitals.*Ahmedabad/i } },
    set: {
      totalBeds: 300,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'Plot No. 1A, Bhat GIDC Estate, Gandhinagar, Gujarat 382428',
      town: 'Gandhinagar',
      district: 'Gandhinagar',
      state: 'Gujarat'
    }
  },
  // Fortis Hospitals Ltd Kalyan, Mumbai
  {
    filter: { name: { $regex: /Fortis Hospitals Ltd Kalyan|Fortis Hospital.*Kalyan/i } },
    set: {
      totalBeds: 150,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'Shill Road, Bail Bazaar, Kalyan, Thane, Maharashtra 421301',
      town: 'Kalyan',
      district: 'Thane',
      state: 'Maharashtra'
    }
  },
  // Apollo Hospitals Lucknow
  {
    filter: { name: { $regex: /Apollo Hospitals.*Lucknow/i } },
    set: {
      totalBeds: 330,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'Sector B, Bargawan, LDA Colony, Kanpur - Lucknow Road, Lucknow, Uttar Pradesh 226012',
      town: 'Lucknow',
      district: 'Lucknow',
      state: 'Uttar Pradesh'
    }
  },
  // Apollo Hospitals Guwahati
  {
    filter: { name: { $regex: /Apollo Hospitals.*Guwahati/i } },
    set: {
      totalBeds: 214,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'GS Road, Christian Basti, Guwahati, Assam 781005',
      town: 'Guwahati',
      district: 'Kamrup Metropolitan',
      state: 'Assam'
    }
  },
  // Apollo Gleneagles Hospitals Kolkata
  {
    filter: { name: { $regex: /Apollo Gleneagles|Apollo Multispeciality Hospitals.*Kolkata/i } },
    set: {
      totalBeds: 510,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '58, Canal Circular Road, Kadapara, Phool Bagan, Kankurgachi, Kolkata, West Bengal 700054',
      town: 'Kolkata',
      district: 'Kolkata',
      state: 'West Bengal'
    }
  },
  // Apollo Speciality Hospitals Chennai
  {
    filter: { name: { $regex: /Apollo Speciality Hospitals|Apollo Proton Cancer Centre/i }, state: { $regex: /Tamil Nadu/i } },
    set: {
      totalBeds: 500,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: '05/06, Cenotaph Road, Teynampet, Chennai, Tamil Nadu 600018',
      town: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu'
    }
  },
  // Apollo BGS Hospital Mysuru
  {
    filter: { name: { $regex: /Apollo Bgs/i } },
    set: {
      totalBeds: 200,
      emergencyFlag: true,
      emergencyFlagSource: 'official',
      facilities: comprehensive_tertiary_facilities,
      specialties: comprehensive_tertiary_specialties,
      address: 'Adichunchanagiri Road, Kuvempunagar, Mysuru, Karnataka 570023',
      town: 'Mysuru',
      district: 'Mysuru',
      state: 'Karnataka'
    }
  },
];

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));
  
  for (const { filter, set } of updates) {
    const res = await Hospital.updateMany(filter, { $set: set });
    console.log(`Filter: ${JSON.stringify(filter)} -> Updated: ${res.modifiedCount}`);
  }

  console.log('\nEnrichment complete.');
  await mongoose.disconnect();
})();
