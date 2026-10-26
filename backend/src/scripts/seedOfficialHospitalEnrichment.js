const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');

const parasEnrichment = {
  sourceUrl: 'https://www.parashospitals.com/gurugram/speciality/gastro-sciences',
  checkedAt: new Date('2026-09-30T00:00:00.000Z'),
  summary: 'Paras Health describes its Gurugram Gastro Sciences service as caring for digestive disorders, including inflammatory bowel disease, Crohn’s disease, and ulcerative colitis.',
  departments: ['Gastro Sciences', 'Gastroenterology', 'GI Surgery'],
  services: ['Endoscopy', 'Colonoscopy', 'Capsule Endoscopy', 'Endoscopic Ultrasound (EUS)', 'Upper GI Endoscopy'],
  technologies: ['128-slice CT', '4K Laparoscopy', 'FibroScan'],
  doctors: [
    {
      name: 'Dr. Rajnish Monga',
      title: 'Chairman - Gastroenterology',
      specialization: 'Gastroenterology and Hepatobiliary',
      qualification: 'MBBS, MD, DM',
      experienceText: 'Over 25 years (as stated by Paras Health)',
      biography: 'Paras Health lists ulcerative colitis management and Crohn’s disease management among his areas of expertise.',
      expertise: ['Ulcerative colitis management', 'Crohn’s disease management', 'ERCP', 'EUS', 'Therapeutic endoscopy'],
      profileUrl: 'https://www.parashospitals.com/gurugram/doctor-near-me/gastroenterologists/dr-rajnish-monga',
      bookingUrl: 'https://www.parashospitals.com/gurugram/book-doctor-slot/dr-rajnish-monga',
      sourceUrl: 'https://www.parashospitals.com/gurugram/doctor-near-me/gastroenterologists/dr-rajnish-monga',
    },
    {
      name: 'Dr. Sumit Bhatia',
      title: 'Director - Gastroenterology',
      specialization: 'Medical Gastroenterology',
      qualification: 'MBBS, MD - Internal Medicine, DM in Medical Gastroenterology',
      experienceText: '',
      biography: 'Paras Health lists inflammatory bowel diseases, ERCP, EUS, and therapeutic endoscopy among his areas of expertise.',
      expertise: ['Inflammatory bowel diseases', 'ERCP', 'EUS', 'Therapeutic endoscopy'],
      profileUrl: 'https://www.parashospitals.com/gurugram/doctor-near-me/gastroenterologists/dr-sumit-bhatia',
      sourceUrl: 'https://www.parashospitals.com/gurugram/doctor-near-me/gastroenterologists/dr-sumit-bhatia',
    },
  ],
};

const aiimsPatnaEnrichment = {
  sourceUrl: 'https://aiimspatna.edu.in/neurology',
  checkedAt: new Date('2026-09-30T00:00:00.000Z'),
  summary: 'AIIMS Patna describes Neurology as care for disorders of the brain, spinal cord, and peripheral nerves, and publishes department faculty and contact information.',
  departments: ['Neurology'],
  services: [],
  technologies: [],
  doctors: [
    {
      name: 'Dr. Anand Kumar Rai',
      title: 'Assistant Professor & Head - Neurology',
      specialization: 'Neurology',
      qualification: '',
      experienceText: 'AIIMS lists Assistant Professor at IGIMS, Patna from 30 May 2019 to present; Senior Resident [DM] at GMCH, Guwahati from 2012 to 2016; and earlier Senior Resident appointments at VMMC & Safdarjung Hospital and IMS-BHU.',
      biography: 'Listed as the Head of the AIIMS Patna Neurology department.',
      expertise: [],
      profileUrl: 'https://aiimspatna.edu.in/doctor/dr.anand11646@aiimspatna.org',
      sourceUrl: 'https://aiimspatna.edu.in/doctor/dr.anand11646@aiimspatna.org',
    },
    {
      name: 'Dr. Pratibha Prasad',
      title: 'Assistant Professor - Neurology',
      specialization: 'Neurology',
      qualification: '',
      experienceText: 'Not stated; the official profile shows an invalid start date.',
      biography: 'Listed as an Assistant Professor in the AIIMS Patna Neurology department.',
      expertise: [],
      profileUrl: 'https://aiimspatna.edu.in/doctor/pratibha13215@aiimspatna.org',
      sourceUrl: 'https://aiimspatna.edu.in/doctor/pratibha13215@aiimspatna.org',
    },
  ],
};

