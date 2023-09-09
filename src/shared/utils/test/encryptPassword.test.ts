import encryptPassword from '../encryptPassword';

describe('encryptPassword Tests', () => {
  it('should generate a hash from a string', () => {
    const password = 'Teste0239203';
    const hash = encryptPassword(password);
    expect(hash).not.toBe(password);
  });
});
