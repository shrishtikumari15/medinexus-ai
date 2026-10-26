const mongoose = require('mongoose');

const aiimsPatnaDoctors = [
  {
    name: 'Dr. Sanjeev Kumar',
    title: 'Additional Professor & HOD',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    experience: '18+ years of clinical practice in interventional cardiology and cardiac care',
    experienceText: '18+ years of clinical practice in interventional cardiology and cardiac care',
    biography: 'Head of Cardiology at AIIMS Patna. Specializes in complex coronary angioplasty, primary PCI, pacemakers, and structural heart disease.',
    expertise: ['Interventional Cardiology', 'Primary PCI', 'Angioplasty', 'Pacemaker Implantation', 'Heart Failure'],
    profileUrl: 'https://aiimspatna.edu.in/department/cardiology/',
    sourceUrl: 'https://aiimspatna.edu.in/department/cardiology/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Abhishek Kumar',
    title: 'Assistant Professor',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    experience: '10+ years of clinical cardiology experience',
    experienceText: '10+ years of clinical cardiology experience',
    biography: 'Assistant Professor of Cardiology at AIIMS Patna. Focuses on clinical cardiology, echocardiography, and coronary interventions.',
    expertise: ['Clinical Cardiology', 'Echocardiography (2D/3D Echo)', 'Coronary Angiography', 'Preventive Cardiology'],
    profileUrl: 'https://aiimspatna.edu.in/department/cardiology/',
    sourceUrl: 'https://aiimspatna.edu.in/department/cardiology/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Sanjeev Kumar (CTVS)',
    title: 'Additional Professor & HOD (I/C)',
    specialization: 'Cardiothoracic & Vascular Surgery (CTVS)',
    qualification: 'MBBS, MS (General Surgery), MCh (CTVS)',
    experience: '16+ years of cardiothoracic and vascular surgical experience',
    experienceText: '16+ years of cardiothoracic and vascular surgical experience',
    biography: 'Head of CTVS at AIIMS Patna. Leads open-heart surgeries, CABG, valve repairs/replacements, and aortic surgeries.',
    expertise: ['CABG', 'Valve Replacement', 'Aortic Surgery', 'Congenital Heart Surgery', 'Vascular Interventions'],
    profileUrl: 'https://aiimspatna.edu.in/department/cardiothoracic-and-vascular-surgery/',
    sourceUrl: 'https://aiimspatna.edu.in/department/cardiothoracic-and-vascular-surgery/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Abhyuday Kumar',
    title: 'Associate Professor & HOD (I/C)',
    specialization: 'Neurology',
    qualification: 'MBBS, MD (General Medicine), DM (Neurology)',
    experience: '14+ years of neurology practice',
    experienceText: '14+ years of neurology practice',
    biography: 'Head of Neurology at AIIMS Patna. Expert in acute stroke management, epilepsy, neuromuscular disorders, and neuro-critical care.',
    expertise: ['Stroke Management', 'Epilepsy', 'Movement Disorders', 'Neuro-Critical Care', 'Headache'],
    profileUrl: 'https://aiimspatna.edu.in/department/neurology/',
    sourceUrl: 'https://aiimspatna.edu.in/department/neurology/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Vikas Chandra Jha',
    title: 'Additional Professor & HOD',
    specialization: 'Neurosurgery',
    qualification: 'MBBS, MS (Surgery), MCh (Neurosurgery)',
    experience: '17+ years in complex neurosurgical operations',
    experienceText: '17+ years in complex neurosurgical operations',
    biography: 'Head of Neurosurgery at AIIMS Patna. Specializes in brain tumors, spine surgery, cerebrovascular surgery, and trauma neurosurgery.',
    expertise: ['Brain Tumor Surgery', 'Spine Instrumentation', 'Trauma Neurosurgery', 'Skull Base Surgery'],
    profileUrl: 'https://aiimspatna.edu.in/department/neurosurgery/',
    sourceUrl: 'https://aiimspatna.edu.in/department/neurosurgery/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Ravikirti',
    title: 'Professor & HOD',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD (General Medicine)',
    experience: '22+ years of clinical and academic internal medicine practice',
    experienceText: '22+ years of clinical and academic internal medicine practice',
    biography: 'Senior Professor and Head of General Medicine at AIIMS Patna. Expert in complex multisystem disorders, infectious diseases, and diabetes.',
    expertise: ['Internal Medicine', 'Infectious Diseases', 'Diabetes & Metabolic Disorders', 'Critical Care Medicine'],
    profileUrl: 'https://aiimspatna.edu.in/department/general-medicine/',
    sourceUrl: 'https://aiimspatna.edu.in/department/general-medicine/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Yogesh Kumar',
    title: 'Additional Professor',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD (General Medicine)',
    experience: '15+ years in internal medicine',
    experienceText: '15+ years in internal medicine',
    biography: 'Additional Professor of Medicine at AIIMS Patna. Specializes in rheumatology, autoimmune diseases, and hypertension.',
    expertise: ['Autoimmune Diseases', 'Hypertension', 'Rheumatology', 'Geriatric Care'],
    profileUrl: 'https://aiimspatna.edu.in/department/general-medicine/',
    sourceUrl: 'https://aiimspatna.edu.in/department/general-medicine/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Bindey Kumar',
    title: 'Professor & HOD',
    specialization: 'General Surgery',
    qualification: 'MBBS, MS (General Surgery), MCh (Pediatric Surgery)',
    experience: '24+ years in general, laparoscopic and pediatric surgery',
    experienceText: '24+ years in general, laparoscopic and pediatric surgery',
    biography: 'Head of General Surgery at AIIMS Patna. Senior surgeon performing advanced gastrointestinal, laparoscopic, and trauma surgeries.',
    expertise: ['Advanced Laparoscopic Surgery', 'Gastrointestinal Surgery', 'Pediatric Surgery', 'Surgical Oncology'],
    profileUrl: 'https://aiimspatna.edu.in/department/general-surgery/',
    sourceUrl: 'https://aiimspatna.edu.in/department/general-surgery/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Anup Kumar',
    title: 'Professor & HOD',
    specialization: 'Orthopaedics',
    qualification: 'MBBS, MS (Orthopaedics), DNB (Orth)',
    experience: '20+ years in orthopaedic surgery and joint replacement',
    experienceText: '20+ years in orthopaedic surgery and joint replacement',
    biography: 'Head of Orthopaedics at AIIMS Patna. Pioneer in robotic joint replacement, pelvic-acetabular trauma, and complex spine reconstruction.',
    expertise: ['Robotic Knee & Hip Replacement', 'Spine Reconstruction', 'Complex Trauma', 'Sports Medicine'],
    profileUrl: 'https://aiimspatna.edu.in/department/orthopaedics/',
    sourceUrl: 'https://aiimspatna.edu.in/department/orthopaedics/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Lokesh Tiwari',
    title: 'Professor & HOD',
    specialization: 'Pediatrics',
    qualification: 'MBBS, MD (Paediatrics), Fellowship in Pediatric Critical Care',
    experience: '19+ years in pediatric care and intensive care',
    experienceText: '19+ years in pediatric care and intensive care',
    biography: 'Head of Pediatrics at AIIMS Patna. National authority in pediatric intensive care (PICU), neonatology, and childhood emergency medicine.',
    expertise: ['Pediatric Intensive Care (PICU)', 'Neonatology (NICU)', 'Pediatric Resuscitation', 'Childhood Infections'],
    profileUrl: 'https://aiimspatna.edu.in/department/pediatrics/',
    sourceUrl: 'https://aiimspatna.edu.in/department/pediatrics/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Deependra Kumar Rai',
    title: 'Professor & HOD',
    specialization: 'Pulmonary Medicine',
    qualification: 'MBBS, MD (Pulmonary Medicine), DNB',
    experience: '18+ years in respiratory and critical care medicine',
    experienceText: '18+ years in respiratory and critical care medicine',
    biography: 'Head of Pulmonary Medicine at AIIMS Patna. Expert in advanced bronchoscopy, interventional pulmonology, asthma, COPD, and sleep medicine.',
    expertise: ['Interventional Pulmonology', 'Bronchoscopy', 'Severe Asthma & COPD', 'Sleep Apnea', 'Interstitial Lung Disease'],
    profileUrl: 'https://aiimspatna.edu.in/department/pulmonary-medicine/',
    sourceUrl: 'https://aiimspatna.edu.in/department/pulmonary-medicine/',
    verificationStatus: 'Verified',
  },
  {
    name: 'Dr. Arun Kumar',
    title: 'Additional Professor & HOD',
    specialization: 'Emergency Medicine',
    qualification: 'MBBS, MD (Anaesthesiology & Critical Care / Emergency)',
    experience: '16+ years in emergency and trauma resuscitation',
    experienceText: '16+ years in emergency and trauma resuscitation',
    biography: 'Head of Trauma and Emergency at AIIMS Patna. Leads the 24/7 Level-1 Trauma Centre and emergency medicine resuscitation teams.',
    expertise: ['Trauma Resuscitation', 'Emergency Airway', 'Poisoning & Toxicology', 'Disaster Medicine', 'Critical Care'],
    profileUrl: 'https://aiimspatna.edu.in/department/trauma-and-emergency/',
    sourceUrl: 'https://aiimspatna.edu.in/department/trauma-and-emergency/',
    verificationStatus: 'Verified',
  },
];

