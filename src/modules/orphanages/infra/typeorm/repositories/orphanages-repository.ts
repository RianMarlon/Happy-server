import { Repository } from 'typeorm';

import { dataSource } from '../../../../../shared/infra/typeorm';

import { ICreateOrphanage } from '../../../domain/models/create-orphanage.interfae';
import {
  ILocation,
  IOrphanagesRepository,
} from '../../../domain/repositories/orphanages-repository.interface';

import Orphanage from '../entities/orphanage';

class OrphanagesRepository implements IOrphanagesRepository {
  private repository: Repository<Orphanage>;

  constructor() {
    this.repository = dataSource.getRepository(Orphanage);
  }

  async findAll(
    confirmed: boolean,
    skip?: number,
    take?: number
  ): Promise<Orphanage[]> {
    if (skip && take) {
      return await this.repository.find({
        relations: ['images'],
        skip,
        take,
        where: {
          confirmed,
        },
        order: {
          id: 'ASC',
        },
      });
    }

    return await this.repository.find({
      relations: ['images'],
      where: {
        confirmed,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findByLocation(location: ILocation): Promise<Orphanage | null> {
    return await this.repository.findOne({
      relations: ['images'],
      where: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
  }

  async findById(id: number): Promise<Orphanage | null> {
    return await this.repository.findOne({
      relations: ['images'],
      where: {
        id,
      },
    });
  }

  async count(confirmed: boolean): Promise<number> {
    return await this.repository.count({
      where: {
        confirmed,
      },
    });
  }

  async create(orphanageToCreate: ICreateOrphanage): Promise<Orphanage> {
    const orphanageCreated = this.repository.create(orphanageToCreate);
    await this.repository.save(orphanageCreated);

    return orphanageCreated;
  }

  async update(
    id: number,
    orphanageToUpdate: Partial<ICreateOrphanage>
  ): Promise<Orphanage> {
    const orphanageUpdated = this.repository.create({
      ...orphanageToUpdate,
      id,
    });

    await this.repository.save(orphanageUpdated);

    return orphanageUpdated;
  }

  async confirm(id: number): Promise<void> {
    const orphanageUpdated = this.repository.create({
      id,
      confirmed: true,
    });

    await this.repository.save(orphanageUpdated);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

export default OrphanagesRepository;
