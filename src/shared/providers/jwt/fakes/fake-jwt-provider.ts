import { IJwtPayload } from '../models/jwt-payload.interface';
import { IJwtProvider } from '../models/jwt-provider.interface';

class FakeJwtProvider implements IJwtProvider {
  sign(): string {
    return '';
  }

  verify(): string | IJwtPayload {
    return { id: 1 };
  }
}

export default FakeJwtProvider;
