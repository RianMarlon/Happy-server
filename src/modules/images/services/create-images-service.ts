import { ICreateImage } from '../domain/models/create-image.interface';
import { IImagesRepository } from '../domain/repositories/images-repository.interface';

class CreateImagesService {
  constructor(private imagesRepository: IImagesRepository) {}

  async execute(data: ICreateImage[]): Promise<void> {
    await this.imagesRepository.create(data);
  }
}

export default CreateImagesService;
