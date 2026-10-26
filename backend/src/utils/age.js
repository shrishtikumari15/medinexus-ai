function calculateAge(dateOfBirth, atDate = new Date()) {
  const birthDate = new Date(dateOfBirth);
  let age = atDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    atDate.getUTCMonth() < birthDate.getUTCMonth() ||
    (atDate.getUTCMonth() === birthDate.getUTCMonth() && atDate.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

module.exports = { calculateAge };