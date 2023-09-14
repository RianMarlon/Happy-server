import { IImage } from '../../models/image.interface';
import { IImagesRepository } from '../images-repository.interface';

class FakeImagesRepository implements IImagesRepository {
  async create(): Promise<IImage[]> {
    return [] as IImage[];
  }

  async deleteByOrphanageId(): Promise<void> {
    return;
  }
}

export default FakeImagesRepository;
