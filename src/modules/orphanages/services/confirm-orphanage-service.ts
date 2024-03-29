import { injectable, inject } from 'tsyringe';

import AppError from '../../../shared/errors/app-error';

import { IOrphanagesRepository } from '../domain/repositories/orphanages-repository.interface';

@injectable()
class ConfirmOrphanageService {
  constructor(
    @inject('OrphanagesRepository')
    private orphanagesRepository: IOrphanagesRepository
  ) {}

  async execute(id: number): Promise<void> {
    const orphanageById = await this.orphanagesRepository.findById(id);

    if (!orphanageById) {
      throw new AppError('Nenhum orfanato encontrado!', 404);
    }

    await this.orphanagesRepository.confirm(id);
  }
}

export default ConfirmOrphanageService;