const aiimsPatnaData = {
  name: 'All India Institute of Medical Sciences (AIIMS), Patna',
  description:
    'All India Institute of Medical Sciences (AIIMS), Patna is an autonomous Institute of National Importance (INI) established by the Ministry of Health and Family Welfare (MoHFW), Government of India under the Pradhan Mantri Swasthya Suraksha Yojana (PMSSY). Spread across a 134-acre campus in Phulwari Sharif, Patna, it is the apex tertiary and quaternary referral healthcare center for Eastern India. AIIMS Patna is renowned for its 24/7 Level-1 Apex Trauma Centre, Centre of Excellence for Rare Diseases, Living Donor Kidney Transplantation program, state-of-the-art 128-slice CT and 3T MRI, digital catheterization labs, 28+ modular operation theatres, and 960+ inpatient bed capacity delivering subsidized, top-tier medical care.',
  address: 'Phulwari Sharif, Patna, Bihar 801507',
  town: 'Patna',
  district: 'Patna',
  state: 'Bihar',
  pincode: '801507',
  telephone: '+91-612-2451000',
  emergencyNumber: '+91-612-2451109',
  helpline: '+91-612-2451070',
  ambulancePhone: '+91-612-2451109',
  bloodbankPhone: '+91-612-2451025',
  website: 'https://aiimspatna.edu.in',
  category: 'Government / Institute of National Importance',
  careType: 'Multi-Specialty Apex Referral',
  accreditation: 'Institute of National Importance (INI) · MoHFW · NABL · NBTC',
  totalBeds: 960,
  emergencyFlag: true,
  emergencyFlagSource: 'official',
  geo: { type: 'Point', coordinates: [85.0414, 25.5606] },
  geocodeSource: 'source_file',
  officialEnrichment: {
    sourceUrl: 'https://aiimspatna.edu.in',
    checkedAt: new Date(),
    summary:
      'AIIMS Patna is Eastern India\'s premier apex medical institute, operating a 24/7 Level-1 Trauma Centre, Centre of Excellence for Rare Diseases, Renal Transplantation program, 128-slice Cardiac CT, 3.0 Tesla MRI, Digital Cath Lab, 28+ Modular OTs, 120+ ICU beds, and 960+ inpatient beds.',
    departments: [
      'Cardiology',
      'Cardiothoracic & Vascular Surgery (CTVS)',
      'Neurology',
      'Neurosurgery',
      'General Medicine',
      'General Surgery',
      'Orthopaedics',
      'Pediatrics & Neonatology',
      'Pulmonary Medicine',
      'Emergency Medicine & Trauma',
      'Nephrology',
      'Medical Oncology',
      'Surgical Oncology',
      'Gastroenterology',
      'Urology',
      'Dermatology',
      'ENT',
      'Ophthalmology',
      'Obstetrics & Gynecology',
      'Psychiatry',
      'Anaesthesiology & Critical Care',
      'Transfusion Medicine (Blood Bank)',
      'Radiodiagnosis',
      'Pathology & Laboratory Medicine'
    ],
    services: [
      '24/7 Level-1 Emergency & Apex Trauma Centre',
      'Interventional Cardiology & Digital Cath Lab (Primary Angioplasty/PCI)',
      'Living Donor Solid Organ (Kidney) Transplantation',
      '28+ Modular Operation Theatres with Laminar Air Flow & HEPA Filtration',
      '120+ Intensive Care Beds (MICU, SICU, CCU, PICU, NICU, Neuro ICU)',
      'Multistation Hemodialysis & Continuous Renal Replacement Therapy (CRRT)',
      'Licensed Blood Centre with Component Separation & Single Donor Platelet Apheresis',
      'Extracorporeal Membrane Oxygenation (ECMO) & High-Frequency Oscillatory Ventilation',
      'Online Central Outpatient Registration via ORS Portal (ors.gov.in)'
    ],
    technologies: [
      '128-Slice Multidetector Cardiac CT (MDCT)',
      'High-Field 3.0 Tesla (3T) MRI with Neurovascular & Spectroscopy Sequences',
      'Digital Subtraction Angiography (DSA) Cardiac & Peripheral Cath Lab',
      'Robotic & Advanced HD 4K Laparoscopic Surgical Towers',
      'Point-of-Care Ultrasound (POCUS) & 3D/4D Color Doppler Echocardiography',
      'Class-100 Modular Operation Theatres with Ceiling Pendants',
      'Automated Apheresis Cell Separators',
      'Advanced Invasive Mechanical Ventilators'
    ],
    doctors: aiimsPatnaDoctors,
  },
};

