import { IOrphanage } from '../domain/models/orphanage.interface';
import { IOrphanagesRepository } from '../domain/repositories/orphanages-repository.interface';

interface IFindAllPagined {
  orphanages: IOrphanage[];
  quantity: number;
}

class FindAllOrphanagesPaginatedService {
  constructor(private orphanagesRepository: IOrphanagesRepository) {}

  async execute(
    confirmed: boolean,
    skip: number,
    take: number
  ): Promise<IFindAllPagined> {
    const quantityOrphanages = await this.orphanagesRepository.count(confirmed);
    const orphanages = await this.orphanagesRepository.findAll(
      confirmed,
      skip,
      take
    );
    return {
      orphanages,
      quantity: quantityOrphanages,
    };
  }
}

export default FindAllOrphanagesPaginatedService;
