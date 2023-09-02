import { IOrphanage } from '../../../orphanages/domain/models/orphanage.interface';

export interface ICreateImage {
  path: string;
  orphanage: IOrphanage;
}
