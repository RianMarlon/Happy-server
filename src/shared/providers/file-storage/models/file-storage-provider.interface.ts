export interface IFileStorageProvider {
  get(filename: string): Promise<Buffer | null>;
  save(filename: string): Promise<string>;
  delete(filename: string): Promise<void>;
}