const apolloGandhinagarEnrichment = {
  sourceUrl: 'https://www.apollohospitals.com/hospitals/apollo-hospitals-international-ltd-ahmedabad',
  checkedAt: new Date('2026-10-01T00:00:00.000Z'),
  summary: 'Apollo describes Apollo Hospitals International Ltd, Ahmedabad as a multispecialty hospital and lists 24x7 emergency and critical care. Its official hospital page publishes the departments and links to its hospital-filtered doctor directory.',
  departments: [
    'Cardiac Sciences', 'Oncology', 'Neurology', 'Nephrology', 'Gastroenterology & Hepatology',
    'Gynecology', 'Pulmonology', 'Orthopaedics', 'Urology', 'Transplants', 'Critical Care',
    'Bariatric Surgery', 'Colorectal Surgery', 'Emergency Medicine', 'ENT', 'Pediatrics',
    'Cosmetology & Plastic Surgery', 'Internal Medicine',
  ],
  services: ['24x7 Emergency & Critical Care'],
  technologies: [],
  doctors: [
    {
      name: 'Dr Sameer Dani',
      specialization: 'Cardiology',
      qualification: 'MBBS; MD (Medicine); DM (Cardiology)',
      experienceText: '27+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-sameer-dani',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-sameer-dani',
    },
    {
      name: 'Dr Jayesh Prajapati',
      specialization: 'Cardiology',
      qualification: 'MBBS; MD (Medicine); DM (Cardiology)',
      experienceText: '19+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-jayesh-prajapati',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-jayesh-prajapati',
    },
    {
      name: 'Dr Sharad Jain',
      specialization: 'Cardiology',
      qualification: 'MBBS; MD (Medicine); DM (Cardiology)',
      experienceText: '21+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-sharad-jain',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-sharad-jain',
    },
    {
      name: 'Dr Hasit Joshi',
      specialization: 'Cardiology',
      qualification: 'MBBS; MD (Medicine); DM (Cardiology)',
      experienceText: '19+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-hasit-joshi',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-hasit-joshi',
    },
    {
      name: 'Dr Lal Daga',
      specialization: 'Cardiology',
      qualification: '',
      experienceText: '20+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-lal-daga',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-lal-daga',
    },
    {
      name: 'Dr Vinit Shah',
      specialization: 'Cardiology',
      qualification: '',
      experienceText: '20+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-vinit-shah',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-vinit-shah',
    },
    {
      name: 'Dr Subir Ghosh',
      specialization: 'Cardiology',
      qualification: '',
      experienceText: '16+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-subir-ghosh',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-subir-ghosh',
    },
    {
      name: 'Dr Rashmit Pandya',
      specialization: 'Cardiology',
      qualification: '',
      experienceText: '13+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-rashmit-pandya',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-rashmit-pandya',
    },
    {
      name: 'Dr Arvind Singh',
      specialization: 'Cardiology',
      qualification: '',
      experienceText: '11+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-arvind-singh',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-arvind-singh',
    },
    {
      name: 'Dr Chirag M Patel',
      specialization: 'Cardiology',
      qualification: '',
      experienceText: '10+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-chirag-m-patel',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-chirag-m-patel',
    },
    {
      name: 'Dr Jaykumar Sanghavi',
      specialization: 'Cardiology',
      qualification: '',
      experienceText: '4+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-jay-kumar-sanghavi',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-jay-kumar-sanghavi',
    },
    {
      name: 'Dr Kulin Sheth',
      specialization: 'Cardiology',
      qualification: '',
      experienceText: '4+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-kulin-sheth',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiologist/ahmedabad/dr-kulin-sheth',
    },
    {
      name: 'Dr Mahpaekar Mashaddi',
      specialization: 'Interventional Cardiology',
      qualification: 'MBBS; MD (Medicine); DM (Cardiology)',
      experienceText: '10+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/interventional-cardiologist/ahmedabad/dr-mahpaekar-mashaddi',
      sourceUrl: 'https://www.apollohospitals.com/doctors/interventional-cardiologist/ahmedabad/dr-mahpaekar-mashaddi',
    },
    {
      name: 'Dr Pavan Patel',
      specialization: 'Pediatric Cardiology',
      qualification: '',
      experienceText: '10+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/pediatric-cardiologist/ahmedabad/dr-pavan-patel',
      sourceUrl: 'https://www.apollohospitals.com/doctors/pediatric-cardiologist/ahmedabad/dr-pavan-patel',
    },
    {
      name: 'Dr Deepti Kakkar',
      specialization: 'Pediatric Cardiac Surgery',
      qualification: '',
      experienceText: '12+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/paediatric-cardiac-surgery/ahmedabad/dr-deepti-kakkar',
      sourceUrl: 'https://www.apollohospitals.com/doctors/paediatric-cardiac-surgery/ahmedabad/dr-deepti-kakkar',
    },
    {
      name: 'Dr Utpal Shah',
      specialization: 'Cardiothoracic and Vascular Surgery',
      qualification: '',
      experienceText: '28+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiothoracic-and-vascular-surgery/ahmedabad/dr-utpal-shah',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiothoracic-and-vascular-surgery/ahmedabad/dr-utpal-shah',
    },
    {
      name: 'Dr Sudhir Adalti',
      specialization: 'Cardiothoracic and Vascular Surgery',
      qualification: '',
      experienceText: '23+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiothoracic-and-vascular-surgery/ahmedabad/dr-sudhir-adalti',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiothoracic-and-vascular-surgery/ahmedabad/dr-sudhir-adalti',
    },
    {
      name: 'Dr Ishan Gohil',
      specialization: 'Cardiothoracic and Vascular Surgery',
      qualification: '',
      experienceText: '6+ years (as listed by Apollo)',
      profileUrl: 'https://www.apollohospitals.com/doctors/cardiothoracic-and-vascular-surgery/ahmedabad/dr-ishan-gohil',
      sourceUrl: 'https://www.apollohospitals.com/doctors/cardiothoracic-and-vascular-surgery/ahmedabad/dr-ishan-gohil',
    },
  ],
};

