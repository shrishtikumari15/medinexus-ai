const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(payload) {
  // payload must include { id, role } at minimum
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signToken, verifyToken };