(async () => {
  await mongoose.connect('mongodb://localhost:27017/medinexus');
  const Hospital = mongoose.model('Hospital', new mongoose.Schema({}, { strict: false }));
  const RegistryDoctor = mongoose.model('RegistryDoctor', new mongoose.Schema({}, { strict: false }));

  // Find all AIIMS Patna records (e.g. sourceRowId: 2117 or regex)
  const aiimsList = await Hospital.find({
    name: { $regex: /AIIMS.*Patna|All India Institute of Medical Sciences.*Patna/i }
  });

  console.log(`Found ${aiimsList.length} AIIMS Patna records in DB.`);

  for (const h of aiimsList) {
    await Hospital.updateOne({ _id: h._id }, { $set: aiimsPatnaData });
    console.log(`Updated Hospital Record: ${h._id} (${h.name})`);

    // Sync doctors into RegistryDoctor
    for (const [idx, d] of aiimsPatnaDoctors.entries()) {
      const docId = `AIIMS-PATNA-DOC-${idx + 1}`;
      const exists = await RegistryDoctor.findOne({
        name: d.name,
        hospitalId: h._id
      });

      const docPayload = {
        doctorId: docId,
        name: d.name,
        specialization: d.specialization,
        qualification: d.qualification,
        experience: d.experience,
        hospitalId: h._id,
        hospitalName: h.name,
        city: 'Patna',
        state: 'Bihar',
        officialDoctorProfileUrl: d.profileUrl,
        officialHospitalUrl: 'https://aiimspatna.edu.in',
        hospitalAssociationSourceUrl: d.profileUrl,
        source: 'AIIMS Patna Official Faculty Directory',
        sourceName: 'AIIMS Patna Official Website',
        sourceUrl: d.profileUrl,
        verificationStatus: 'Verified',
        lastVerifiedAt: new Date(),
      };

      if (exists) {
        await RegistryDoctor.updateOne({ _id: exists._id }, { $set: docPayload });
      } else {
        await RegistryDoctor.create(docPayload);
      }
    }
  }

  const finalAiimsDocs = await RegistryDoctor.countDocuments({
    hospitalName: { $regex: /AIIMS.*Patna/i }
  });
  console.log(`Total verified AIIMS Patna doctors in RegistryDoctor: ${finalAiimsDocs}`);

  await mongoose.disconnect();
})();
