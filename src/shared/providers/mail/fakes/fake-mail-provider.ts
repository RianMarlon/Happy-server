import { IMailProvider } from '../models/mail-provider.interface';

class FakeMailProvider implements IMailProvider {
  async send(): Promise<void> {
    return;
  }
}

export default FakeMailProvider;