const fordPatnaEnrichment = {
  sourceUrl: 'https://fordhospital.org/doctors/',
  checkedAt: new Date('2026-10-01T00:00:00.000Z'),
  summary: 'Ford Hospital publishes these specialist profiles in its Patna doctor directory. Experience and qualifications are shown only where the individual hospital profile states them.',
  departments: ['Cardiology', 'Neurology', 'Gastroenterology', 'Orthopedics'],
  services: [],
  technologies: [],
  doctors: [
    {
      name: 'Dr. B.B Bharti',
      title: 'Director, Cardiology',
      specialization: 'Cardiology',
      qualification: 'MBBS; MD; DM (Cardiology)',
      experienceText: '22+ years (as stated by Ford Hospital)',
      biography: 'Ford Hospital lists Dr. B.B Bharti as Director of Cardiology and describes his work in clinical and interventional cardiology, including coronary artery disease, heart attack care, hypertension, heart failure, arrhythmias, and valvular heart disease.',
      expertise: ['Clinical cardiology', 'Interventional cardiology', 'Coronary artery disease', 'Heart failure', 'Arrhythmias'],
      profileUrl: 'https://fordhospital.org/best-heart-doctor-in-patna/',
      sourceUrl: 'https://fordhospital.org/best-heart-doctor-in-patna/',
    },
    {
      name: 'Dr. Sushant Kumar Pathak',
      title: 'Consultant, Cardiology',
      specialization: 'Cardiology',
      qualification: 'MBBS; MD; DM (Cardiology)',
      experienceText: 'Over a decade (as stated by Ford Hospital)',
      biography: 'Ford Hospital describes Dr. Sushant Kumar Pathak as a cardiology consultant providing interventional and preventive heart care, including coronary angiography, angioplasty, cardiac-device care, and structural-heart procedures.',
      expertise: ['Interventional cardiology', 'Preventive cardiology', 'Coronary angiography', 'Angioplasty', 'Cardiac devices'],
      profileUrl: 'https://fordhospital.org/best-cardiology-doctor-in-patna/',
      sourceUrl: 'https://fordhospital.org/best-cardiology-doctor-in-patna/',
    },
    {
      name: 'Dr. Saroj Kr. Mishra',
      title: 'Consultant, Interventional Cardiology',
      specialization: 'Interventional Cardiology',
      qualification: 'MBBS; MD; DM (Cardiology)',
      experienceText: '7+ years (as stated by Ford Hospital)',
      biography: 'Ford Hospital describes Dr. Saroj Kr. Mishra as an interventional cardiologist focused on catheter-based cardiac procedures, including coronary angiography, angioplasty, physiology-guided PCI, structural-heart procedures, and cardiac-device implantation.',
      expertise: ['Interventional cardiology', 'Coronary angiography', 'Angioplasty', 'Physiology-guided PCI', 'Cardiac-device implantation'],
      profileUrl: 'https://fordhospital.org/best-interventional-cardiologist-in-patna/',
      sourceUrl: 'https://fordhospital.org/best-interventional-cardiologist-in-patna/',
    },
    {
      name: 'Dr. Jyoti Kumari',
      title: 'Consultant, Cardiology',
      specialization: 'Cardiology',
      qualification: 'MBBS; MD (Internal Medicine); DrNB (Cardiology)',
      biography: 'Ford Hospital describes Dr. Jyoti Kumari as a cardiologist with training in internal medicine and cardiology, and lists interventional procedures, cardiac-device implantation, non-invasive diagnostics, and emergency cardiac care among her stated clinical interests.',
      expertise: ['Interventional cardiology', 'Cardiac-device implantation', 'Echocardiography', 'Emergency cardiac care'],
      profileUrl: 'https://fordhospital.org/top-cardiology-doctor-in-patna/',
      sourceUrl: 'https://fordhospital.org/top-cardiology-doctor-in-patna/',
    },
    {
      name: 'Dr. Vikash Kumar',
      title: 'Consultant, Cardiology',
      specialization: 'Cardiology',
      qualification: 'MBBS; MD (Internal Medicine); DrNB (Cardiology)',
      biography: 'Ford Hospital describes Dr. Vikash Kumar as a cardiologist focused on interventional and preventive care, including coronary interventions, cardiac-device implantation, structural-heart procedures, and non-invasive cardiac diagnostics.',
      expertise: ['Interventional cardiology', 'Preventive cardiology', 'Coronary interventions', 'Cardiac devices', 'Structural-heart care'],
      profileUrl: 'https://fordhospital.org/top-heart-specialist-in-patna/',
      sourceUrl: 'https://fordhospital.org/top-heart-specialist-in-patna/',
    },
    {
      name: 'Dr. Sanjeev Kumar',
      title: 'Consultant, Neurology',
      specialization: 'Neurology',
      qualification: 'MBBS; MD; DM (Neurology)',
      experienceText: 'Extensive clinical experience (Ford Hospital does not state a numeric duration)',
      biography: 'Ford Hospital describes Dr. Sanjeev Kumar as a neurologist treating epilepsy, migraine, stroke, Parkinson disease, and multiple sclerosis, with an emphasis on individualized care plans and patient education.',
      expertise: ['Epilepsy', 'Migraine', 'Stroke', 'Parkinson disease', 'Multiple sclerosis'],
      profileUrl: 'https://fordhospital.org/best-neuro-doctor-in-patna/',
      sourceUrl: 'https://fordhospital.org/best-neuro-doctor-in-patna/',
    },
    {
      name: 'Dr. Uday Kumar',
      title: 'Consultant, Gastroenterology',
      specialization: 'Gastroenterology',
      qualification: 'MBBS; MD (Medicine); DM (Gastroenterology)',
      experienceText: 'Years of clinical practice (Ford Hospital does not state a numeric duration)',
      biography: 'Ford Hospital describes Dr. Uday Kumar as a gastroenterologist treating digestive disorders including acid reflux, IBS, liver disease, IBD, gastrointestinal infections, and digestive-tract cancers. The profile also describes diagnostic endoscopy and minimally invasive digestive procedures.',
      expertise: ['Gastroenterology', 'Endoscopy', 'Liver disease', 'Inflammatory bowel disease', 'Digestive disorders'],
      profileUrl: 'https://fordhospital.org/gastroenterologist-in-patna/',
      sourceUrl: 'https://fordhospital.org/gastroenterologist-in-patna/',
    },
    {
      name: 'Dr. Ujjwal Kumar',
      title: 'Consultant, Gastroenterology',
      specialization: 'Gastroenterology',
      qualification: 'MBBS; MD; DM (Gastroenterology)',
      experienceText: 'Years of clinical experience (Ford Hospital does not state a numeric duration)',
      biography: 'Ford Hospital describes Dr. Ujjwal Kumar as a gastroenterologist providing digestive care, including diagnostic and therapeutic endoscopy, ERCP, liver-disease management, and treatment of inflammatory bowel disease.',
      expertise: ['Gastroenterology', 'Upper GI endoscopy', 'Colonoscopy', 'ERCP', 'Liver disease', 'Inflammatory bowel disease'],
      profileUrl: 'https://fordhospital.org/top-gastroenterologist-in-patna/',
      sourceUrl: 'https://fordhospital.org/top-gastroenterologist-in-patna/',
    },
    {
      name: 'Dr. Raja Anurag Gautam',
      title: 'Consultant, Orthopedics',
      specialization: 'Orthopedics',
      qualification: 'MBBS; MS',
      biography: 'Ford Hospital describes Dr. Raja Anurag Gautam as an orthopedist treating joint disorders, fractures, sports injuries, arthritis, and spine-related issues, using surgical and non-surgical approaches.',
      expertise: ['Joint disorders', 'Fractures', 'Sports injuries', 'Arthritis', 'Spine-related conditions'],
      profileUrl: 'https://fordhospital.org/best-orthopedist-in-patna/',
      sourceUrl: 'https://fordhospital.org/best-orthopedist-in-patna/',
    },
    {
      name: 'Dr. Arun Kumar',
      title: 'Consultant, Orthopedics',
      specialization: 'Orthopedics',
      qualification: 'MBBS; MS',
      biography: 'Ford Hospital describes Dr. Arun Kumar as an orthopedist treating joint replacement needs, sports injuries, fractures, and arthritis, with rehabilitation and minimally invasive procedures among the stated areas of care.',
      expertise: ['Joint replacement', 'Sports injuries', 'Fractures', 'Arthritis', 'Minimally invasive orthopedics'],
      profileUrl: 'https://fordhospital.org/best-ortho-surgeon-in-patna/',
      sourceUrl: 'https://fordhospital.org/best-ortho-surgeon-in-patna/',
    },
    {
      name: 'Dr. Vinit Vivek',
      title: 'Consultant, Orthopedics',
      specialization: 'Orthopedics',
      qualification: 'MBBS; DNB',
      biography: 'Ford Hospital describes Dr. Vinit Vivek as an orthopedic surgeon treating fractures, joint replacements, sports injuries, arthritis, spinal disorders, and other musculoskeletal conditions.',
      expertise: ['Fractures', 'Joint replacement', 'Sports injuries', 'Arthritis', 'Spinal disorders'],
      profileUrl: 'https://fordhospital.org/best-orthopedic-doctor-in-patna/',
      sourceUrl: 'https://fordhospital.org/best-orthopedic-doctor-in-patna/',
    },
  ],
};

