import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Usage example (uncomment to test):
// (async () => {
//   const password = 'mySecurePassword';
//   const hashed = await hashPassword(password);
//   console.log('Hashed password:', hashed);
//   const isMatch = await comparePassword(password, hashed);
//   console.log('Password match:', isMatch);
// })();
