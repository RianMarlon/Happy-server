import { IOrphanage } from '../domain/models/orphanage.interface';
import { IOrphanagesRepository } from '../domain/repositories/orphanages-repository.interface';

class FindAllOrphanagesService {
  constructor(private orphanagesRepository: IOrphanagesRepository) {}

  async execute(
    confirmed: boolean,
    skip?: number,
    take?: number
  ): Promise<IOrphanage[]> {
    return await this.orphanagesRepository.findAll(confirmed, skip, take);
  }
}

export default FindAllOrphanagesService;
