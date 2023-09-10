import AppError from '../../../shared/errors/app-error';
import { IFileStorageProvider } from '../../../shared/providers/file-storage/models/file-storage-provider.interface';

import { IOrphanagesRepository } from '../domain/repositories/orphanages-repository.interface';

class DeleteOrphanageService {
  constructor(
    private orphanagesRepository: IOrphanagesRepository,
    private fileStorageProvider: IFileStorageProvider
  ) {}

  async execute(id: number): Promise<void> {
    const orphanageById = await this.orphanagesRepository.findById(id);

    if (!orphanageById) {
      throw new AppError('Nenhum orfanato encontrado!', 404);
    }

    await this.orphanagesRepository.delete(id);
    for (const image of orphanageById.images) {
      await this.fileStorageProvider.delete(image.path);
    }
  }
}

export default DeleteOrphanageService;
