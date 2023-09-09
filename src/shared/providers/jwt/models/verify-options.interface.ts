export interface IVerifyOptions {
  audience?: string | RegExp | Array<string | RegExp>;
  issuer?: string | string[];
  ignoreExpiration?: boolean;
  ignoreNotBefore?: boolean;
  subject?: string;
  maxAge?: string | number;
}
