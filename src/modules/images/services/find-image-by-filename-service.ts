import { inject, injectable } from 'tsyringe';

import { IFileStorageProvider } from '../../../shared/providers/file-storage/models/file-storage-provider.interface';
import AppError from '../../../shared/errors/app-error';

@injectable()
export default class FindImageByFileNameService {
  constructor(
    @inject('FileStorageProvider')
    private storageProvider: IFileStorageProvider
  ) {}

  async execute(filename: string): Promise<Buffer> {
    const fileContent = await this.storageProvider.get(filename);

    if (!fileContent) {
      throw new AppError('Arquivo não encontrado');
    }

    return fileContent;
  }
}
