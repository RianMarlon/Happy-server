export interface IHashProvider {
  generate(data: string): Promise<string>;
  compare(data: string, hash: string): Promise<boolean>;
}
