const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const dependentIdParam = param('id').custom((value) => mongoose.isValidObjectId(value)).withMessage('Invalid dependent ID.');

const dependentFields = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.'),
  body('relationship').trim().notEmpty().withMessage('Relationship is required.').isLength({ max: 40 }).withMessage('Relationship must be 40 characters or fewer.'),
  body('dateOfBirth').isISO8601({ strict: true }).withMessage('Enter a valid date of birth.')
    .custom((value) => new Date(value) <= new Date()).withMessage('Date of birth cannot be in the future.'),
  body('gender').optional({ checkFalsy: true }).isIn(['M', 'F', 'Other']).withMessage('Gender must be M, F, or Other.'),
];

module.exports = { dependentIdParam, dependentFields };