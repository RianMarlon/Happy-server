import { IImage } from '../../../../images/domain/models/image.interface';
import { IOrphanage } from '../../models/orphanage.interface';
import { IOrphanagesRepository } from '../orphanages-repository.interface';

const orphanageMock = {
  id: 1,
  name: 'Teste',
  latitude: -5.101444,
  longitude: -38.369682,
  about: 'Teste',
  whatsapp: '9999999999',
  instructions: 'Teste',
  open_from: 1020,
  open_until: 1140,
  open_on_weekends: true,
  confirmed: true,
  images: [{ id: 1, path: 'teste.png' } as IImage],
};

class FakeOrphanagesRepository implements IOrphanagesRepository {
  async findAll(): Promise<IOrphanage[]> {
    return [orphanageMock];
  }

  async findByLocation(): Promise<IOrphanage | null> {
    return null;
  }

  async findById(): Promise<IOrphanage | null> {
    return orphanageMock;
  }

  async count(): Promise<number> {
    return 1;
  }

  async create(): Promise<IOrphanage> {
    return orphanageMock;
  }

  async update(): Promise<IOrphanage> {
    return orphanageMock;
  }

  async confirm(): Promise<void> {
    return;
  }

  async delete(): Promise<void> {
    return;
  }
}

export default FakeOrphanagesRepository;
