const SPECIALTY_ALIASES = [
  { pattern: /cardio|heart/i, terms: ['cardiology', 'cardiac', 'heart'] },
  { pattern: /neurosurg/i, terms: ['neurosurgery', 'neurosurgeon', 'neurosurgical'] },
  { pattern: /neurolog/i, terms: ['neurology', 'neurologist'] },
  { pattern: /^neuro$|brain/i, terms: ['neurology', 'neurologist', 'neurosurgery', 'neurosurgeon', 'brain'] },
  { pattern: /orthop|ortho|bone|joint/i, terms: ['orthopedic', 'orthopaedic', 'bone', 'joints', 'musculoskeletal'] },
  { pattern: /colitis|gastro|digestive|bowel|intestinal|crohn/i, terms: ['gastroenterology', 'gastrointestinal', 'gastro', 'digestive'] },
  { pattern: /dermatolog|skin|derma/i, terms: ['dermatology', 'dermatologist', 'skin'] },
  { pattern: /oncolog|cancer/i, terms: ['oncology', 'cancer', 'oncologist'] },
  { pattern: /\bent\b|ear|nose|throat|otorhinolaryngology/i, terms: ['ent', 'ear', 'nose', 'throat', 'otorhinolaryngology'] },
  { pattern: /pediatric|paediatric|child/i, terms: ['pediatrics', 'paediatrics', 'pediatric', 'paediatric', 'child'] },
  { pattern: /nephrolog|renal|kidney/i, terms: ['nephrology', 'renal', 'kidney'] },
  { pattern: /gynecolog|gynaecolog|obstetric/i, terms: ['obstetrics', 'gynecology', 'gynaecology', 'reproductive medicine'] },
  { pattern: /psychiatr|mental/i, terms: ['psychiatry', 'psychiatric', 'mental health'] },
  { pattern: /internal medicine|general medicine|general \/ internal|general physician|\bmedicine\b/i, terms: ['general medicine', 'internal medicine', 'general physician', 'medicine', 'casualty', 'emergency medicine', 'general care', 'critical care'] },
  { pattern: /pulmonolog|pulmonary|respiratory|chest|asthma/i, terms: ['pulmonology', 'pulmonary', 'respiratory', 'chest', 't.b.and chest'] },
  { pattern: /urolog|urinary/i, terms: ['urology', 'urologist', 'urinary', 'andrology'] },
  { pattern: /emergency|trauma|casualty/i, terms: ['emergency', 'casualty', 'trauma', 'critical care', 'emergency medicine'] },
];

export function specialtyMatches(requested, listed) {
  if (!requested || !listed) return false;
  const normalizedListed = String(listed || '').toLowerCase();
  const aliasSet = SPECIALTY_ALIASES.find(({ pattern }) => pattern.test(requested || ''));
  const terms = aliasSet?.terms || [String(requested || '').toLowerCase()];
  return terms.some((term) => normalizedListed.includes(term) || term.includes(normalizedListed));
}