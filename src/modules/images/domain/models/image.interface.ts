import { IOrphanage } from '../../../orphanages/domain/models/orphanage.interface';

export interface Image {
  id: number;
  path: string;
  orphanage: IOrphanage;
}
