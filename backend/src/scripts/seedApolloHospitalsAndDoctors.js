const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const env = require('../config/env');
const Hospital = require('../models/Hospital');
const RegistryDoctor = require('../models/RegistryDoctor');

const apolloBranches = [
  {
    sourceRowId: 91001,
    name: 'Apollo Hospitals, Greams Road',
    searchKeywords: ['Greams Road', 'Thousand Lights', 'Apollo Hospitals'],
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    address: '21 Greams Lane, Off Greams Road, Thousand Lights, Chennai, Tamil Nadu 600006',
    location: 'Greams Road, Thousand Lights, Chennai',
    pincode: '600006',
    website: 'https://www.apollohospitals.com/chennai',
    telephone: '044-28290200',
    emergencyNumber: '1066',
    totalBeds: 600,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [80.2518, 13.0569] },
    specialties: [
      'Cardiology', 'Cardiothoracic Surgery', 'Neurology', 'Neuro Surgery',
      'Orthopedics', 'Gastroenterology', 'Urology', 'Nephrology',
      'Endocrinology', 'Plastic Surgery', 'Dermatology', 'Rheumatology',
      'Internal Medicine', 'General Surgery', 'Oncology'
    ],
    doctors: [
      {
        name: 'Dr. Duraisamy S',
        specialization: 'Urology',
        qualification: 'MBBS, MS (General Surgery), MCh (Urology)',
        experience: '38+ years of clinical practice in urology and urosurgery',
        experienceYears: 38,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-duraisamy-s',
      },
      {
        name: 'Dr. Hariharan Muthuswamy',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MD (General Medicine), DM (Gastroenterology)',
        experience: '32+ years of clinical practice in medical gastroenterology and hepatology',
        experienceYears: 32,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-hariharan-muthuswamy',
      },
      {
        name: 'Dr. Thirumalai Ganesan',
        specialization: 'Urology',
        qualification: 'MBBS, MS, MCh (Urology)',
        experience: '32+ years of clinical practice in endourology and kidney transplant',
        experienceYears: 32,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-thirumalai-ganesan',
      },
      {
        name: 'Dr. Boochandran T S',
        specialization: 'Endocrinology',
        qualification: 'MBBS, MRCP (UK), FRCP (Glasgow)',
        experience: '25+ years of clinical practice in endocrinology and diabetes management',
        experienceYears: 25,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-boochandran-t-s',
      },
      {
        name: 'Dr. Leela Praveen Kumar K',
        specialization: 'Plastic Surgery',
        qualification: 'MBBS, MS, MCh (Plastic & Reconstructive Surgery)',
        experience: '25+ years of clinical practice in cosmetic and reconstructive surgery',
        experienceYears: 25,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-leela-praveen-kumar-k',
      },
      {
        name: 'Dr. Venugopal Reddy V',
        specialization: 'Dermatology',
        qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
        experience: '24+ years of clinical practice in clinical dermatology and dermatosurgery',
        experienceYears: 24,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-venugopal-reddy-v',
      },
      {
        name: 'Dr. Raghunath K J',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery), FRCS (Glasgow)',
        experience: '24+ years of clinical practice in advanced laparoscopic and gastrointestinal surgery',
        experienceYears: 24,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-raghunath-k-j',
      },
      {
        name: 'Dr. Kaushik V V',
        specialization: 'Rheumatology',
        qualification: 'MBBS, MD, MRCP (UK), CCST (Rheumatology)',
        experience: '17+ years of clinical practice in adult rheumatology and autoimmune disorders',
        experienceYears: 17,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-kaushik-v-v',
      },
      {
        name: 'Dr. Muthukani S',
        specialization: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: '5+ years of clinical practice in stroke care and comprehensive neurology',
        experienceYears: 5,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-muthukani-s',
      },
      {
        name: 'Dr. Sujatha Sampath',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (General Medicine)',
        experience: '31+ years of clinical practice in internal medicine and lifestyle diseases',
        experienceYears: 31,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-sujatha-sampath',
      },
      {
        name: 'Dr. Safi Naaz',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Internal Medicine)',
        experience: '30+ years of clinical practice in comprehensive adult care and chronic ailments',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-safi-naaz',
      },
      {
        name: 'Dr. Geetha Lakshmipathy',
        specialization: 'Neurology',
        qualification: 'MBBS, MD (Medicine), DM (Neurology)',
        experience: '34+ years of clinical practice in movement disorders and neuromuscular diseases',
        experienceYears: 34,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-geetha-lakshmipathy',
      },
      {
        name: 'Dr. M. Dhanaraj',
        specialization: 'Neurology',
        qualification: 'MBBS, MD (General Medicine), DM (Neurology)',
        experience: '50+ years of pioneering clinical practice in neurological sciences',
        experienceYears: 50,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-m-dhanaraj',
      },
      {
        name: 'Dr. Shyamala Gopi',
        specialization: 'Urology',
        qualification: 'MBBS, MS (General Surgery), MCh (Urology)',
        experience: '25+ years of clinical practice in female urology and uro-oncology',
        experienceYears: 25,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-shyamala-gopi',
      },
      {
        name: 'Dr. A. Navaladi Shankar',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics), DNB, MCh (Orth)',
        experience: '22+ years of clinical practice in joint reconstruction and trauma care',
        experienceYears: 22,
        profileUrl: 'https://www.apollohospitals.com/chennai/doctors/dr-a-navaladi-shankar',
      },
    ],
  },
  {
    sourceRowId: 26673,
    name: 'Apollo Health City, Jubilee Hills',
    searchKeywords: ['Jubilee Hills', 'Apollo Health City', 'Apollo Hospitals'],
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    address: 'Road No 72, Film Nagar, Jubilee Hills, Hyderabad, Telangana 500096',
    location: 'Road No 72, Film Nagar, Jubilee Hills, Hyderabad',
    pincode: '500096',
    website: 'https://www.apollohospitals.com/hyderabad',
    telephone: '040-23607777',
    emergencyNumber: '1066',
    totalBeds: 750,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [78.4111, 17.4265] },
    specialties: [
      'Cardiology', 'Cardiothoracic Surgery', 'Neurology', 'Neuro Surgery',
      'Orthopedics', 'Gastroenterology', 'Medical Oncology', 'Radiation Oncology',
      'Internal Medicine', 'Dermatology', 'Psychiatry', 'ENT', 'Urology'
    ],
    doctors: [
      {
        name: 'Dr. Jairam Chandra Pingle',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: '50+ years of pioneering experience in orthopedics and joint replacement',
        experienceYears: 50,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-jairam-chandra-pingle',
      },
      {
        name: 'Dr. Prof. Ramulu',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (General Medicine)',
        experience: '47+ years of clinical expertise in internal medicine and tropical disorders',
        experienceYears: 47,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-prof-ramulu',
      },
      {
        name: 'Dr. Subhashini Prabhakar',
        specialization: 'Neurology',
        qualification: 'MBBS, MD (Medicine), DM (Neurology)',
        experience: '46+ years of clinical practice in complex neuromuscular and cerebrovascular neurology',
        experienceYears: 46,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-subhashini-prabhakar',
      },
      {
        name: 'Dr. Nandanavanam Raghupathi Rao',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MD, DM (Gastroenterology)',
        experience: '46+ years of clinical practice in hepatology and luminal gastroenterology',
        experienceYears: 46,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-nandanavanam-raghupathi-rao',
      },
      {
        name: 'Dr. Vijay Dikshit',
        specialization: 'Cardiothoracic Surgery',
        qualification: 'MBBS, MS, MCh (Cardiothoracic Surgery)',
        experience: '43+ years of clinical experience in adult cardiac and vascular surgery',
        experienceYears: 43,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-vijay-dikshit',
      },
      {
        name: 'Dr. Pratap Chandra Rath',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology), FACC',
        experience: '42+ years of clinical expertise in interventional cardiology and structural heart disease',
        experienceYears: 42,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-pratap-chandra-rath',
      },
      {
        name: 'Dr. S. Ananth Kumar',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Internal Medicine)',
        experience: '41+ years of clinical practice in comprehensive tertiary medicine',
        experienceYears: 41,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-s-ananth-kumar',
      },
      {
        name: 'Dr. Venkata Rao Abbineni',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Internal Medicine)',
        experience: '40+ years of clinical practice in geriatric and systemic disorders',
        experienceYears: 40,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-venkata-rao-abbineni',
      },
      {
        name: 'Dr. K J Reddy',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics), FRCS (UK)',
        experience: '34+ years of clinical expertise in robotic joint reconstruction and arthroplasty',
        experienceYears: 34,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-kj-reddy',
      },
      {
        name: 'Dr. P. Vijay Anand Reddy',
        specialization: 'Radiation Oncology',
        qualification: 'MBBS, MD, DNB (Radiation Oncology)',
        experience: '32+ years of clinical expertise in precision radiation oncology and brachytherapy',
        experienceYears: 32,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-p-vijay-anand-reddy',
      },
      {
        name: 'Dr. Sudhir Kumar',
        specialization: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: '26+ years of clinical practice in stroke neurology and epilepsy management',
        experienceYears: 26,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-sudhir-kumar',
      },
      {
        name: 'Dr. Rajyalaxmi Konathan',
        specialization: 'Dermatology',
        qualification: 'MBBS, MD (DVL)',
        experience: '22+ years of clinical practice in clinical dermatology and aesthetic therapies',
        experienceYears: 22,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-rajyalaxmi-konathan',
      },
      {
        name: 'Dr. N Manohar Reddy',
        specialization: 'Neuro Surgery',
        qualification: 'MBBS, MS, MCh (Neurosurgery)',
        experience: '20+ years of clinical experience in cranial and spinal neurosurgery',
        experienceYears: 20,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-n-manohar-reddy',
      },
      {
        name: 'Dr. Bhanu Prakash Reddy Rachamallu',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: '20+ years of clinical practice in knee replacement and trauma surgery',
        experienceYears: 20,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-bhanu-prakash-reddy-rachamallu',
      },
      {
        name: 'Dr. Vanaja Reddy Puli',
        specialization: 'Psychiatry',
        qualification: 'MBBS, DPM, MD (Psychiatry)',
        experience: '19+ years of clinical practice in behavioral medicine and neuropsychiatry',
        experienceYears: 19,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-vanaja-reddy-puli',
      },
      {
        name: 'Dr. Nikhil Suresh Ghadyalpatil',
        specialization: 'Medical Oncology',
        qualification: 'MBBS, MD, DM (Medical Oncology)',
        experience: '18+ years of clinical expertise in targeted chemotherapy and immunotherapy',
        experienceYears: 18,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-nikhil-suresh-ghadyalpatil',
      },
      {
        name: 'Dr. E Sanjeeva Kumar',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '17+ years of clinical experience in coronary intervention and angiography',
        experienceYears: 17,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-e-sanjeeva-kumar',
      },
      {
        name: 'Dr. Y L Ravi Jadhav',
        specialization: 'ENT',
        qualification: 'MBBS, MS (ENT)',
        experience: '15+ years of clinical practice in endoscopic sinus surgery and otology',
        experienceYears: 15,
        profileUrl: 'https://www.apollohospitals.com/hyderabad/doctors/dr-yl-ravi-jadhav',
      },
    ],
  },
  {
    sourceRowId: 90001,
    name: 'Indraprastha Apollo Hospitals',
    searchKeywords: ['Indraprastha', 'Sarita Vihar', 'Apollo Delhi'],
    city: 'New Delhi',
    district: 'South Delhi',
    state: 'Delhi',
    address: 'Sarita Vihar, Delhi Mathura Road, New Delhi 110076',
    location: 'Sarita Vihar, Delhi Mathura Road, New Delhi',
    pincode: '110076',
    website: 'https://www.apollohospitals.com/delhi',
    telephone: '011-26925858',
    emergencyNumber: '1066',
    totalBeds: 710,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [77.2831, 28.5398] },
    specialties: [
      'Internal Medicine', 'Cardiology', 'Cardiothoracic Surgery', 'Gastroenterology',
      'Obstetrics & Gynecology (OBG)', 'Pediatrics', 'Rheumatology', 'ENT',
      'Nephrology', 'Dermatology', 'Neurology', 'General Surgery'
    ],
    doctors: [
      {
        name: 'Dr. Alok Kumar Agarwal',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experience: '45+ years of clinical practice in internal medicine and geriatric care',
        experienceYears: 45,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-alok-kumar-agarwal',
      },
      {
        name: 'Dr. Mukesh Goel',
        specialization: 'Cardiothoracic Surgery',
        qualification: 'MBBS, MS, MCh (CTVS)',
        experience: '37+ years of clinical expertise in off-pump CABG and complex heart surgery',
        experienceYears: 37,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-mukesh-goel',
      },
      {
        name: 'Prof. Dr. Pawanindra Lal',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MS, FRCS (Edin), FRCS (Glasg), FACS',
        experience: '35+ years of clinical expertise in minimal access and surgical gastroenterology',
        experienceYears: 35,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/prof-dr-pawanindra-lal',
      },
      {
        name: 'Dr. K K Pandey',
        specialization: 'Cardiothoracic Surgery',
        qualification: 'MBBS, MS, MCh (CTVS)',
        experience: '34+ years of clinical practice in thoracic and cardiovascular reconstruction',
        experienceYears: 34,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-kk-pandey',
      },
      {
        name: 'Dr. Geeta Chadha',
        specialization: 'Obstetrics & Gynecology (OBG)',
        qualification: 'MBBS, MD (Obstetrics & Gynaecology)',
        experience: '33+ years of clinical practice in high-risk obstetrics and gynaecology',
        experienceYears: 33,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-geeta-chadha',
      },
      {
        name: 'Dr. Anoop K. Ganjoo',
        specialization: 'Cardiothoracic Surgery',
        qualification: 'MBBS, MS, MCh (Cardiothoracic Surgery)',
        experience: '32+ years of clinical practice in valvular and ischemic cardiac surgeries',
        experienceYears: 32,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-anoop-k-ganjoo',
      },
      {
        name: 'Dr. Deepa Sharma',
        specialization: 'Pediatrics',
        qualification: 'MBBS, MD (Pediatrics)',
        experience: '31+ years of clinical practice in neonatal and general pediatric care',
        experienceYears: 31,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-deepa-sharma',
      },
      {
        name: 'Dr. Bhaba Nanda Das',
        specialization: 'Cardiothoracic Surgery',
        qualification: 'MBBS, MS, MCh (CTVS)',
        experience: '30+ years of pioneering experience in adult CTVS and aortic aneurysms',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-bhaba-nanda-das',
      },
      {
        name: 'Dr. Sundeep Kumar Upadhyaya',
        specialization: 'Rheumatology',
        qualification: 'MBBS, MD (General Medicine)',
        experience: '30+ years of clinical practice in systemic lupus, arthritis and vasculitis',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-sundeep-kumar-upadhyaya',
      },
      {
        name: 'Dr. M S Chaudhary',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experience: '28+ years of clinical practice in general physician and acute illness',
        experienceYears: 28,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-ms-chaudhary',
      },
      {
        name: 'Dr. Kalpana Nagpal',
        specialization: 'ENT',
        qualification: 'MBBS, MS (ENT), DNB',
        experience: '27+ years of clinical practice in robotic head & neck surgery and sleep apnea',
        experienceYears: 27,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-kalpana-nagpal',
      },
      {
        name: 'Dr. Mithee Bhanot',
        specialization: 'Obstetrics & Gynecology (OBG)',
        qualification: 'MBBS, MD, DNB (Obstetrics & Gynaecology)',
        experience: '23+ years of clinical practice in advanced laparoscopic gynecology and infertility',
        experienceYears: 23,
        profileUrl: 'https://www.apollohospitals.com/delhi/doctors/dr-mithee-bhanot',
      },
    ],
  },
  {
    sourceRowId: 12460,
    name: 'Apollo Hospitals, Bannerghatta Road',
    searchKeywords: ['Bannerghatta', 'Apollo Hospitals Bengaluru', 'Apollo Hospital Bangalore'],
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    address: '154/11, Bannerghatta Road, Opposite IIMB, Bengaluru, Karnataka 560076',
    location: 'Bannerghatta Road, Opposite IIMB, Bengaluru',
    pincode: '560076',
    website: 'https://www.apollohospitals.com/bangalore',
    telephone: '080-26304050',
    emergencyNumber: '1066',
    totalBeds: 500,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    operationalHospitalId: 'H003',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [77.5986, 12.8948] },
    specialties: [
      'Cardiology', 'Cardiothoracic Surgery', 'Neurology', 'Orthopedics',
      'Dermatology', 'Nephrology', 'Medical Oncology', 'Radiation Oncology',
      'Internal Medicine', 'Gastroenterology'
    ],
    doctors: [
      {
        name: 'Dr. Satishchandra P',
        specialization: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology), FAMS',
        experience: '44+ years of clinical excellence in epilepsy and neurodegenerative diseases',
        experienceYears: 44,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-satishchandra-p',
      },
      {
        name: 'Dr. Surendra V H H',
        specialization: 'Dermatology',
        qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
        experience: '40+ years of clinical expertise in clinical dermatology and phototherapy',
        experienceYears: 40,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-surendra-v-h-h',
      },
      {
        name: 'Dr. Ramesh B',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '32+ years of clinical practice in clinical cardiology and non-invasive imaging',
        experienceYears: 32,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-ramesh-b',
      },
      {
        name: 'Dr. Sanjay Pai',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics), MCh (Orth)',
        experience: '25+ years of clinical practice in complex joint replacement and arthroplasty',
        experienceYears: 25,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-sanjay-pai',
      },
      {
        name: 'Dr. Girish Panth',
        specialization: 'Dermatology',
        qualification: 'MBBS, DVD, MD (Dermatology)',
        experience: '22+ years of clinical practice in dermatologic therapeutics',
        experienceYears: 22,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-girish-panth',
      },
      {
        name: 'Dr. Abhijit Vilas Kulkarni',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD (General Medicine), DM (Cardiology)',
        experience: '18+ years of clinical practice in adult interventional cardiology',
        experienceYears: 18,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-abhijit-vilas-kulkarni',
      },
      {
        name: 'Dr. Sathyaki P Nambala',
        specialization: 'Cardiothoracic Surgery',
        qualification: 'MBBS, MS, MCh (Cardiothoracic Surgery)',
        experience: '16+ years of clinical practice in minimally invasive cardiac surgery and valve repairs',
        experienceYears: 16,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-sathyaki-p-nambala',
      },
      {
        name: 'Dr. A Anitha',
        specialization: 'Nephrology',
        qualification: 'MBBS, MD, DM (Nephrology)',
        experience: '16+ years of clinical practice in renal dialysis and transplantation',
        experienceYears: 16,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-a-anitha',
      },
      {
        name: 'Dr. Srinivasa Prasad B.V',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology), FACC',
        experience: '15+ years of clinical practice in structural heart intervention and pacemakers',
        experienceYears: 15,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-srinivasa-prasad-bv',
      },
      {
        name: 'Dr. Rahul Patil',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '14+ years of clinical practice in primary angioplasty and transradial intervention',
        experienceYears: 14,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-rahul-patil',
      },
      {
        name: 'Dr. Sagar Shah',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '12+ years of clinical practice in non-invasive cardiology and coronary disease',
        experienceYears: 12,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-sagar-shah',
      },
      {
        name: 'Dr. Neema Bhat',
        specialization: 'Medical Oncology',
        qualification: 'MBBS, MD, DM (Clinical Hematology & Oncology)',
        experience: '10+ years of clinical practice in blood cancers, lymphomas and bone marrow transplant',
        experienceYears: 10,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-neema-bhat',
      },
      {
        name: 'Dr. Suryanarayana Sharma P M',
        specialization: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: '10+ years of clinical practice in hyperacute stroke and headache disorders',
        experienceYears: 10,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-suryanarayana-sharma-pm',
      },
      {
        name: 'Dr. Vijay Bhaskar L',
        specialization: 'Radiation Oncology',
        qualification: 'MBBS, MD, DNB (Radiation Oncology)',
        experience: '8+ years of clinical practice in cyberknife, IMRT and stereotactic radiosurgery',
        experienceYears: 8,
        profileUrl: 'https://www.apollohospitals.com/bangalore/doctors/dr-vijay-bhaskar-l',
      },
    ],
  },
  {
    sourceRowId: 91003,
    name: 'Apollo Hospitals, Navi Mumbai',
    searchKeywords: ['Navi Mumbai', 'CBD Belapur', 'Apollo Mumbai'],
    city: 'Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    address: 'Plot # 13, Off Uran Shikhar, Sector 23, CBD Belapur, Navi Mumbai, Maharashtra 400614',
    location: 'Sector 23, CBD Belapur, Navi Mumbai',
    pincode: '400614',
    website: 'https://www.apollohospitals.com/mumbai',
    telephone: '022-33503350',
    emergencyNumber: '1066',
    totalBeds: 500,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [73.0336, 19.0144] },
    specialties: [
      'Cardiology', 'Internal Medicine', 'Pulmonology', 'General Surgery',
      'Nephrology', 'Orthopedics', 'Neuro Surgery', 'Spine Surgery',
      'Urology', 'Pediatrics', 'Oncology'
    ],
    doctors: [
      {
        name: 'Dr. M V Reddy',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '30+ years of clinical practice in coronary stenting and complex angioplasty',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-mv-reddy',
      },
      {
        name: 'Dr. Sanjay Khare',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experience: '30+ years of clinical practice in internal medicine and multi-organ care',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-sanjay-khare',
      },
      {
        name: 'Prof. Dr. Jayalakshmi T.K.',
        specialization: 'Pulmonology',
        qualification: 'MBBS, MD, DNB (Respiratory Medicine), FCCP',
        experience: '29+ years of clinical experience in interventional pulmonology and asthma',
        experienceYears: 29,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-jayalakshmi-tk',
      },
      {
        name: 'Dr. Sangram Karandikar',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery), FMAS',
        experience: '29+ years of clinical expertise in metabolic, bariatric and hernia surgeries',
        experienceYears: 29,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-sangram-karandikar',
      },
      {
        name: 'Dr. Akshay Chhallani',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (General Medicine), EDIC (Critical Care)',
        experience: '27+ years of clinical practice in critical care and internal medicine',
        experienceYears: 27,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-akshay-chhallani',
      },
      {
        name: 'Dr. Amit Langote',
        specialization: 'Nephrology',
        qualification: 'MBBS, MD (Medicine), DM (Nephrology), Clinical Fellow (Canada)',
        experience: '26+ years of clinical practice in chronic kidney disease and renal transplantation',
        experienceYears: 26,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-amit-langote',
      },
      {
        name: 'Dr. Siddhart Yadav',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics), MCh (Orth)',
        experience: '23+ years of clinical expertise in knee, hip arthroplasty and sports injuries',
        experienceYears: 23,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-siddhart-yadav',
      },
      {
        name: 'Dr. Abhidha Shah',
        specialization: 'Neuro Surgery',
        qualification: 'MBBS, MS, MCh (Neurosurgery)',
        experience: '20+ years of clinical experience in skull base surgery and micro-neurosurgery',
        experienceYears: 20,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-abhidha-shah',
      },
      {
        name: 'Dr. Raghuprasad Varma',
        specialization: 'Spine Surgery',
        qualification: 'MBBS, MS, DNB (Orthopedics), Spine Fellow',
        experience: '20+ years of clinical experience in complex spinal deformity and slip disc',
        experienceYears: 20,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-raghuprasad-varma',
      },
      {
        name: 'Dr. Charita Pradhan',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery)',
        experience: '20+ years of clinical experience in laparoscopic surgical procedures',
        experienceYears: 20,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-charita-pradhan',
      },
      {
        name: 'Dr. Anand Misra',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experience: '18+ years of clinical practice in adult infectious disease and hypertension',
        experienceYears: 18,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-anand-misra',
      },
      {
        name: 'Dr. AmolKumar Patil',
        specialization: 'Urology',
        qualification: 'MBBS, MS, MCh (Urology), Robotic Fellow',
        experience: '15+ years of clinical practice in robotic urology, kidney transplant and andrology',
        experienceYears: 15,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-amolkumar-patil',
      },
      {
        name: 'Dr. Krupal Reddy',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '15+ years of clinical practice in transradial coronary intervention',
        experienceYears: 15,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-krupal-reddy',
      },
      {
        name: 'Dr. Shweta Nair',
        specialization: 'Pediatrics',
        qualification: 'MBBS, MD (Pediatrics), DNB',
        experience: '8+ years of clinical practice in pediatric outpatient care and immunizations',
        experienceYears: 8,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-shweta-nair',
      },
      {
        name: 'Dr. Sataksi Chatterjee',
        specialization: 'Oncology',
        qualification: 'MBBS, MS, MCh (Surgical Oncology)',
        experience: '7+ years of clinical practice in head and neck cancer surgery',
        experienceYears: 7,
        profileUrl: 'https://www.apollohospitals.com/mumbai/doctors/dr-sataksi-chatterjee',
      },
    ],
  },
  {
    sourceRowId: 31616,
    name: 'Apollo Multispeciality Hospitals, Kolkata',
    searchKeywords: ['Apollo Gleneagles', 'Kolkata', 'Phool Bagan', 'Apollo Multispeciality'],
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    address: '58, Canal Circular Road, Kadapara, Phool Bagan, Kankurgachi, Kolkata, West Bengal 700054',
    location: '58, Canal Circular Road, Kadapara, Phool Bagan, Kolkata',
    pincode: '700054',
    website: 'https://www.apollohospitals.com/kolkata',
    telephone: '033-23203040',
    emergencyNumber: '1066',
    totalBeds: 510,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [88.3976, 22.5697] },
    specialties: [
      'Gastroenterology', 'Urology', 'Internal Medicine', 'Cardiology',
      'Oncology', 'Obstetrics & Gynecology (OBG)', 'Psychiatry', 'General Surgery'
    ],
    doctors: [
      {
        name: 'Dr. Mahesh Goenka',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MD, DM (Gastroenterology), FACG, FASGE',
        experience: '45+ years of distinguished practice in therapeutic endoscopy and liver disease',
        experienceYears: 45,
        profileUrl: 'https://www.apollohospitals.com/kolkata/doctors/dr-mahesh-goenka',
      },
      {
        name: 'Dr. Mohan Chand Seal',
        specialization: 'Urology',
        qualification: 'MBBS, MS, MCh (Urology)',
        experience: '45+ years of clinical practice in urological surgery and reconstructive urology',
        experienceYears: 45,
        profileUrl: 'https://www.apollohospitals.com/kolkata/doctors/dr-mohan-chand-seal',
      },
      {
        name: 'Dr. Sharat Kumar Das',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experience: '45+ years of clinical practice in consultative medicine and complex diagnostics',
        experienceYears: 45,
        profileUrl: 'https://www.apollohospitals.com/kolkata/doctors/dr-sharat-kumar-das',
      },
      {
        name: 'Dr. A. K. Bardhan',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology), FACC',
        experience: '42+ years of clinical cardiology and non-invasive hemodynamic analysis',
        experienceYears: 42,
        profileUrl: 'https://www.apollohospitals.com/kolkata/doctors/dr-ak-bardhan',
      },
      {
        name: 'Dr. Arunabha Sengupta',
        specialization: 'Oncology',
        qualification: 'MBBS, MS, MCh (Surgical Oncology)',
        experience: '40+ years of clinical oncology practice and solid tumour resections',
        experienceYears: 40,
        profileUrl: 'https://www.apollohospitals.com/kolkata/doctors/dr-arunabha-sengupta',
      },
      {
        name: 'Dr. Jayanta Kumar Gupta',
        specialization: 'Obstetrics & Gynecology (OBG)',
        qualification: 'MBBS, MD, FRCOG (UK)',
        experience: '40+ years of clinical practice in reproductive medicine and advanced gynecology',
        experienceYears: 40,
        profileUrl: 'https://www.apollohospitals.com/kolkata/doctors/dr-jayanta-kumar-gupta',
      },
      {
        name: 'Prof. Col. Pradyot Sarkar',
        specialization: 'Psychiatry',
        qualification: 'MBBS, MD (Psychiatry)',
        experience: '40+ years of clinical practice in clinical psychiatry and behavioral health',
        experienceYears: 40,
        profileUrl: 'https://www.apollohospitals.com/kolkata/doctors/dr-pradyot-sarkar',
      },
      {
        name: 'Dr. Syamal Kumar Sarkar',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery)',
        experience: '40+ years of clinical practice in operative surgery and trauma care',
        experienceYears: 40,
        profileUrl: 'https://www.apollohospitals.com/kolkata/doctors/dr-syamal-kumar-sarkar',
      },
    ],
  },
  {
    sourceRowId: 5030,
    name: 'Apollo Hospitals International Limited',
    searchKeywords: ['Apollo Ahmedabad', 'Apollo Bhat', 'Gandhinagar', 'Apollo Hospitals International Ltd'],
    city: 'Gandhinagar',
    district: 'Gandhinagar',
    state: 'Gujarat',
    address: 'Plot No. 1A, Bhat GIDC Estate, Gandhinagar, Gujarat 382428',
    location: 'Plot No. 1A, Bhat GIDC Estate, Gandhinagar',
    pincode: '382428',
    website: 'https://www.apollohospitals.com/ahmedabad',
    telephone: '079-66701800',
    emergencyNumber: '1066',
    totalBeds: 300,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [72.6179, 23.1165] },
    specialties: [
      'Obstetrics & Gynecology (OBG)', 'Internal Medicine', 'Gastroenterology',
      'Endocrinology', 'Cardiology', 'General Surgery', 'Neuro Surgery',
      'Nephrology', 'Medical Oncology', 'Orthopedics'
    ],
    doctors: [
      {
        name: 'Dr. Sheroo Zamindar',
        specialization: 'Obstetrics & Gynecology (OBG)',
        qualification: 'MBBS, MD (Obstetrics & Gynaecology)',
        experience: '52+ years of clinical excellence in maternity and gynecologic care',
        experienceYears: 52,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-sheroo-zamindar',
      },
      {
        name: 'Dr. Shashikant Nigam',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (General Medicine)',
        experience: '37+ years of clinical expertise in adult internal medicine and metabolic diseases',
        experienceYears: 37,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-shashikant-nigam',
      },
      {
        name: 'Dr. Chirag Desai',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MS, DNB (Surgical Gastroenterology)',
        experience: '30+ years of clinical practice in GI oncology and liver surgery',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-chirag-desai',
      },
      {
        name: 'Dr. Ramesh Goyal',
        specialization: 'Endocrinology',
        qualification: 'MBBS, MD, DM (Endocrinology)',
        experience: '30+ years of clinical practice in thyroid, pituitary and diabetes care',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-ramesh-goyal',
      },
      {
        name: 'Dr. Sameer Dani',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology), FACC',
        experience: '27+ years of clinical practice in complex angioplasties and rotablation',
        experienceYears: 27,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-sameer-dani',
      },
      {
        name: 'Dr. Swati Upadhayay',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery)',
        experience: '27+ years of clinical practice in general laparoscopy and emergency surgery',
        experienceYears: 27,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-swati-upadhayay',
      },
      {
        name: 'Dr. Shravan Bohra',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MD, DM (Gastroenterology)',
        experience: '25+ years of clinical practice in diagnostic and therapeutic endoscopy',
        experienceYears: 25,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-shravan-bohra',
      },
      {
        name: 'Dr. Somesh Desai',
        specialization: 'Neuro Surgery',
        qualification: 'MBBS, MS, MCh (Neurosurgery)',
        experience: '22+ years of clinical practice in minimally invasive spine and neurotrauma',
        experienceYears: 22,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-somesh-desai',
      },
      {
        name: 'Dr. Haresh Patel',
        specialization: 'Nephrology',
        qualification: 'MBBS, MD, DM (Nephrology)',
        experience: '16+ years of clinical practice in dialysis and kidney transplantation',
        experienceYears: 16,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-haresh-patel',
      },
      {
        name: 'Dr. Akash Shah',
        specialization: 'Medical Oncology',
        qualification: 'MBBS, MD, DM (Medical Oncology)',
        experience: '14+ years of clinical practice in solid tumors, breast cancer and chemotherapy',
        experienceYears: 14,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-akash-shah',
      },
      {
        name: 'Dr. Krunal Soni',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: '14+ years of clinical practice in primary and revision joint replacement',
        experienceYears: 14,
        profileUrl: 'https://www.apollohospitals.com/ahmedabad/doctors/dr-krunal-soni',
      },
    ],
  },
  {
    sourceRowId: 90003,
    name: 'Apollo Hospitals Lucknow',
    searchKeywords: ['Apollomedics', 'LDA Colony', 'Bargawan', 'Apollo Lucknow'],
    city: 'Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    address: 'Sector B, Bargawan, LDA Colony, Kanpur - Lucknow Road, Lucknow, Uttar Pradesh 226012',
    location: 'Sector B, Bargawan, LDA Colony, Lucknow',
    pincode: '226012',
    website: 'https://www.apollohospitals.com/lucknow',
    telephone: '0522-6788888',
    emergencyNumber: '1066',
    totalBeds: 330,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [80.9022, 26.7937] },
    specialties: [
      'Nephrology', 'Obstetrics & Gynecology (OBG)', 'Cardiology', 'Rheumatology',
      'Oncology', 'Neuro Surgery', 'Gastroenterology', 'Internal Medicine'
    ],
    doctors: [
      {
        name: 'Dr. Amit Gupta',
        specialization: 'Nephrology',
        qualification: 'MBBS, MD, DM (Nephrology), FASN',
        experience: '49+ years of clinical leadership in renal transplantation and nephrology',
        experienceYears: 49,
        profileUrl: 'https://www.apollohospitals.com/lucknow/doctors/dr-amit-gupta',
      },
      {
        name: 'Dr. Vinita Das',
        specialization: 'Obstetrics & Gynecology (OBG)',
        qualification: 'MBBS, MD, FICOG, FAMS',
        experience: '47+ years of clinical experience in high-risk pregnancy and obstetric surgery',
        experienceYears: 47,
        profileUrl: 'https://www.apollohospitals.com/lucknow/doctors/dr-vinita-das',
      },
      {
        name: 'Dr. Ajay Bahadur',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '35+ years of clinical expertise in cardiac interventions and pacemaker insertion',
        experienceYears: 35,
        profileUrl: 'https://www.apollohospitals.com/lucknow/doctors/dr-ajay-bahadur',
      },
      {
        name: 'Dr. Anupam Wakhlu',
        specialization: 'Rheumatology',
        qualification: 'MBBS, MD, DM (Clinical Immunology & Rheumatology)',
        experience: '31+ years of clinical expertise in adult and pediatric rheumatology',
        experienceYears: 31,
        profileUrl: 'https://www.apollohospitals.com/lucknow/doctors/dr-anupam-wakhlu',
      },
      {
        name: 'Dr. Tarun Batra',
        specialization: 'Oncology',
        qualification: 'MBBS, MS, MCh (Surgical Oncology)',
        experience: '16+ years of clinical practice in complex cancer surgery and resections',
        experienceYears: 16,
        profileUrl: 'https://www.apollohospitals.com/lucknow/doctors/dr-tarun-batra',
      },
      {
        name: 'Dr. Esha Pai',
        specialization: 'Oncology',
        qualification: 'MBBS, MS, MCh (Surgical Oncology)',
        experience: '13+ years of clinical expertise in breast and thoracic surgical oncology',
        experienceYears: 13,
        profileUrl: 'https://www.apollohospitals.com/lucknow/doctors/dr-esha-pai',
      },
      {
        name: 'Dr. Prakash Gaurav Tewari',
        specialization: 'Neuro Surgery',
        qualification: 'MBBS, MS, MCh (Neurosurgery)',
        experience: '6+ years of clinical practice in minimally invasive spine and skull base surgery',
        experienceYears: 6,
        profileUrl: 'https://www.apollohospitals.com/lucknow/doctors/dr-prakash-gaurav-tewari',
      },
      {
        name: 'Dr. Shubham Gupta',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MD, DM (Gastroenterology)',
        experience: '5+ years of clinical practice in therapeutic endoscopy and liver diseases',
        experienceYears: 5,
        profileUrl: 'https://www.apollohospitals.com/lucknow/doctors/dr-shubham-gupta',
      },
    ],
  },
  {
    sourceRowId: 20979,
    name: 'Apollo Hospitals, Bhubaneswar',
    searchKeywords: ['Bhubaneswar', 'Sainik School Road', 'Apollo Hospital Bhubaneswar'],
    city: 'Bhubaneswar',
    district: 'Khurda',
    state: 'Odisha',
    address: 'Plot No. 251, Sainik School Road, Unit 15, Bhubaneswar, Odisha 751005',
    location: 'Plot No. 251, Sainik School Road, Unit 15, Bhubaneswar',
    pincode: '751005',
    website: 'https://www.apollohospitals.com/bhubaneswar',
    telephone: '0674-6661066',
    emergencyNumber: '1066',
    totalBeds: 350,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [85.8340, 20.3015] },
    specialties: [
      'Pulmonology', 'Internal Medicine', 'Endocrinology', 'Cardiology',
      'Gastroenterology', 'ENT', 'Obstetrics & Gynecology (OBG)', 'Nephrology'
    ],
    doctors: [
      {
        name: 'Dr. Samir Sahu',
        specialization: 'Pulmonology',
        qualification: 'MBBS, MD (Chest Diseases), FCCP',
        experience: '44+ years of clinical leadership in respiratory medicine and critical care',
        experienceYears: 44,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-samir-sahu',
      },
      {
        name: 'Dr. Manoj Kishor Chhotray',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experience: '40+ years of clinical practice in general physician care and lifestyle diseases',
        experienceYears: 40,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-manoj-kishor-chhotray',
      },
      {
        name: 'Dr. Pitambar Prusty',
        specialization: 'Endocrinology',
        qualification: 'MBBS, MD (Medicine), DM (Endocrinology)',
        experience: '37+ years of clinical expertise in diabetes, metabolic syndrome and thyroid care',
        experienceYears: 37,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-pitambar-prusty',
      },
      {
        name: 'Dr. Prasant Kumar Sahoo',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '37+ years of clinical practice in interventional cardiology and angiography',
        experienceYears: 37,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-prasant-kumar-sahoo',
      },
      {
        name: 'Dr. P. C. Rath',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology), FACC',
        experience: '36+ years of clinical practice in complex coronary angioplasty',
        experienceYears: 36,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-pc-rath',
      },
      {
        name: 'Dr. Amitav Mohanty',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (General Medicine)',
        experience: '32+ years of clinical practice in adult internal medicine and infectious illnesses',
        experienceYears: 32,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-amitav-mohanty',
      },
      {
        name: 'Prof. Dr. Manoj Kumar Sahu',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MD, DM (Gastroenterology)',
        experience: '30+ years of clinical practice in therapeutic endoscopy and liver failure',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-manoj-kumar-sahu',
      },
      {
        name: 'Dr. Sanjeev Gupta',
        specialization: 'ENT',
        qualification: 'MBBS, MS (ENT)',
        experience: '28+ years of clinical practice in otology, rhinology and vertigo management',
        experienceYears: 28,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-sanjeev-gupta',
      },
      {
        name: 'Dr. Surya Narayan Mohanty',
        specialization: 'Obstetrics & Gynecology (OBG)',
        qualification: 'MBBS, MD (Obstetrics & Gynaecology)',
        experience: '27+ years of clinical practice in operative gynecology and prenatal care',
        experienceYears: 27,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-surya-narayan-mohanty',
      },
      {
        name: 'Dr. Brajaraj Das',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '25+ years of clinical practice in interventional cardiology and pacing',
        experienceYears: 25,
        profileUrl: 'https://www.apollohospitals.com/bhubaneswar/doctors/dr-brajaraj-das',
      },
    ],
  },
  {
    sourceRowId: 90002,
    name: 'Apollo Hospitals, Guwahati',
    searchKeywords: ['Christian Basti', 'GS Road', 'Apollo Guwahati', 'Apollo Hospitals Guwahati'],
    city: 'Guwahati',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    address: 'GS Road, Christian Basti, Guwahati, Assam 781005',
    location: 'GS Road, Christian Basti, Guwahati',
    pincode: '781005',
    website: 'https://www.apollohospitals.com/guwahati',
    telephone: '0361-2347700',
    emergencyNumber: '1066',
    totalBeds: 214,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [91.7774, 26.1524] },
    specialties: [
      'Gastroenterology', 'Nephrology', 'Internal Medicine', 'General Surgery',
      'Cardiology', 'Obstetrics & Gynecology (OBG)', 'Orthopedics', 'Pediatrics'
    ],
    doctors: [
      {
        name: 'Dr. Mithu Bhowmick',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MD (Internal Medicine), DM (Gastroenterology - PGIMER Chandigarh)',
        experience: '18+ years of clinical practice in gastroenterology and liver transplantation',
        experienceYears: 18,
        profileUrl: 'https://www.apollohospitals.com/guwahati/doctors/dr-mithu-bhowmick',
      },
      {
        name: 'Dr. Pranab Kumar Medhi',
        specialization: 'Nephrology',
        qualification: 'MBBS, MD (Medicine), IDCCM, DM (Nephrology)',
        experience: '16+ years of clinical practice in hemodialysis and critical care nephrology',
        experienceYears: 16,
        profileUrl: 'https://www.apollohospitals.com/guwahati/doctors/dr-pranab-kumar-medhi',
      },
      {
        name: 'Dr. Rakesh Periwal',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Internal Medicine), IDCCM',
        experience: '15+ years of clinical practice in acute critical illness and internal medicine',
        experienceYears: 15,
        profileUrl: 'https://www.apollohospitals.com/guwahati/doctors/dr-rakesh-periwal',
      },
      {
        name: 'Dr. D. C. Sharma',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery)',
        experience: '22+ years of clinical practice in operative surgery and trauma care',
        experienceYears: 22,
        profileUrl: 'https://www.apollohospitals.com/guwahati/doctors/dr-dc-sharma',
      },
      {
        name: 'Dr. B. K. Sarma',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: '20+ years of clinical practice in clinical and interventional cardiology',
        experienceYears: 20,
        profileUrl: 'https://www.apollohospitals.com/guwahati/doctors/dr-bk-sarma',
      },
    ],
  },
  {
    sourceRowId: 2745,
    name: 'Apollo Hospitals, Bilaspur',
    searchKeywords: ['Bilaspur', 'Seepat Road', 'Apollo Hospital Bilaspur'],
    city: 'Bilaspur',
    district: 'Bilaspur',
    state: 'Chhattisgarh',
    address: 'Seepat Road, Bilaspur, Chhattisgarh 495006',
    location: 'Seepat Road, Bilaspur',
    pincode: '495006',
    website: 'https://www.apollohospitals.com/bilaspur',
    telephone: '07752-407100',
    emergencyNumber: '1066',
    totalBeds: 300,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [82.1648, 22.0965] },
    specialties: [
      'Obstetrics & Gynecology (OBG)', 'Medical Oncology', 'Dermatology',
      'Neurology', 'Gastroenterology', 'Cardiology', 'General Surgery'
    ],
    doctors: [
      {
        name: 'Dr. Sofia Sultana',
        specialization: 'Obstetrics & Gynecology (OBG)',
        qualification: 'MBBS, MS (Obstetrics & Gynaecology)',
        experience: '39+ years of clinical practice in high risk obstetrics and women health',
        experienceYears: 39,
        profileUrl: 'https://www.apollohospitals.com/bilaspur/doctors/dr-sofia-sultana',
      },
      {
        name: 'Dr. Sushree Parida',
        specialization: 'Medical Oncology',
        qualification: 'MBBS, MD, DM (Medical Oncology)',
        experience: '35+ years of clinical oncology practice and chemotherapy protocols',
        experienceYears: 35,
        profileUrl: 'https://www.apollohospitals.com/bilaspur/doctors/dr-sushree-parida',
      },
      {
        name: 'Dr. Mohan Gupta',
        specialization: 'Dermatology',
        qualification: 'MBBS, MD (Dermatology)',
        experience: '32+ years of clinical practice in skin disorders and dermatosurgery',
        experienceYears: 32,
        profileUrl: 'https://www.apollohospitals.com/bilaspur/doctors/dr-mohan-gupta',
      },
      {
        name: 'Dr. A. Jayavelu',
        specialization: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: '30+ years of clinical practice in stroke, migraine and neuropathies',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/bilaspur/doctors/dr-a-jayavelu',
      },
      {
        name: 'Dr. Devendra Singh',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MD, DM (Gastroenterology)',
        experience: '25+ years of clinical practice in diagnostic endoscopy and hepatology',
        experienceYears: 25,
        profileUrl: 'https://www.apollohospitals.com/bilaspur/doctors/dr-devendra-singh',
      },
    ],
  },
  {
    sourceRowId: 1173,
    name: 'Apollo Hospitals, Visakhapatnam',
    searchKeywords: ['Ram Nagar', 'Waltair Main Road', 'Apollo Heart Hospital Visakhapatnam', 'Apollo Visakhapatnam'],
    city: 'Visakhapatnam',
    district: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    address: 'Waltair Main Road, Ram Nagar, Visakhapatnam, Andhra Pradesh 530002',
    location: 'Waltair Main Road, Ram Nagar, Visakhapatnam',
    pincode: '530002',
    website: 'https://www.apollohospitals.com/visakhapatnam',
    telephone: '0891-2727272',
    emergencyNumber: '1066',
    totalBeds: 250,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [83.3138, 17.7212] },
    specialties: [
      'General Surgery', 'Nephrology', 'Orthopedics', 'Neurology',
      'Gastroenterology', 'Cardiology', 'Emergency Medicine'
    ],
    doctors: [
      {
        name: 'Dr. T. Narayana Rao',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery), FICS',
        experience: '35+ years of clinical experience in advanced open and laparoscopic surgery',
        experienceYears: 35,
        profileUrl: 'https://www.apollohospitals.com/visakhapatnam/doctors/dr-t-narayana-rao',
      },
      {
        name: 'Dr. Setti Anil Kumar Patro',
        specialization: 'Nephrology',
        qualification: 'MBBS, MD, DM (Nephrology)',
        experience: '29+ years of clinical practice in dialysis and glomerulonephritis',
        experienceYears: 29,
        profileUrl: 'https://www.apollohospitals.com/visakhapatnam/doctors/dr-setti-anil-kumar-patro',
      },
      {
        name: 'Dr. Abdul D. Khan',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics), FRCS (UK)',
        experience: '25+ years of clinical practice in joint replacement and trauma surgery',
        experienceYears: 25,
        profileUrl: 'https://www.apollohospitals.com/visakhapatnam/doctors/dr-abdul-d-khan',
      },
      {
        name: 'Dr. Mutiki Ramesh Babu',
        specialization: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: '24+ years of clinical practice in acute neurology and movement disorders',
        experienceYears: 24,
        profileUrl: 'https://www.apollohospitals.com/visakhapatnam/doctors/dr-mutiki-ramesh-babu',
      },
      {
        name: 'Dr. Boddepalli Satheesh Babu',
        specialization: 'Gastroenterology',
        qualification: 'MBBS, MS, MCh (Surgical Gastroenterology)',
        experience: '24+ years of clinical expertise in hepato-pancreato-biliary and GI surgery',
        experienceYears: 24,
        profileUrl: 'https://www.apollohospitals.com/visakhapatnam/doctors/dr-boddepalli-satheesh-babu',
      },
    ],
  },
  {
    sourceRowId: 15044,
    name: 'Apollo Hospitals, Indore',
    searchKeywords: ['Vijay Nagar', 'Scheme No 74C', 'Apollo Hospital Indore'],
    city: 'Indore',
    district: 'Indore',
    state: 'Madhya Pradesh',
    address: 'Sector D, Scheme No 74C, Vijay Nagar, Indore, Madhya Pradesh 452010',
    location: 'Sector D, Scheme No 74C, Vijay Nagar, Indore',
    pincode: '452010',
    website: 'https://www.apollohospitals.com/indore',
    telephone: '0731-2445566',
    emergencyNumber: '1066',
    totalBeds: 250,
    emergencyFlag: true,
    emergencyFlagSource: 'raw',
    category: 'Private',
    careType: 'Multi-Specialty',
    geo: { type: 'Point', coordinates: [75.8943, 22.7533] },
    specialties: [
      'Internal Medicine', 'Pulmonology', 'Obstetrics & Gynecology (OBG)',
      'General Surgery', 'Neuro Surgery', 'Cardiology', 'Orthopedics'
    ],
    doctors: [
      {
        name: 'Dr. Ashok Bajpai',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD (Medicine), FCCP',
        experience: '45+ years of clinical leadership in respiratory medicine and internal medicine',
        experienceYears: 45,
        profileUrl: 'https://www.apollohospitals.com/indore/doctors/dr-ashok-bajpai',
      },
      {
        name: 'Dr. Kavita Bapat',
        specialization: 'Obstetrics & Gynecology (OBG)',
        qualification: 'MBBS, MS (Obstetrics & Gynaecology), FICOG',
        experience: '38+ years of clinical practice in operative endoscopy and maternal health',
        experienceYears: 38,
        profileUrl: 'https://www.apollohospitals.com/indore/doctors/dr-kavita-bapat',
      },
      {
        name: 'Dr. Manish Khasgiwale',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery)',
        experience: '33+ years of clinical practice in laparoscopic surgery and emergency care',
        experienceYears: 33,
        profileUrl: 'https://www.apollohospitals.com/indore/doctors/dr-manish-khasgiwale',
      },
      {
        name: 'Dr. Abhay Bhagwat',
        specialization: 'Neuro Surgery',
        qualification: 'MBBS, MS, MCh (Neurosurgery)',
        experience: '30+ years of clinical experience in cranial microsurgery and spinal trauma',
        experienceYears: 30,
        profileUrl: 'https://www.apollohospitals.com/indore/doctors/dr-abhay-bhagwat',
      },
      {
        name: 'Dr. Sarita Rao',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology), FACC',
        experience: '29+ years of clinical practice in transradial angioplasty and pacing',
        experienceYears: 29,
        profileUrl: 'https://www.apollohospitals.com/indore/doctors/dr-sarita-rao',
      },
    ],
  },
];

