import { ICreateOrphanage } from '../models/create-orphanage.interfae';
import { IOrphanage } from '../models/orphanage.interface';

interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IOrphanagesRepository {
  findAll(
    confirmed: boolean,
    skip: number,
    take: number
  ): Promise<IOrphanage[]>;
  findByLocation(location: ILocation): Promise<IOrphanage>;
  findById(id: string): Promise<IOrphanage | null>;
  create(orphanageToCreate: ICreateOrphanage): Promise<IOrphanage>;
  update(
    id: string,
    orphanageToUpdate: Partial<ICreateOrphanage>
  ): Promise<IOrphanage>;
  delete(id: string): Promise<void>;
}
