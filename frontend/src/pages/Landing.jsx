import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { searchDoctors } from '../services/doctorApi';

const popularSpecialties = ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Internal Medicine', 'Pediatrics'];

const quickMetros = [
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Bengaluru', state: 'Karnataka' },
  { name: 'Delhi NCR', state: 'Delhi' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Pune', state: 'Maharashtra' },
];

const clinicalCentres = [
  {
    id: 'cardiology',
    name: 'Cardiology & Heart Sciences',
    institute: 'AIIMS CT Centre & Apollo Heart Institutes',
    icon: '🫀',
    shortName: 'Cardiology',
    headline: 'Quaternary Cardiovascular Sciences, Interventional Cardiology & Robotic Cardiac Surgery',
    description:
      'Pioneering interventional cardiology, transcatheter aortic valve replacement (TAVR/TAVI), coronary angioplasty, electrophysiology, and 24/7 primary percutaneous coronary intervention (PPCI) protocols.',
    stats: [
      { label: 'Clinical Success Rate', value: '99.6%' },
      { label: 'Complex Procedures Done', value: '150,000+' },
      { label: 'Door-to-Balloon Time', value: '< 45 Mins' },
    ],
    technologies: [
      'Digital Biplane Cath Lab',
      'Minimally Invasive TAVR / TAVI',
      'Rotablation & IVUS Guidance',
      'Dedicated 24/7 Cardiac ICU (CCU)',
      'Fractional Flow Reserve (FFR)',
      'Extracorporeal Membrane Oxygenation (ECMO)',
    ],
    commonConditions: ['Coronary Artery Disease', 'Heart Failure', 'Heart Valve Defects', 'Arrhythmia', 'Hypertension'],
    searchSpecialty: 'Cardiology',
  },
  {
    id: 'neurology',
    name: 'Neurosciences & Neurosurgery',
    institute: 'Apex Neurosciences Centre',
    icon: '🧠',
    shortName: 'Neurology',
    headline: 'Precision Neurosciences, Acute Stroke Rescue & Robotic Spine Surgery',
    description:
      'Comprehensive quaternary care for acute ischemic stroke, intracranial aneurysms, neuro-oncology, Parkinson’s disease, deep brain stimulation (DBS), and minimally invasive robotic spine surgery.',
    stats: [
      { label: 'Stroke Window Protocol', value: '24/7 Rapid Response' },
      { label: 'Neuro Surgeries Performed', value: '45,000+' },
      { label: 'Functional Neuro-Navigation', value: 'Sub-millimeter' },
    ],
    technologies: [
      '3T Digital Intraoperative MRI',
      'Biplane Neuro-Intervention Angiography',
      'Intraoperative Neuro-Monitoring (IONM)',
      'Dedicated 24/7 Stroke Unit',
      'Robotic Stereotactic Radiosurgery',
      'Endoscopic Skull-Base Surgery',
    ],
    commonConditions: ['Acute Ischemic Stroke', 'Brain Tumors', 'Epilepsy & Seizures', 'Parkinson’s Disease', 'Spinal Disc Herniation'],
    searchSpecialty: 'Neurology',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics & Joint Reconstruction',
    institute: 'Institutes of Robotic Joint Reconstruction',
    icon: '🦴',
    shortName: 'Orthopedics',
    headline: 'Mako Robotic Joint Replacement, Arthroscopy & Polytrauma Care',
    description:
      'India’s leading robotic total knee and hip replacement program, sports injury arthroscopy, complex pelvis trauma reconstruction, pediatric orthopedics, and revision arthroplasty.',
    stats: [
      { label: 'Robotic Joint Surgeries', value: '25,000+' },
      { label: 'Mobility Recovery Time', value: 'Within 24 Hours' },
      { label: 'Infection Rate Benchmark', value: '< 0.3%' },
    ],
    technologies: [
      'Mako & Cuvis Robotic Joint System',
      'High-Definition 4K Arthroscopy',
      'Computer-Navigated Spine Instrumentation',
      'Level-1 Orthopedic Trauma Theatres',
      'Rapid Mobilization Physiotherapy Suite',
      'Laminar Airflow Clean Room OTs',
    ],
    commonConditions: ['Osteoarthritis & Knee Pain', 'Hip Dysplasia', 'ACL & Meniscus Ligament Tears', 'Bone Fractures', 'Spinal Stenosis'],
    searchSpecialty: 'Orthopedics',
  },
  {
    id: 'oncology',
    name: 'Oncology & Cancer Institutes',
    institute: 'Comprehensive Cancer Care Centres',
    icon: '🎗️',
    shortName: 'Oncology',
    headline: 'Multidisciplinary Tumor Boards, Proton Beam & Precision Immunotherapy',
    description:
      'Integrated cancer centers offering personalized medical oncology, organ-preserving robotic surgical oncology, targeted immunotherapy, cellular therapy, and advanced radiation oncology.',
    stats: [
      { label: 'Organ-Preserving Care', value: '92% Rate' },
      { label: 'Multidisciplinary Boards', value: '100% Cases' },
      { label: 'Molecular Genomic Profiling', value: 'Next-Gen' },
    ],
    technologies: [
      'TrueBeam STx Linear Accelerator',
      'Proton Beam Radiation Access',
      'Digital PET-CT with Gallium-68',
      'Da Vinci XI Robotic Surgical System',
      'HEPA-Filtered Bone Marrow Transplant Unit',
      'Hyperthermic Intraperitoneal Chemotherapy (HIPEC)',
    ],
    commonConditions: ['Breast Cancer', 'Lung & Thoracic Oncology', 'Gastrointestinal Cancers', 'Leukemia & Lymphoma', 'Head & Neck Tumors'],
    searchSpecialty: 'Oncology',
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology & Hepatology',
    institute: 'Digestive Diseases & Liver Transplant Centre',
    icon: '🔬',
    shortName: 'Gastroenterology',
    headline: 'Advanced Endoscopy, Living-Donor Liver Transplantation & GI Surgery',
    description:
      'Pioneers in living-donor liver transplantation, endoscopic ultrasound (EUS), complex ERCP, inflammatory bowel disease (IBD) management, and gastrointestinal oncology.',
    stats: [
      { label: 'Liver Transplants Success', value: '94.8%' },
      { label: 'Advanced Endoscopies', value: '80,000+' },
      { label: 'GI Bleed Emergency Team', value: 'Immediate 24/7' },
    ],
    technologies: [
      'High-Definition SpyGlass Cholangioscopy',
      'Endoscopic Ultrasound (EUS)',
      'FibroScan Liver Stiffness Assessment',
      'Dedicated Liver Intensive Care Unit (LICU)',
      'Endoscopic Submucosal Dissection (ESD)',
      'Radiofrequency Ablation (RFA)',
    ],
    commonConditions: ['Liver Cirrhosis & Fatty Liver', 'Pancreatitis', 'Gallstones & Bile Duct Stones', 'Gastrointestinal Bleed', 'Acid Reflux / GERD'],
    searchSpecialty: 'Gastroenterology',
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology & Critical Care',
    institute: 'Chest & Respiratory Intensive Care Institute',
    icon: '🫁',
    shortName: 'Pulmonology',
    headline: 'Advanced Respiratory Care, Interventional EBUS & ECMO Support',
    description:
      'Quaternary care for acute respiratory distress syndrome (ARDS), severe asthma, chronic obstructive pulmonary disease (COPD), interstitial lung disease, and pulmonary rehabilitation.',
    stats: [
      { label: 'Ventilator Weaning Rate', value: '91%' },
      { label: 'Interventional EBUS Cases', value: '12,000+' },
      { label: '24/7 ALS Mechanical Support', value: 'Continuous' },
    ],
    technologies: [
      'Endobronchial Ultrasound (EBUS-TBNA)',
      'Advanced Pulmonary Function Testing (PFT)',
      'Veno-Venous & Veno-Arterial ECMO',
      'Polysomnography Sleep Study Lab',
      'Cryotherapy & Rigid Bronchoscopy',
      'High-Flow Nasal Cannula (HFNC)',
    ],
    commonConditions: ['COPD & Chronic Bronchitis', 'Severe Asthma & Dyspnea', 'Pneumonia & Chest Infections', 'Sleep Apnea', 'Pulmonary Fibrosis'],
    searchSpecialty: 'Pulmonology',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Neonatal ICU (NICU)',
    institute: 'Apex Children & Neonatal Institute',
    icon: '👶',
    shortName: 'Pediatrics',
    headline: 'Level-3 Neonatal Intensive Care (NICU) & Pediatric Sub-Specialties',
    description:
      'Dedicated pediatric critical care, pediatric cardiac surgery, pediatric neurology, and neonatal transport services with high-frequency oscillation ventilators and nitric oxide therapy.',
    stats: [
      { label: 'Level-3 NICU Survival', value: '98.5%' },
      { label: 'Extremely Preterm Care', value: 'From 24 Weeks' },
      { label: 'Pediatric Cardiac Surgeries', value: '20,000+' },
    ],
    technologies: [
      'High-Frequency Oscillatory Ventilators (HFOV)',
      'Inhaled Nitric Oxide (iNO) Therapy',
      'Whole-Body Therapeutic Hypothermia',
      'Dedicated Pediatric ICU (PICU)',
      'Pediatric Echocardiography & Cath Suite',
      'Transport Incubators with ALS',
    ],
    commonConditions: ['Neonatal Jaundice & Prematurity', 'Congenital Heart Defects', 'Pediatric Asthma & Infections', 'Pediatric Seizures', 'Developmental Delays'],
    searchSpecialty: 'Pediatrics',
  },
  {
    id: 'nephrology',
    name: 'Nephrology & Renal Transplant',
    institute: 'Renal Sciences & Urological Surgery',
    icon: '💧',
    shortName: 'Nephrology',
    headline: 'Renal Transplantation, Hemodialysis & Robotic Urological Surgery',
    description:
      'Comprehensive kidney disease management, ABO-incompatible kidney transplantation, continuous renal replacement therapy (CRRT), and laser kidney stone treatment.',
    stats: [
      { label: 'Kidney Transplant Success', value: '98.2%' },
      { label: 'Dialysis Sessions Handled', value: '200,000+' },
      { label: 'Minimally Invasive Stones', value: '100% Laser' },
    ],
    technologies: [
      'Online Hemodiafiltration (HDF) Stations',
      'Continuous Renal Replacement Therapy (CRRT)',
      'Holmium Laser Enucleation / RIRS',
      'Robotic Assisted Kidney Transplantation',
      'Ultrasound-Guided Real-Time Renal Biopsy',
      'Automated Peritoneal Dialysis (APD)',
    ],
    commonConditions: ['Chronic Kidney Disease (CKD)', 'Kidney Stones & Hydronephrosis', 'Renal Failure', 'Prostate Enlargement', 'Urinary Tract Infections'],
    searchSpecialty: 'Nephrology',
  },
];

const metroDirectory = [
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    totalHospitals: '2,840+',
    verifiedApolloDoctors: '42+ Specialists',
    accreditation: 'Apex Quaternary Standards',
    emergencyUnits: '24/7 Trauma ICU',
    superSpecialties: 'Cardiology, Oncology, Neuro, Ortho',
    highlightFlagships: 'Apollo Hospitals Navi Mumbai · Fortis Hospital Mulund · Surana Sethia · Kokilaben Dhirubhai Ambani',
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    totalHospitals: '3,120+',
    verifiedApolloDoctors: '68+ Specialists',
    accreditation: 'Apex Quaternary Standards',
    emergencyUnits: '24/7 Trauma ICU',
    superSpecialties: 'Cardiology, Robotic Surgery, Transplants',
    highlightFlagships: 'Apollo Hospitals Bannerghatta Road · Manipal Hospital Old Airport Road · Fortis Hospital BG Road',
  },
  {
    city: 'Delhi NCR',
    state: 'Delhi',
    totalHospitals: '3,450+',
    verifiedApolloDoctors: '55+ Specialists',
    accreditation: 'Apex Quaternary Standards',
    emergencyUnits: '24/7 Trauma ICU',
    superSpecialties: 'Cardiology, Cancer Care, Neurosciences',
    highlightFlagships: 'Indraprastha Apollo Hospitals New Delhi · Fortis Memorial Gurgaon · Max Healthcare Saket',
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    totalHospitals: '2,490+',
    verifiedApolloDoctors: '64+ Specialists',
    accreditation: 'Apex Quaternary Standards',
    emergencyUnits: '24/7 Trauma ICU',
    superSpecialties: 'Heart Institutes, Proton Beam Cancer, Organ Transplant',
    highlightFlagships: 'Apollo Hospitals Greams Road · Apollo Speciality Hospitals · MGM Healthcare',
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    totalHospitals: '2,180+',
    verifiedApolloDoctors: '48+ Specialists',
    accreditation: 'Apex Quaternary Standards',
    emergencyUnits: '24/7 Trauma ICU',
    superSpecialties: 'Cardiology, Liver Transplant, Robotic Joints',
    highlightFlagships: 'Apollo Hospitals Jubilee Hills · Yashoda Hospitals Somajiguda · KIMS Hospitals Secunderabad',
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    totalHospitals: '1,960+',
    verifiedApolloDoctors: '36+ Specialists',
    accreditation: 'Apex Quaternary Standards',
    emergencyUnits: '24/7 Trauma ICU',
    superSpecialties: 'Cardiology, Oncology, Nephrology, Trauma',
    highlightFlagships: 'Apollo Multispeciality Hospitals · Fortis Hospital Anandapur · AMRI Hospitals',
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    totalHospitals: '1,640+',
    verifiedApolloDoctors: '28+ Specialists',
    accreditation: 'Apex Quaternary Standards',
    emergencyUnits: '24/7 Trauma ICU',
    superSpecialties: 'Cardiology, Neuro, Joint Reconstruction, NICU',
    highlightFlagships: 'Ruby Hall Clinic · Jehangir Hospital · Sahyadri Super Speciality Hospitals',
  },
];

