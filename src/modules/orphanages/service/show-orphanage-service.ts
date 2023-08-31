import AppError from '../../../shared/errors/app-error';

import { IOrphanage } from '../domain/models/orphanage.interface';
import { IOrphanagesRepository } from '../domain/repositories/orphanages-repository.interface';

class ShowOrphanageService {
  constructor(private orphanagesRepository: IOrphanagesRepository) {}

  async execute(id: number): Promise<IOrphanage> {
    const orphanageById = await this.orphanagesRepository.findById(id);

    if (!orphanageById) {
      throw new AppError('Nenhum orfanato encontrado!', 404);
    }

    return orphanageById;
  }
}

export default ShowOrphanageService;