const enrichments = [
  { sourceRowId: 9533, name: 'Paras Health Gurugram', data: parasEnrichment },
  { sourceRowId: 2117, name: 'AIIMS Patna', data: aiimsPatnaEnrichment },
  {
    sourceRowId: 6690,
    name: 'Akshaya Apollo Hospitals Ltd (Apollo Hospitals International Ltd, Ahmedabad)',
    data: apolloGandhinagarEnrichment,
    hospitalFields: {
      website: 'https://www.apollohospitals.com/ahmedabad',
      telephone: '08069049761',
      specialties: apolloGandhinagarEnrichment.departments,
      emergencyFlag: true,
      emergencyFlagSource: 'raw',
    },
  },
  {
    sourceRowId: 2123,
    name: 'Ford Hospital',
    data: fordPatnaEnrichment,
  },
];

async function run() {
  await mongoose.connect(env.mongoUri);
  const targetSourceRowId = Number(process.env.ENRICHMENT_SOURCE_ROW_ID);
  const selectedEnrichments = Number.isInteger(targetSourceRowId) && targetSourceRowId > 0
    ? enrichments.filter((entry) => entry.sourceRowId === targetSourceRowId)
    : enrichments;
  if (!selectedEnrichments.length) throw new Error(`No enrichment configured for source row ${targetSourceRowId}.`);

  for (const { sourceRowId, name, data, hospitalFields = {} } of selectedEnrichments) {
    const result = await Hospital.updateOne({ sourceRowId }, { $set: { officialEnrichment: data, ...hospitalFields } });
    if (!result.matchedCount) throw new Error(`${name} source row ${sourceRowId} was not found.`);
    console.log(`[enrichment] updated ${name} source row ${sourceRowId}`);
  }
}

run()
  .catch((err) => {
    console.error('[enrichment] failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });