import { ICreateOrphanage } from '../models/create-orphanage.interfae';
import { IOrphanage } from '../models/orphanage.interface';

export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IOrphanagesRepository {
  findAll(
    confirmed: boolean,
    skip: number,
    take: number
  ): Promise<IOrphanage[]>;
  findByLocation(location: ILocation): Promise<IOrphanage | undefined>;
  findById(id: number): Promise<IOrphanage | undefined>;
  create(orphanageToCreate: ICreateOrphanage): Promise<IOrphanage>;
  update(
    id: number,
    orphanageToUpdate: Partial<ICreateOrphanage>
  ): Promise<IOrphanage>;
  delete(id: number): Promise<void>;
}
