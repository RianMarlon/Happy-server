import { IHashProvider } from '../models/hash-provider.interface';

class FakeHashProvider implements IHashProvider {
  async compare(): Promise<boolean> {
    return true;
  }

  async generate(): Promise<string> {
    return '';
  }
}

export default FakeHashProvider;
