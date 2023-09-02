import { IImagesRepository } from '../domain/repositories/images-repository.interface';

class DeleteImagesByOrphanageService {
  constructor(private imagesRepository: IImagesRepository) {}

  async execute(orphanageId: number): Promise<void> {
    await this.imagesRepository.deleteByOrphanageId(orphanageId);
  }
}

export default DeleteImagesByOrphanageService;
