import fs from 'fs';
import path from 'path';

import uploadConfig from '../../../../config/upload';

import { IFileStorageProvider } from '../models/file-storage-provider.interface';

class DiskStorageProvider implements IFileStorageProvider {
  async get(filename: string): Promise<Buffer | null> {
    try {
      return await fs.promises.readFile(
        path.join(uploadConfig.uploadFolder, filename)
      );
    } catch (error) {
      return null;
    }
  }

  async save(filename: string): Promise<string> {
    await fs.promises.rename(
      path.resolve(uploadConfig.tempFolder, filename),
      path.resolve(uploadConfig.uploadFolder, filename)
    );

    return filename;
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.resolve(uploadConfig.uploadFolder, filename);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }
}

export default DiskStorageProvider;
