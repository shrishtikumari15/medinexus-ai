const { validationResult } = require('express-validator');
const { dependentFields, dependentIdParam } = require('../src/validators/dependentValidators');
const { calculateAge } = require('../src/utils/age');

async function validateRules(rules, req) {
  const ruleList = Array.isArray(rules) ? rules : [rules];
  await Promise.all(ruleList.map((rule) => rule.run(req)));
  return validationResult(req).array();
}

describe('dependent validation and age calculation', () => {
  test('requires name, relationship, and valid DOB and rejects a future date', async () => {
    const errors = await validateRules(dependentFields, {
      body: { name: '', relationship: '', dateOfBirth: '2999-01-01' },
    });

    expect(errors.map((error) => error.path)).toEqual(expect.arrayContaining(['name', 'relationship', 'dateOfBirth']));
  });

  test('rejects malformed dependent IDs', async () => {
    const errors = await validateRules(dependentIdParam, { params: { id: 'not-an-id' } });
    expect(errors[0].msg).toBe('Invalid dependent ID.');
  });

  test('calculates age from DOB without rounding up before the birthday', () => {
    expect(calculateAge('2010-09-30', new Date('2026-09-29T12:00:00Z'))).toBe(15);
    expect(calculateAge('2010-09-29', new Date('2026-09-29T12:00:00Z'))).toBe(16);
  });
});