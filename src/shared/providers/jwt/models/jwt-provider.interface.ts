import { IJwtPayload } from './jwt-payload.interface';
import { ISignOptions } from './sign-options.interface';
import { IVerifyOptions } from './verify-options.interface';

export interface IJwtProvider {
  sign(
    payload: string | object,
    secretOrPrivateKey: string,
    options?: ISignOptions
  ): string;
  verify(
    token: string,
    secretOrPublicKey: string,
    options?: IVerifyOptions
  ): string | IJwtPayload;
}
