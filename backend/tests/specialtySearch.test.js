const { getSpecialtyTerms } = require('../src/services/specialtySearch');

describe('getSpecialtyTerms', () => {
  test.each([
    ['cardiology', ['cardiology', 'cardiac', 'heart']],
    ['neurologist', ['neurology', 'neurologist']],
    ['neurosurgeon', ['neurosurgery', 'neurosurgeon', 'neurosurgical']],
    ['orthopedic', ['orthopedic', 'orthopaedic', 'bone', 'joints', 'musculoskeletal']],
    ['colitis', ['gastroenterology', 'gastrointestinal', 'gastro', 'digestive']],
  ])('expands %s to directory aliases', (specialty, expected) => {
    expect(getSpecialtyTerms(specialty)).toEqual(expected);
  });

  test('keeps an unrecognized specialty as an exact search term', () => {
    expect(getSpecialtyTerms('oncology')).toEqual(['oncology']);
  });

  test('does not match neurology when the search asks for neurosurgery', () => {
    const neurosurgeryTerms = getSpecialtyTerms('Neurosurgeon');
    expect(neurosurgeryTerms).not.toContain('neurology');
    expect(neurosurgeryTerms.some((term) => new RegExp(term, 'i').test('Neurology'))).toBe(false);
  });
});