const acuteSymptomsList = [
  {
    symptom: 'Severe Chest Discomfort & Pressure',
    category: 'Heart & Vascular',
    recommendedSpecialty: 'Cardiology',
    acuity: 'High Priority',
    acuityColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: '❤️',
    response: 'Cath Lab & Cardiac ICU immediate standby',
  },
  {
    symptom: 'Shortness of Breath / Breathing Difficulty',
    category: 'Lungs & Airways',
    recommendedSpecialty: 'Pulmonology',
    acuity: 'High Priority',
    acuityColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: '🫁',
    response: 'ALS Ventilator & Oxygenation standby',
  },
  {
    symptom: 'High Persistent Fever (>102°F) & Shivering',
    category: 'Infection & Systemic',
    recommendedSpecialty: 'Internal Medicine',
    acuity: 'Urgent Evaluation',
    acuityColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '🌡️',
    response: 'Blood culture & emergency triage ward',
  },
  {
    symptom: 'Sudden Numbness / Weakness / Stroke Signs',
    category: 'Brain & Spine',
    recommendedSpecialty: 'Neurology',
    acuity: 'Emergency 24/7',
    acuityColor: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    icon: '🧠',
    response: 'Dedicated 24/7 Stroke Unit & 3T MRI',
  },
  {
    symptom: 'Bone Fracture / Joint Dislocation / Trauma',
    category: 'Trauma & Ortho',
    recommendedSpecialty: 'Orthopedics',
    acuity: 'Urgent Care',
    acuityColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '🦴',
    response: 'Level-1 Trauma OTs & Digital X-Ray',
  },
  {
    symptom: 'Severe Abdominal Pain & Vomiting',
    category: 'Digestive & Liver',
    recommendedSpecialty: 'Gastroenterology',
    acuity: 'Urgent Care',
    acuityColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '🔬',
    response: 'Emergency Endoscopy & Ultrasound',
  },
  {
    symptom: 'High Fever / Distress in Infant / Child',
    category: 'Pediatric Care',
    recommendedSpecialty: 'Pediatrics',
    acuity: 'Priority Triage',
    acuityColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '👶',
    response: 'Level-3 NICU & PICU pediatrician on duty',
  },
  {
    symptom: 'Kidney Stone Pain / Severe Flank Colic',
    category: 'Renal & Urology',
    recommendedSpecialty: 'Nephrology',
    acuity: 'Urgent Relief',
    acuityColor: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: '💧',
    response: 'Laser Lithotripsy & Emergency Urology',
  },
];

