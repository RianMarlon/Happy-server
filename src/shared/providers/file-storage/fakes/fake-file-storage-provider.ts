import { IFileStorageProvider } from '../models/file-storage-provider.interface';

class FakeFileStorageProvider implements IFileStorageProvider {
  async get(): Promise<Buffer | null> {
    return null;
  }

  async save(): Promise<string> {
    return '';
  }
  async delete(): Promise<void> {
    return;
  }
}

export default FakeFileStorageProvider;
