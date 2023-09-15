import { Repository } from 'typeorm';

import { dataSource } from '../../../../../shared/infra/typeorm';
import { ICreateImage } from '../../../domain/models/create-image.interface';

import { IImagesRepository } from '../../../domain/repositories/images-repository.interface';
import Image from '../entities/image';

class ImagesRepository implements IImagesRepository {
  private repository: Repository<Image>;

  constructor() {
    this.repository = dataSource.getRepository(Image);
  }

  async create(imagesToCreate: ICreateImage[]): Promise<Image[]> {
    const imageCreated = this.repository.create(imagesToCreate);
    await this.repository.save(imageCreated);

    return imageCreated;
  }

  async deleteByOrphanageId(orphanageId: number): Promise<void> {
    await this.repository.delete({
      orphanage: {
        id: orphanageId,
      },
    });
  }
}

export default ImagesRepository;