const patientStories = [
  {
    quote:
      'When my father developed sudden chest pain in Chennai, MediNexus guided us straight to Apollo Hospitals Greams Road. The Cath Lab team was already pre-alerted before we arrived.',
    patient: 'Ramesh Sundaram',
    location: 'Chennai, Tamil Nadu',
    verified: 'Verified Cardiac Admission',
    avatar: 'R',
  },
  {
    quote:
      'Finding verified Apollo doctors in Bengaluru with their official qualifications, department affiliations, and source-verified profiles made scheduling our specialist consultation reassuring and completely transparent.',
    patient: 'Ananya Deshmukh',
    location: 'Bengaluru, Karnataka',
    verified: 'Verified Specialist Consultation',
    avatar: 'A',
  },
  {
    quote:
      'Finding verified doctor profiles with actual NMC and official Apollo hospital links gave our family complete confidence. The AI triage accurately flagged my symptoms as urgent.',
    patient: 'Vikramaditya Mehta',
    location: 'Mumbai, Maharashtra',
    verified: 'Verified Specialist Consultation',
    avatar: 'V',
  },
];

const featuredNetworks = [
  {
    name: 'Apollo Hospitals Network',
    tagline: 'Quaternary Healthcare Pioneer & Accredited Flagships',
    description: '13 Flagship tertiary units across India with 177+ verified senior specialists, 24/7 ALS emergency departments and robotic surgery suites.',
    flagships: 'Greams Road Chennai · Jubilee Hills Hyderabad · Navi Mumbai · Bannerghatta Bengaluru · Indraprastha Delhi',
    searchParam: 'Apollo',
    badge: 'Flagship Partner Network',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    hotline: '1066 / 1860-500-1066',
  },
  {
    name: 'Fortis Healthcare',
    tagline: 'Leading Multispecialty & Cardiac Centers',
    description: 'Accredited hospitals across major Indian metros featuring dedicated cardiac science institutes, stroke emergency centers, and critical care infrastructure.',
    flagships: 'Fortis Mulund Mumbai · Bannerghatta Bengaluru · Gurgaon · Mohali · Anandapur Kolkata',
    searchParam: 'Fortis',
    badge: 'Tertiary Care Network',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    hotline: '105010',
  },
  {
    name: 'Manipal Hospitals',
    tagline: 'Clinical Excellence & Medical Research',
    description: 'Comprehensive healthcare network delivering clinical excellence in complex transplantation, joint replacement, cardiology and oncology.',
    flagships: 'Old Airport Road Bengaluru · Yeshwanthpur · Dwarka New Delhi · Salt Lake Kolkata',
    searchParam: 'Manipal',
    badge: 'Advanced Care Network',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    hotline: '1800-102-5555',
  },
];

const heroHospitalVideos = [
  {
    id: 'campus',
    title: 'Flagship Campus',
    badge: 'Apollo & AIIMS Benchmark Facility',
    src: '/videos/hospital-exterior.webm',
    type: 'video/webm',
    fallbackSrc: '/videos/hospital-hero.mp4',
  },
  {
    id: 'clinical',
    title: 'Clinical Care',
    badge: '177+ Verified Faculty & High-Acuity Care',
    src: '/videos/hospital-hero.mp4',
    type: 'video/mp4',
    fallbackSrc: '/videos/hospital-exterior.webm',
  },
  {
    id: 'trauma',
    title: 'Emergency Trauma',
    badge: '24/7 Level-1 Resuscitation Pavilion',
    src: '/videos/hospital-entrance.webm',
    type: 'video/webm',
    fallbackSrc: '/videos/hospital-hero.mp4',
  },
];

