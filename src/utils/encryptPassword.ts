import bcrypt from 'bcrypt';

export default function encryptPassword(password: string) {
  const saltRounds = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, saltRounds);
}