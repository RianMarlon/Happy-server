export interface IFileStorageProvider {
  save(filename: string): Promise<string>;
  delete(filename: string): Promise<void>;
}
