import { injectable, inject } from 'tsyringe';

import { IImagesRepository } from '../domain/repositories/images-repository.interface';

@injectable()
class DeleteImagesByOrphanageService {
  constructor(
    @inject('ImagesRepository')
    private imagesRepository: IImagesRepository
  ) {}

  async execute(orphanageId: number): Promise<void> {
    await this.imagesRepository.deleteByOrphanageId(orphanageId);
  }
}

export default DeleteImagesByOrphanageService;
