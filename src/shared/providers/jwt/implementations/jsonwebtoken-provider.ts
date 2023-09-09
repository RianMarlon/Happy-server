import jwt from 'jsonwebtoken';

import { IJwtPayload } from '../models/jwt-payload.interface';
import { IJwtProvider } from '../models/jwt-provider.interface';
import { ISignOptions } from '../models/sign-options.interface';
import { IVerifyOptions } from '../models/verify-options.interface';

class JsonWebTokenProvider implements IJwtProvider {
  sign(
    payload: string | object,
    secretOrPrivateKey: string,
    options?: ISignOptions
  ): string {
    return jwt.sign(payload, secretOrPrivateKey, options);
  }

  verify(
    token: string,
    secretOrPublicKey: string,
    options?: IVerifyOptions | undefined
  ): string | IJwtPayload {
    return jwt.verify(token, secretOrPublicKey, options);
  }
}

export default JsonWebTokenProvider;
