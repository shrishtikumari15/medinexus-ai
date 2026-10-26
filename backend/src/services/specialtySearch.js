const SPECIALTY_ALIASES = [
  { pattern: /cardio|heart/, terms: ['cardiology', 'cardiac', 'heart'] },
  { pattern: /neurosurg/, terms: ['neurosurgery', 'neurosurgeon', 'neurosurgical'] },
  { pattern: /neurolog|neurogolo/, terms: ['neurology', 'neurologist'] },
  { pattern: /^neuro$|brain/, terms: ['neurology', 'neurologist', 'neurosurgery', 'neurosurgeon', 'brain'] },
  { pattern: /orthop|ortho|bone|joint/, terms: ['orthopedic', 'orthopaedic', 'bone', 'joints', 'musculoskeletal'] },
  { pattern: /colitis|gastro|gaestro|digestive|bowel|intestinal|crohn/, terms: ['gastroenterology', 'gastrointestinal', 'gastro', 'digestive'] },
  { pattern: /dermatolog|skin|derma/, terms: ['dermatology', 'dermatologist', 'skin'] },
  { pattern: /\bent\b|ear|nose|throat|otorhinolaryngology/, terms: ['ent', 'ear', 'nose', 'throat', 'otorhinolaryngology'] },
  { pattern: /pediatric|paediatric|child/, terms: ['pediatrics', 'paediatrics', 'pediatric', 'paediatric', 'child'] },
  { pattern: /nephrolog|renal|kidney/, terms: ['nephrology', 'renal', 'kidney'] },
  { pattern: /gynecolog|gynaecolog|obstetric/, terms: ['obstetrics', 'gynecology', 'gynaecology', 'reproductive medicine'] },
  { pattern: /psychiatr|mental/, terms: ['psychiatry', 'psychiatric', 'mental health'] },
  { pattern: /internal medicine|general medicine|general \/ internal|general physician|\bmedicine\b/i, terms: ['general medicine', 'internal medicine', 'general physician', 'medicine', 'casualty', 'emergency medicine'] },
  { pattern: /pulmonolog|pulmonary|respiratory|chest|asthma/i, terms: ['pulmonology', 'pulmonary', 'respiratory', 'chest', 't.b.and chest'] },
  { pattern: /urolog|urinary/i, terms: ['urology', 'urologist', 'urinary', 'andrology'] },
  { pattern: /emergency|trauma|casualty|critical care/i, terms: ['emergency', 'casualty', 'trauma', 'critical care', 'emergency medicine'] },
];

function getSpecialtyTerms(value) {
  const normalized = String(value || '').trim().toLowerCase();
  const aliases = SPECIALTY_ALIASES.find(({ pattern }) => pattern.test(normalized));
  return aliases ? aliases.terms : [normalized].filter(Boolean);
}

module.exports = { getSpecialtyTerms };