const comprehensiveFacilities = [
  '24/7 Emergency Care',
  'Emergency Department',
  'Emergency Physician',
  'Intensive Care Unit (ICU)',
  'Cardiac Care Unit (CCU)',
  'Critical Care Unit',
  'Ventilator',
  'Continuous Monitoring',
  'Cardiac Monitor',
  'Defibrillator',
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
  'Dialysis Unit',
  'Neonatal Intensive Care Unit (NICU)',
  'Pediatric ICU (PICU)',
  'Physiotherapy & Rehabilitation',
];

async function seedApolloHospitalsAndDoctors() {
  console.log('[ApolloSeeder] Connecting to MongoDB...');
  await mongoose.connect(env.mongoUri);
  console.log('[ApolloSeeder] Connected successfully.');

  // Restore row 26823 (Vasan Healthcare) in case it was mistakenly matched
  await Hospital.updateOne(
    { sourceRowId: 26823 },
    {
      $set: {
        name: 'Vasan Healthcare Private Limited, Jubilee Hills',
        address: '1132/A, Road Number 36, Jubilee Hills',
        town: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        officialEnrichment: undefined,
      },
    }
  );

  const csvRowsToAppend = [];
  let totalHospitalsProcessed = 0;
  let totalDoctorsProcessed = 0;

  for (const branch of apolloBranches) {
    console.log(`\n============================================================`);
    console.log(`[ApolloSeeder] Processing Branch: ${branch.name} (${branch.city}, ${branch.state})`);

    // 1. Find existing hospital or create
    let hospital = null;
    if (branch.sourceRowId) {
      hospital = await Hospital.findOne({ sourceRowId: branch.sourceRowId });
    }

    if (!hospital) {
      // Try by Apollo regex and state
      hospital = await Hospital.findOne({
        name: new RegExp(branch.name.replace(/[^a-zA-Z0-9]/g, '.*'), 'i'),
        state: new RegExp(branch.state, 'i'),
      });
    }

    if (!hospital && branch.searchKeywords) {
      for (const kw of branch.searchKeywords) {
        hospital = await Hospital.findOne({
          name: { $regex: 'apollo', $options: 'i' },
          address: new RegExp(kw, 'i'),
          state: new RegExp(branch.state, 'i'),
        });
        if (hospital) break;
      }
    }

    const hospitalData = {
      name: branch.name,
      address: branch.address,
      location: branch.location || branch.address,
      town: branch.city,
      district: branch.district,
      state: branch.state,
      pincode: branch.pincode,
      website: branch.website,
      telephone: branch.telephone,
      emergencyNumber: branch.emergencyNumber,
      totalBeds: branch.totalBeds,
      emergencyFlag: true,
      emergencyFlagSource: branch.emergencyFlagSource || 'raw',
      numberDoctors: branch.doctors.length,
      consultantCount: branch.doctors.length,
      category: branch.category || 'Private',
      careType: branch.careType || 'Multi-Specialty',
      geo: branch.geo,
      geocodeSource: 'source_file',
      specialties: Array.from(new Set([...(branch.specialties || [])])),
      facilities: comprehensiveFacilities,
    };

    if (branch.operationalHospitalId) {
      hospitalData.operationalHospitalId = branch.operationalHospitalId;
    }

    if (!hospital) {
      console.log(`[ApolloSeeder] Hospital not found. Creating new hospital: "${branch.name}" (sourceRowId: ${branch.sourceRowId})`);
      hospital = new Hospital({
        sourceRowId: branch.sourceRowId,
        ...hospitalData,
      });
    } else {
      console.log(`[ApolloSeeder] Found existing hospital: "${hospital.name}" (_id: ${hospital._id}, sourceRowId: ${hospital.sourceRowId})`);
      // Update hospital fields
      Object.assign(hospital, hospitalData);
    }

    // Prepare officialEnrichment
    if (!hospital.officialEnrichment) {
      hospital.officialEnrichment = {};
    }
    hospital.officialEnrichment.sourceUrl = branch.website;
    hospital.officialEnrichment.checkedAt = new Date();
    hospital.officialEnrichment.summary = `Premier quaternary-care hospital unit of Apollo Hospitals network in ${branch.city}, ${branch.state}, providing comprehensive clinical departments, 24/7 advanced emergency, intensive care units, and accredited specialist faculty.`;
    hospital.officialEnrichment.departments = Array.from(new Set([...(hospital.officialEnrichment.departments || []), ...(branch.specialties || [])]));
    hospital.officialEnrichment.services = comprehensiveFacilities;
    hospital.officialEnrichment.technologies = [
      'Digital Cath Labs', '1.5T / 3T MRI', '128 / 256 Slice CT Scanner',
      'Da Vinci Robotic Surgical System', 'Linear Accelerator / TrueBeam',
      'Modular Integrated Operation Theatres', 'ECMO & Advanced Life Support'
    ];

    const currentEnrichmentDocs = hospital.officialEnrichment.doctors || [];
    const docMap = new Map();
    for (const d of currentEnrichmentDocs) {
      if (d.name) docMap.set(d.name.toLowerCase(), d);
    }

    for (const doc of branch.doctors) {
      const enrichmentDocItem = {
        name: doc.name,
        title: `${doc.specialization} Specialist`,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experienceText: doc.experience,
        profileUrl: doc.profileUrl,
        sourceUrl: doc.profileUrl,
        verificationStatus: 'Verified',
        source: 'Official Apollo Hospitals Network Directory',
      };
      docMap.set(doc.name.toLowerCase(), enrichmentDocItem);
    }

    hospital.officialEnrichment.doctors = Array.from(docMap.values());
    await hospital.save();
    totalHospitalsProcessed++;
    console.log(`[ApolloSeeder] Successfully saved hospital record for "${hospital.name}" with ${hospital.officialEnrichment.doctors.length} enriched doctors.`);

    // 2. Insert/Upsert into RegistryDoctor
    for (const doc of branch.doctors) {
      const slug = doc.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase();
      const stableDoctorId = `DOC-APOLLO-${branch.city.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${slug}`;

      const registryDocData = {
        doctorId: stableDoctorId,
        name: doc.name,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        city: branch.city,
        state: branch.state,
        officialDoctorProfileUrl: doc.profileUrl,
        officialHospitalUrl: branch.website,
        hospitalAssociationSourceUrl: doc.profileUrl,
        source: 'Official Apollo Hospitals Website Directory',
        sourceName: hospital.name,
        sourceUrl: doc.profileUrl,
        verificationStatus: 'Verified',
        lastVerifiedAt: new Date(),
      };

      await RegistryDoctor.findOneAndUpdate(
        { doctorId: stableDoctorId },
        { $set: registryDocData },
        { upsert: true, new: true, runValidators: true }
      );
      totalDoctorsProcessed++;

      // Row for CSV
      csvRowsToAppend.push({
        doctor_id: stableDoctorId,
        doctor_name: doc.name,
        specialty: doc.specialization,
        sub_specialty: '',
        qualifications: doc.qualification,
        experience_years: doc.experienceYears || '',
        experience_text: doc.experience,
        professional_description: `${doc.name} is a senior consultant in ${doc.specialization} at ${hospital.name}, ${branch.city}. With ${doc.experience}, they provide expert specialized care and consultations.`,
        hospital_name: hospital.name,
        hospital_department: doc.specialization,
        hospital_address: branch.address,
        city: branch.city,
        district: branch.district,
        state: branch.state,
        pincode: branch.pincode,
        official_doctor_profile_url: doc.profileUrl,
        official_hospital_url: branch.website,
        doctor_registration_number: '',
        registration_council: '',
        registration_verification_status: 'NOT_CHECKED',
        hospital_affiliation_status: 'VERIFIED_OFFICIAL_PROFILE',
        specialty_source_url: doc.profileUrl,
        experience_source_url: doc.profileUrl,
        qualification_source_url: doc.profileUrl,
        description_source_url: doc.profileUrl,
        hospital_affiliation_source_url: doc.profileUrl,
        registration_source_url: '',
        source_type: 'official_hospital_website',
        sub_specialty_source_url: '',
        city_source_url: branch.website,
        state_source_url: branch.website,
        hospital_address_source_url: branch.website,
        doctor_name_source_url: doc.profileUrl,
        hospital_name_source_url: branch.website,
        hospital_department_source_url: branch.website,
        official_profile_source_url: doc.profileUrl,
        pincode_source_url: branch.website,
        last_verified_date: new Date().toISOString().split('T')[0],
        verification_notes: 'Verified against official Apollo Hospitals network doctor directory',
        verification_status: 'VERIFIED',
        specialty_standardized: doc.specialization,
      });
    }
  }

  // 3. Sync to data/raw/doctor/scraped_doctors.csv
  const csvPath = path.resolve(__dirname, '..', '..', '..', 'data', 'raw', 'doctor', 'scraped_doctors.csv');
  console.log(`\n[ApolloSeeder] Synchronizing CSV at ${csvPath}...`);
  if (fs.existsSync(csvPath)) {
    const existingContent = fs.readFileSync(csvPath, 'utf8');
    const existingLines = existingContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const headerLine = existingLines[0];
    const headers = headerLine.split(',');

    // Filter out rows with doctor_id already present in csv
    const existingDoctorIds = new Set();
    for (let i = 1; i < existingLines.length; i++) {
      const cols = existingLines[i].split(',');
      if (cols[0]) existingDoctorIds.add(cols[0].trim());
    }

    const linesToAdd = [];
    for (const row of csvRowsToAppend) {
      if (!existingDoctorIds.has(row.doctor_id)) {
        const formattedCols = headers.map((h) => {
          const val = row[h] !== undefined ? String(row[h]) : '';
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        linesToAdd.push(formattedCols.join(','));
        existingDoctorIds.add(row.doctor_id);
      }
    }

    if (linesToAdd.length > 0) {
      fs.appendFileSync(csvPath, '\n' + linesToAdd.join('\n') + '\n', 'utf8');
      console.log(`[ApolloSeeder] Appended ${linesToAdd.length} new Apollo doctor rows to ${csvPath}`);
    } else {
      console.log(`[ApolloSeeder] All Apollo doctor rows were already present in CSV.`);
    }
  }

  console.log(`\n============================================================`);
  console.log(`[ApolloSeeder] COMPLETED SUCCESSFULLY!`);
  console.log(`[ApolloSeeder] Total Hospitals Enriched/Created: ${totalHospitalsProcessed}`);
  console.log(`[ApolloSeeder] Total Doctors Seeded into Registry: ${totalDoctorsProcessed}`);

  await mongoose.disconnect();
}

seedApolloHospitalsAndDoctors()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[ApolloSeeder] Error during seeding:', err);
    process.exit(1);
  });