const hospitalVirtualTours = [
  {
    id: 'apollo-flagship',
    tabName: 'Apollo Chennai Flagship',
    title: 'Apollo Hospitals Greams Road, Chennai',
    city: 'Chennai, Tamil Nadu',
    location: 'Greams Lane, Thousand Lights, Chennai',
    subSpecialty: 'Cardiology, Robotic Surgery & Proton Cancer Care',
    badge: 'Apollo Flagship Quaternary Center',
    searchQuery: 'Apollo',
    icon: '🏥',
    src: '/videos/hospital-exterior.webm',
    fallbackSrc: '/videos/hospital-hero.mp4',
    type: 'video/webm',
    poster: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
    description: 'The historic flagship hospital of the Apollo Group, globally renowned for groundbreaking cardiac surgeries, living-donor transplants, and Asia’s first Proton Cancer Centre.',
    keyUnits: [
      'Dual-Console Da Vinci Xi Robotic Surgical Theatres',
      'Apollo Heart Institute with 99.6% CABG Success Rate',
      'Comprehensive Living-Donor Multi-Organ Transplant Wings',
      '24/7 Level-1 Golden Hour Trauma & Stroke Intervention Hub',
    ],
    hotline: '1066 / 1860-500-1066',
  },
  {
    id: 'aiims-apex',
    tabName: 'AIIMS Apex Healthcare',
    title: 'All India Institute of Medical Sciences (AIIMS)',
    city: 'New Delhi & Apex Campuses',
    location: 'Ansari Nagar, New Delhi',
    subSpecialty: 'National Referral Hospital & Medical Research',
    badge: 'National Apex Tertiary Care',
    searchQuery: 'AIIMS',
    icon: '🏛️',
    src: '/videos/hospital-hero.mp4',
    fallbackSrc: '/videos/hospital-exterior.webm',
    type: 'video/mp4',
    poster: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    description: 'India’s premier autonomous public apex medical institution, delivering advanced tertiary interventions, clinical super-specialties, and compassionate emergency care.',
    keyUnits: [
      'Advanced Cardiac and Neurosciences Centre',
      'Dr. B.R.A. Institute-Rotary Cancer Hospital (IRCH)',
      'High-Acuity Trauma Resuscitation Bays & Burn Units',
      'Nationwide Tele-consultation & Clinical Referral Hub',
    ],
    hotline: '108 / 112 / 011-26588500',
  },
  {
    id: 'trauma-emergency',
    tabName: '24/7 Trauma Emergency',
    title: 'Level-1 Emergency & Critical Care Pavilions',
    city: 'Mumbai · Bengaluru · Delhi NCR · Hyderabad',
    location: 'Immediate Metro Access Routes',
    subSpecialty: 'Golden Hour Resuscitation & Emergency Surgery',
    badge: '24/7 Active Trauma Gateway',
    searchQuery: 'Emergency',
    icon: '🚨',
    src: '/videos/hospital-entrance.webm',
    fallbackSrc: '/videos/hospital-hero.mp4',
    type: 'video/webm',
    poster: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    description: 'Continuous round-the-clock emergency departments equipped with rapid triage systems, direct cath lab access for acute myocardial infarction, and trauma surgery teams.',
    keyUnits: [
      'Direct Ambulance Bay with Zero-Delay Admission Protocol',
      'Dedicated Resuscitation Bay & Hemodynamic Stabilization',
      'Biplane Neuro-Angiography for Acute Ischemic Stroke',
      '24/7 On-Duty Intensivists, Trauma Surgeons & Blood Bank',
    ],
    hotline: '1066 / 108 Emergency Direct Link',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');

  // Active Centre of Excellence Tab
  const [activeCentreId, setActiveCentreId] = useState('cardiology');
  const activeCentre = clinicalCentres.find((c) => c.id === activeCentreId) || clinicalCentres[0];

  // Active Metro Directory Tab
  const [selectedMetroCity, setSelectedMetroCity] = useState('Mumbai');
  const activeMetro = metroDirectory.find((m) => m.city === selectedMetroCity) || metroDirectory[0];

  // Dynamic Apollo Doctors Carousel state
  const [apolloDoctors, setApolloDoctors] = useState([]);
  const [doctorIndex, setDoctorIndex] = useState(0);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // Dynamic Hospital Video Hero state
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const heroVideoRef = useRef(null);

  // Dynamic Virtual Tour Showcase state
  const [activeTourIndex, setActiveTourIndex] = useState(0);
  const [isTourPlaying, setIsTourPlaying] = useState(true);
  const [isTourMuted, setIsTourMuted] = useState(true);
  const tourVideoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadApolloDoctors() {
      try {
        setDoctorsLoading(true);
        const res = await searchDoctors({ hospital: 'Apollo' });
        if (isMounted && res.data && res.data.length > 0) {
          setApolloDoctors(res.data);
        }
      } catch {
        // Fallback handled gracefully
      } finally {
        if (isMounted) setDoctorsLoading(false);
      }
    }
    loadApolloDoctors();
    return () => {
      isMounted = false;
    };
  }, []);

  function nextDoctor() {
    if (apolloDoctors.length === 0) return;
    setDoctorIndex((prev) => (prev + 1) % apolloDoctors.length);
  }

  function prevDoctor() {
    if (apolloDoctors.length === 0) return;
    setDoctorIndex((prev) => (prev - 1 + apolloDoctors.length) % apolloDoctors.length);
  }

  function submitSearch(event) {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (hospital.trim()) params.set('q', hospital.trim());
    if (location.trim()) params.set('state', location.trim());
    if (specialty.trim()) params.set('specialty', specialty.trim());
    navigate(`/hospitals${params.size ? `?${params.toString()}` : ''}`);
  }

  function searchSpecialty(value) {
    navigate(`/hospitals?specialty=${encodeURIComponent(value)}`);
  }

  function handleMetroClick(metro) {
    setLocation(metro.name);
    const params = new URLSearchParams();
    params.set('state', metro.name);
    navigate(`/hospitals?${params.toString()}`);
  }

  // Doctor slice for 3 cards display on desktop, 1 on mobile
  const visibleDoctors = apolloDoctors.length > 0
    ? [
        apolloDoctors[doctorIndex],
        apolloDoctors[(doctorIndex + 1) % apolloDoctors.length],
        apolloDoctors[(doctorIndex + 2) % apolloDoctors.length],
      ]
    : [];

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* =========================================================================
          HERO SECTION: PRESERVED HERO WITH APEX HOSPITAL AUTHORITY (AIIMS & APOLLO)
          - Background image: photo-1586773860418-d37222d8fce3
          - Exact heading, subtitle, search form with terracotta button, quick links
          - Balanced vertical padding so the 4 action pills are immediately visible above fold
          ========================================================================= */}
      <section className="relative isolate overflow-hidden bg-[#0a201e] text-white">
        {/* Dynamic Moving Hospital Background Video with poster fallback */}
        <video
          ref={heroVideoRef}
          key={heroHospitalVideos[heroVideoIndex].id}
          autoPlay
          loop
          muted={isHeroMuted}
          playsInline
          poster="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=2200&q=85"
          className="absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700"
        >
          <source src={heroHospitalVideos[heroVideoIndex].src} type={heroHospitalVideos[heroVideoIndex].type} />
          {heroHospitalVideos[heroVideoIndex].fallbackSrc && (
            <source src={heroHospitalVideos[heroVideoIndex].fallbackSrc} type="video/mp4" />
          )}
        </video>
        {/* High-Contrast Gradient Overlays to preserve ultra-crisp search console text */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071d1b]/95 via-[#0c2a27]/85 to-[#071d1b]/50" />
        <div className="absolute inset-0 -z-10 bg-black/25" />

        <div className="mx-auto flex min-h-[480px] max-w-7xl flex-col justify-center px-5 py-12 md:min-h-[520px] md:px-10 lg:px-16">
          <div className="max-w-3xl">
            {/* National Apex Accreditation Ribbon */}
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300 shadow-sm">
                <span>🏛️</span>
                <span>Apex Quaternary Network · AIIMS &amp; Apollo Benchmark Care</span>
              </span>
              <Link
                to="/assessment"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1 text-xs font-bold text-white transition shadow-sm"
              >
                <span>✨ AI Patient Triage</span>
                <span>→</span>
              </Link>
            </div>

            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.14] md:text-6xl text-white">
              Find a hospital that fits your care.
            </h1>
            <p className="mt-3.5 max-w-xl text-base leading-7 text-white/85 md:text-lg">
              Explore hospitals by name, location, and specialty. Review services, verified doctor profiles, and contact details before you visit.
            </p>

            {/* Dynamic Moving Hospital Video Selector (Apollo & AIIMS Style Live Feed) */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-2.5 py-1 font-semibold text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Hospital View:</span>
              </span>

              {heroHospitalVideos.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setHeroVideoIndex(idx);
                    setIsHeroPlaying(true);
                  }}
                  className={`rounded-full px-3 py-1 font-medium transition backdrop-blur-md border ${
                    heroVideoIndex === idx
                      ? 'bg-emerald-500/30 text-white border-emerald-400/80 shadow-sm font-bold'
                      : 'bg-black/35 text-white/85 border-white/15 hover:bg-black/55 hover:text-white'
                  }`}
                >
                  {v.title}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  if (heroVideoRef.current) {
                    if (isHeroPlaying) {
                      heroVideoRef.current.pause();
                    } else {
                      heroVideoRef.current.play();
                    }
                    setIsHeroPlaying(!isHeroPlaying);
                  }
                }}
                className="rounded-full bg-black/50 hover:bg-black/70 px-2.5 py-1 text-white border border-white/20 transition flex items-center gap-1 text-[11px]"
                title={isHeroPlaying ? 'Pause video' : 'Play video'}
              >
                <span>{isHeroPlaying ? '⏸ Pause' : '▶ Play'}</span>
              </button>
            </div>

            {/* Live Verified Healthcare Highlights */}
            <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-200/95 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>👨‍⚕️ <strong>177+</strong> Verified Apollo Specialists</span>
              </span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <span className="text-rose-300 font-bold">🚨 24/7 Level-1 Trauma Emergency (1066 / 108)</span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <span>🏛️ <strong>Apex Quaternary Care</strong> (AIIMS &amp; Apollo Benchmark Care)</span>
            </div>
          </div>

          {/* Clean, Spacious Search Console */}
          <form onSubmit={submitSearch} className="mt-7 grid max-w-5xl gap-2 rounded-xl bg-white p-2.5 text-ink shadow-2xl md:grid-cols-[1.25fr_0.9fr_0.9fr_auto]">
            <label className="min-w-0 border-b border-slate-200 px-3 py-2 md:border-b-0 md:border-r">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hospital</span>
              <input
                value={hospital}
                onChange={(event) => setHospital(event.target.value)}
                placeholder="Hospital name"
                className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-medium outline-none placeholder:text-slate-400 focus:ring-0"
              />
            </label>
            <label className="min-w-0 border-b border-slate-200 px-3 py-2 md:border-b-0 md:border-r">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or state"
                className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-medium outline-none placeholder:text-slate-400 focus:ring-0"
              />
            </label>
            <label className="min-w-0 px-3 py-2">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Specialty</span>
              <input
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                placeholder="e.g. cardiology"
                className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-medium outline-none placeholder:text-slate-400 focus:ring-0"
              />
            </label>
            <button
              type="submit"
              className="min-h-12 rounded-lg bg-[#a54836] px-8 text-sm font-semibold text-white transition hover:bg-[#883c2e] shadow-md flex items-center justify-center gap-2"
            >
              <span>Search hospitals</span>
            </button>
          </form>

          {/* Sleek, Single-Row Quick Shortcuts */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/80">
            <span className="font-semibold text-white">Quick Metros:</span>
            {quickMetros.map((metro) => (
              <button
                key={metro.name}
                type="button"
                onClick={() => handleMetroClick(metro)}
                className="border-b border-white/30 pb-0.5 transition hover:border-white hover:text-white"
              >
                {metro.name}
              </button>
            ))}
            <span className="text-white/30 mx-1">|</span>
            <span className="font-semibold text-white">Explore care:</span>
            {popularSpecialties.slice(0, 4).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => searchSpecialty(item)}
                className="border-b border-white/30 pb-0.5 transition hover:border-white hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          APOLLO CHENNAI 4-PILL QUICK ACTION BAR (Directly beneath hero with circular arrows)
          ========================================================================= */}
      <section className="relative z-20 -mt-7 mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: AI Triage */}
          <Link
            to="/assessment"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl border border-emerald-100 group-hover:scale-105 transition">
                ✨
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  AI Patient Triage
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Instant clinical symptom assessment
                </p>
              </div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-[#a54836] group-hover:text-white shadow-sm">
              <span className="text-base font-bold">→</span>
            </div>
          </Link>

          {/* Card 2: Find Accredited Hospitals */}
          <Link
            to="/hospitals"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-clinical-500 hover:shadow-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clinical-50 text-2xl border border-clinical-100 group-hover:scale-105 transition">
                🏥
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-clinical-700 transition">
                  Find Hospitals
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Apex quaternary &amp; multispecialty centers
                </p>
              </div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-[#a54836] group-hover:text-white shadow-sm">
              <span className="text-base font-bold">→</span>
            </div>
          </Link>

          {/* Card 3: Consult Verified Doctors */}
          <Link
            to="/doctors"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-sky-500 hover:shadow-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-2xl border border-sky-100 group-hover:scale-105 transition">
                👨‍⚕️
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition">
                  Consult Specialists
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  177+ verified Apollo consultants
                </p>
              </div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-[#a54836] group-hover:text-white shadow-sm">
              <span className="text-base font-bold">→</span>
            </div>
          </Link>

          {/* Card 4: 24/7 Emergency Care */}
          <Link
            to="/hospitals?q=Emergency"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-rose-500 hover:shadow-2xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl border border-rose-100 group-hover:scale-105 transition">
                🚨
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition">
                  24/7 Emergency Care
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Direct ambulance &amp; trauma ICU
                </p>
              </div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-[#a54836] group-hover:text-white shadow-sm">
              <span className="text-base font-bold">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          NATIONAL HEALTHCARE IMPACT & QUALITY ASSURANCE METRICS (AIIMS & Apollo Benchmarks)
          ========================================================================= */}
      <section className="mt-12 border-y border-slate-200/80 bg-white py-8">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="border-l-4 border-clinical-600 pl-4">
              <p className="text-2xl font-black text-slate-900 md:text-3xl">Pan-India</p>
              <p className="text-xs font-bold uppercase tracking-wider text-clinical-700 mt-1">Hospital Network</p>
              <p className="text-xs text-slate-500 mt-0.5">Across all 28 Indian States &amp; Major Metros</p>
            </div>
            <div className="border-l-4 border-emerald-600 pl-4">
              <p className="text-2xl font-black text-slate-900 md:text-3xl">177+</p>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-1">Apollo Specialists</p>
              <p className="text-xs text-slate-500 mt-0.5">Source-verified credentialed doctors</p>
            </div>
            <div className="border-l-4 border-amber-600 pl-4">
              <p className="text-2xl font-black text-slate-900 md:text-3xl">50+</p>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mt-1">Clinical Specialties</p>
              <p className="text-xs text-slate-500 mt-0.5">Quaternary Institutes &amp; Sub-Specialties</p>
            </div>
            <div className="border-l-4 border-rose-600 pl-4">
              <p className="text-2xl font-black text-slate-900 md:text-3xl">24/7</p>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700 mt-1">Trauma Response</p>
              <p className="text-xs text-slate-500 mt-0.5">Continuous ICU &amp; 1066/108 access</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DYNAMIC HOSPITAL VIDEO SHOWCASE & VIRTUAL CAMPUS TOUR (Apollo & AIIMS Style)
          ========================================================================= */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Virtual Hospital Experience
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Dynamic Hospital Campus &amp; Clinical Walkthrough
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Explore dynamic video tours of Apollo flagship institutes, AIIMS apex departments, and modern trauma centers in action.
              </p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {hospitalVirtualTours.map((tour, idx) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => {
                    setActiveTourIndex(idx);
                    setIsTourPlaying(true);
                  }}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTourIndex === idx
                      ? 'bg-clinical-700 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{tour.icon}</span>
                  <span>{tour.tabName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Cinematic Video Player & Department Telemetry */}
          <div className="mt-8 grid gap-8 lg:grid-cols-12 items-center">
            {/* 16:9 Video Canvas */}
            <div className="lg:col-span-8">
              <div className="relative isolate overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border border-slate-800 aspect-video group">
                <video
                  ref={tourVideoRef}
                  key={hospitalVirtualTours[activeTourIndex].id}
                  autoPlay
                  loop
                  muted={isTourMuted}
                  playsInline
                  poster={hospitalVirtualTours[activeTourIndex].poster}
                  className="h-full w-full object-cover"
                >
                  <source src={hospitalVirtualTours[activeTourIndex].src} type={hospitalVirtualTours[activeTourIndex].type} />
                  {hospitalVirtualTours[activeTourIndex].fallbackSrc && (
                    <source src={hospitalVirtualTours[activeTourIndex].fallbackSrc} type="video/mp4" />
                  )}
                </video>

                {/* Video Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/20">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{hospitalVirtualTours[activeTourIndex].badge}</span>
                    </span>
                    <span className="hidden sm:inline rounded-full bg-emerald-500/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
                      Verified Facility
                    </span>
                  </div>

                  {/* Sound & Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTourMuted(!isTourMuted)}
                      className="rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md px-2.5 py-1 text-white border border-white/20 transition text-xs flex items-center gap-1"
                      title={isTourMuted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                      <span>{isTourMuted ? '🔇 Muted' : '🔊 Sound On'}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Video Controls & Facility Info */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                  <div>
                    <h3 className="text-lg font-bold sm:text-xl drop-shadow">
                      {hospitalVirtualTours[activeTourIndex].title}
                    </h3>
                    <p className="text-xs text-white/85 line-clamp-1 mt-0.5">
                      {hospitalVirtualTours[activeTourIndex].location} · {hospitalVirtualTours[activeTourIndex].subSpecialty}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (tourVideoRef.current) {
                          if (isTourPlaying) {
                            tourVideoRef.current.pause();
                          } else {
                            tourVideoRef.current.play();
                          }
                          setIsTourPlaying(!isTourPlaying);
                        }
                      }}
                      className="rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5 border border-white/20"
                    >
                      <span>{isTourPlaying ? '⏸ Pause' : '▶ Play'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set('q', hospitalVirtualTours[activeTourIndex].searchQuery);
                        navigate(`/hospitals?${params.toString()}`);
                      }}
                      className="rounded-xl bg-[#a54836] hover:bg-[#883c2e] px-4 py-1.5 text-xs font-bold text-white transition shadow-md"
                    >
                      Explore Campus →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Infrastructure Breakdown Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-700">
                  Campus Clinical Highlights
                </span>
                <h4 className="mt-1 text-base font-bold text-slate-900">
                  {hospitalVirtualTours[activeTourIndex].title}
                </h4>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {hospitalVirtualTours[activeTourIndex].description}
                </p>

                <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3 text-xs">
                  {hospitalVirtualTours[activeTourIndex].keyUnits.map((unit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="text-slate-700 font-medium">{unit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Emergency Desk</span>
                    <span className="text-xs font-bold text-rose-700">{hospitalVirtualTours[activeTourIndex].hotline}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set('q', hospitalVirtualTours[activeTourIndex].searchQuery);
                      navigate(`/doctors?${params.toString()}`);
                    }}
                    className="rounded-lg bg-clinical-50 border border-clinical-200 px-3 py-1.5 text-xs font-bold text-clinical-800 hover:bg-clinical-100 transition"
                  >
                    Faculty Profiles →
                  </button>
                </div>
              </div>

              {/* 3 Interactive Quick-Switch Mini Video Cards */}
              <div className="grid grid-cols-3 gap-2">
                {hospitalVirtualTours.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTourIndex(idx);
                      setIsTourPlaying(true);
                    }}
                    className={`group relative overflow-hidden rounded-xl border p-2 text-left transition ${
                      activeTourIndex === idx
                        ? 'border-clinical-600 bg-clinical-50/70 ring-2 ring-clinical-500/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="block text-[11px] font-bold text-slate-900 truncate mt-1">
                      {t.tabName}
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">
                      {t.city}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE "CENTRES OF CLINICAL EXCELLENCE" (AIIMS & Apollo Style Institutes)
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a54836]">
              Clinical Excellence
            </span>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Centres of Clinical Excellence &amp; Quaternary Institutes
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Modeled after premier apex institutes (AIIMS Cardio-Thoracic Centre, Neurosciences Centre, Rotary Cancer Institute &amp; Apollo Heart and Robotic Surgery Institutes).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/doctors"
              className="text-xs font-bold text-clinical-700 hover:text-clinical-900 underline underline-offset-4"
            >
              Browse 177+ Specialists →
            </Link>
          </div>
        </div>

        {/* Tab Navigation + Dynamic Centre Showcase */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left: Interactive Specialty Selector Tabs */}
          <div className="flex flex-row overflow-x-auto gap-2 lg:flex-col lg:overflow-visible pb-2 lg:pb-0">
            {clinicalCentres.map((centre) => {
              const isSelected = centre.id === activeCentreId;
              return (
                <button
                  key={centre.id}
                  type="button"
                  onClick={() => setActiveCentreId(centre.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-150 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-clinical-800 to-clinical-900 text-white shadow-md ring-2 ring-clinical-700 font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{centre.icon}</span>
                    <div>
                      <span className="text-xs lg:text-sm block">{centre.name}</span>
                      <span className={`text-[10px] hidden sm:block ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {centre.institute}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs hidden lg:inline ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                    →
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Dynamic Centre Detail Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <span className="text-4xl">{activeCentre.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    {activeCentre.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    {activeCentre.institute}
                  </p>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    {activeCentre.headline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => searchSpecialty(activeCentre.searchSpecialty)}
                  className="rounded-lg bg-clinical-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-clinical-800 transition"
                >
                  Find {activeCentre.shortName} Hospitals →
                </button>
                <Link
                  to={`/assessment?symptom=${encodeURIComponent(activeCentre.searchSpecialty)}`}
                  className="rounded-lg border border-[#a54836] bg-[#a54836]/10 px-3.5 py-2 text-xs font-bold text-[#a54836] hover:bg-[#a54836]/20 transition"
                >
                  AI Triage
                </Link>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              {activeCentre.description}
            </p>

            {/* Clinical Metrics Grid */}
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200/60">
              {activeCentre.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg md:text-xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Key Technologies & Treatments */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Advanced Equipment &amp; Surgical Capabilities
              </h4>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {activeCentre.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-clinical-50/70 border border-clinical-200/80 px-3 py-1 text-xs font-medium text-clinical-800"
                  >
                    <span>✓</span>
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Common Conditions Treated */}
            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-bold text-slate-800">Frequently Managed Conditions:</span>
              {activeCentre.commonConditions.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => navigate(`/assessment?symptom=${encodeURIComponent(cond)}`)}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 text-xs text-slate-700 transition"
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          DYNAMIC APOLLO & SENIOR FACULTY CAROUSEL (Interactive Slider)
          ========================================================================= */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a54836]">
                Distinguished Faculty
              </span>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Senior Consultants &amp; Department Directors
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-xl">
                Consult verified Senior Consultants, HODs, and Quaternary Specialists practicing across Apollo and premier teaching hospital networks.
              </p>
            </div>

            {/* Prev / Next Carousel Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevDoctor}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 active:scale-95 transition"
                aria-label="Previous doctor"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextDoctor}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 active:scale-95 transition"
                aria-label="Next doctor"
              >
                ›
              </button>
            </div>
          </div>

          {/* Doctors Slider Cards */}
          <div className="mt-8">
            {doctorsLoading ? (
              <div className="py-12 text-center text-sm font-semibold text-slate-500">
                Loading verified Apollo specialists...
              </div>
            ) : visibleDoctors.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleDoctors.map((doc, idx) => (
                  <div
                    key={`${doc._id || doc.name}-${idx}`}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    <div>
                      {/* Top Badge: Verified Status */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <span>✓</span> Verified Specialist
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {doc.city || 'India'}
                        </span>
                      </div>

                      {/* Doctor Avatar & Identity */}
                      <div className="mt-4 flex items-start gap-3.5">
                        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-clinical-700 to-clinical-900 text-white font-bold text-xl shadow-md">
                          {doc.name ? doc.name.replace(/^Dr\.?\s*/i, '').charAt(0) : 'D'}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {doc.name}
                          </h3>
                          <p className="text-xs font-semibold text-clinical-700 mt-0.5">
                            {doc.specialization}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {doc.qualification || 'MBBS, MD'}
                          </p>
                        </div>
                      </div>

                      {/* Hospital Affiliation Box */}
                      <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Hospital Facility
                        </span>
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {doc.hospitalName || doc.hospitalId?.name || 'Apollo Hospitals Network'}
                        </p>
                        {doc.experience && (
                          <p className="text-[11px] text-emerald-700 font-medium mt-1">
                            ⭐ {doc.experience}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        to={`/doctors/${doc._id}`}
                        className="flex-1 rounded-xl bg-clinical-700 py-2.5 text-center text-xs font-bold text-white shadow-sm hover:bg-clinical-800 transition"
                      >
                        Book Consultation
                      </Link>
                      {doc.officialDoctorProfileUrl && (
                        <a
                          href={doc.officialDoctorProfileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          title="View Official Apollo Profile"
                        >
                          Official ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm font-semibold text-slate-500">
                Specialists directory currently loading.
              </div>
            )}

            {/* Slider Indicators */}
            {apolloDoctors.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-1.5">
                {Array.from({ length: Math.min(apolloDoctors.length, 6) }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDoctorIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      doctorIndex === i ? 'w-6 bg-clinical-700' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          REGIONAL QUATERNARY DIRECTORY & METRO MEDICAL HUBS (100% Real Healthcare Facts)
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a54836]">
              Regional Healthcare Directory
            </span>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Regional Quaternary Directory &amp; Metro Care Hubs
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Explore accredited quaternary hospitals, verified Apollo specialists, and Level-1 trauma centers across major Indian metropolitan healthcare hubs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/hospitals?state=${encodeURIComponent(activeMetro.city)}`)}
            className="text-xs font-bold text-clinical-700 hover:underline"
          >
            Explore all {activeMetro.city} facilities →
          </button>
        </div>

        {/* City Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {metroDirectory.map((m) => {
            const isSelected = m.city === selectedMetroCity;
            return (
              <button
                key={m.city}
                type="button"
                onClick={() => setSelectedMetroCity(m.city)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  isSelected
                    ? 'bg-clinical-700 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                📍 {m.city}
              </button>
            );
          })}
        </div>

        {/* Active Metro Telemetry Dashboard Card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{activeMetro.city} Healthcare Hub</h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  Verified Directory
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">State: {activeMetro.state} · Official Public Healthcare Directory</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('state', activeMetro.city);
                  navigate(`/hospitals?${params.toString()}`);
                }}
                className="rounded-lg bg-clinical-700 px-4 py-2 text-xs font-bold text-white hover:bg-clinical-800 transition shadow-sm"
              >
                Find Hospitals in {activeMetro.city}
              </button>
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('state', activeMetro.city);
                  params.set('emergency', 'true');
                  navigate(`/hospitals?${params.toString()}`);
                }}
                className="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-sm"
              >
                🚨 Emergency ICU
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Accredited Hospitals</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{activeMetro.totalHospitals}</p>
              <span className="text-[10px] text-slate-400">Public &amp; Private Network</span>
            </div>

            <div className="rounded-xl bg-emerald-50/60 p-4 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-800 block">Apollo Credentialed Doctors</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{activeMetro.verifiedApolloDoctors}</p>
              <span className="text-[10px] text-emerald-600">Source-Verified Registries</span>
            </div>

            <div className="rounded-xl bg-sky-50/60 p-4 border border-sky-100">
              <span className="text-[11px] font-semibold text-sky-800 block">Accreditation Standards</span>
              <p className="text-lg md:text-xl font-black text-sky-700 mt-1">{activeMetro.accreditation}</p>
              <span className="text-[10px] text-sky-600">Clinical Governance</span>
            </div>

            <div className="rounded-xl bg-purple-50/60 p-4 border border-purple-100">
              <span className="text-[11px] font-semibold text-purple-800 block">Emergency Response</span>
              <p className="text-lg md:text-xl font-black text-purple-700 mt-1">{activeMetro.emergencyUnits}</p>
              <span className="text-[10px] text-purple-600">Continuous 1066 / 108 Access</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50/80 p-4 border border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block mb-1">Key Quaternary Flagships in {activeMetro.city}:</span>
            <p className="text-slate-600 leading-relaxed">{activeMetro.highlightFlagships}</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE ACUTE PRESENTATIONS & SYMPTOM NAVIGATOR
          ========================================================================= */}
      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a54836]">
                Clinical Acuity Stratification
              </span>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Check Symptoms &amp; Priority Triage
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Select your acute complaint to instantly preview clinical severity triage, required specialty departments, and local emergency routing.
              </p>
            </div>

            <Link
              to="/assessment"
              className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Full AI Assessment Diagnostic</span>
              <span>→</span>
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {acuteSymptomsList.map((item) => (
              <div
                key={item.symptom}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/40 p-5 hover:bg-white hover:shadow-md transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${item.acuityColor}`}>
                      {item.acuity}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900 leading-snug">
                    {item.symptom}
                  </h3>
                  <p className="text-[11px] font-semibold text-clinical-700 mt-1">
                    Department: {item.recommendedSpecialty}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {item.response}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <Link
                    to={`/assessment?symptom=${encodeURIComponent(item.symptom)}`}
                    className="text-xs font-bold text-[#a54836] hover:underline"
                  >
                    AI Triage →
                  </Link>
                  <button
                    type="button"
                    onClick={() => searchSpecialty(item.recommendedSpecialty)}
                    className="text-[11px] font-semibold text-clinical-700 hover:underline"
                  >
                    Hospitals
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED PREMIER HOSPITAL NETWORKS (Apollo, Fortis, Manipal)
          ========================================================================= */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a54836]">
              Verified Networks
            </span>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Premier Quaternary Healthcare Networks
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Direct access to accredited quaternary care institutions with validated doctors and 24/7 emergency units.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredNetworks.map((net) => (
              <div
                key={net.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${net.badgeColor}`}>
                      {net.badge}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Apex Care Network</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    {net.name}
                  </h3>
                  <p className="text-xs font-medium text-clinical-700 mt-0.5">{net.tagline}</p>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    {net.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-800 block mb-1">Key Flagships:</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{net.flagships}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Emergency Line:</span>
                      <span className="font-bold text-rose-700">{net.hotline}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set('q', net.searchParam);
                      navigate(`/hospitals?${params.toString()}`);
                    }}
                    className="w-full rounded-xl bg-clinical-700 py-2.5 text-xs font-bold text-white hover:bg-clinical-800 transition shadow-sm text-center"
                  >
                    Explore {net.name} Units →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PATIENT EXPERIENCES & VERIFIED CARE TESTIMONIALS
          ========================================================================= */}
      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a54836]">
              Patient Experiences
            </span>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Trusted by Patients Across India
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Real stories of acute triage, rapid emergency routing, and verified medical outcomes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {patientStories.map((story) => (
              <div
                key={story.patient}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {'★★★★★'}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 italic">
                    "{story.quote}"
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clinical-700 text-white font-bold text-sm">
                    {story.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{story.patient}</h4>
                    <p className="text-[11px] text-slate-500">{story.location}</p>
                    <span className="inline-block text-[10px] font-semibold text-emerald-700 mt-0.5">
                      ✓ {story.verified}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW MEDINEXUS WORKS (Transparent 3-Step Navigation)
          ========================================================================= */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a54836]">
              Transparent Care Navigation
            </span>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              How MediNexus Works
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Navigate acute medical decisions with AI-assisted clinical triage in 3 simple steps.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinical-50 text-base font-bold text-clinical-700">
                1
              </div>
              <h3 className="mt-3.5 text-base font-bold text-slate-900">Enter Symptoms &amp; Location</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Provide your presenting complaint and city (e.g. Mumbai, Bengaluru, Chennai). Optionally attach vitals or upload a medical report.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-base font-bold text-amber-700">
                2
              </div>
              <h3 className="mt-3.5 text-base font-bold text-slate-900">AI Clinical Stratification</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Trained LightGBM triage models classify acuity levels and automatically identify required clinical specialties and resources.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-base font-bold text-emerald-700">
                3
              </div>
              <h3 className="mt-3.5 text-base font-bold text-slate-900">Ranked Local Recommendations</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Receive ranked local hospitals evaluated by verified medical faculty, clinical specialty alignment, travel proximity, and 24/7 emergency infrastructure.
              </p>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-clinical-900 via-clinical-800 to-clinical-900 p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold">Ready to find the right care near you?</h3>
              <p className="mt-1 text-xs text-white/80 leading-relaxed">
                Start our quick 1-minute assessment or explore hospitals by location and medical specialty.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/assessment"
                className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition"
              >
                Start AI Assessment Now →
              </Link>
              <Link
                to="/hospitals"
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                Browse All Hospitals
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
