import { getRepository, Repository } from 'typeorm';

import { ICreateOrphanage } from '../../../domain/models/create-orphanage.interfae';
import {
  ILocation,
  IOrphanagesRepository,
} from '../../../domain/repositories/orphanages-repository.interface';

import Orphanage from '../entities/orphanage';

class OrphanagesRepository implements IOrphanagesRepository {
  private repository: Repository<Orphanage>;

  constructor() {
    this.repository = getRepository(Orphanage);
  }

  async findAll(
    confirmed: boolean,
    skip: number | null,
    take: number | null
  ): Promise<Orphanage[]> {
    if (skip && take) {
      return await this.repository.find({
        relations: ['images'],
        skip,
        take,
        where: {
          confirmed,
        },
      });
    }

    return await this.repository.find({
      relations: ['images'],
      where: {
        confirmed,
      },
    });
  }

  async findByLocation(location: ILocation): Promise<Orphanage | undefined> {
    return await this.repository.findOne({
      relations: ['images'],
      where: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
  }

  async findById(id: number): Promise<Orphanage | undefined> {
    return await this.repository.findOne({
      relations: ['images'],
      where: {
        id,
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

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

export default OrphanagesRepository;
