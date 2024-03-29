import { IOrphanage } from '../../../orphanages/domain/models/orphanage.interface';

export interface IImage {
  id: number;
  path: string;
  orphanage: IOrphanage;
}
