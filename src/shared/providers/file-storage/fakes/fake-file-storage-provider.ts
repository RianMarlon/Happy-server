import { IFileStorageProvider } from '../models/file-storage-provider.interface';

class FakeFileStorageProvider implements IFileStorageProvider {
  async save(): Promise<string> {
    return '';
  }
  async delete(): Promise<void> {
    return;
  }
}

export default FakeFileStorageProvider;
