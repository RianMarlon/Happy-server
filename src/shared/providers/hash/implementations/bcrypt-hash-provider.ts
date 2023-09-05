import { IHashProvider } from '../models/hash-provider.interface';
import bcrypt from 'bcrypt';

class BcryptHashProvider implements IHashProvider {
  async generate(data: string): Promise<string> {
    const saltRounds = bcrypt.genSaltSync(10);
    return bcrypt.hash(data, saltRounds);
  }

  async compare(data: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(data, hash);
  }
}

export default BcryptHashProvider;
