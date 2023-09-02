import { ICreateImage } from '../models/create-image.interface';
import { IImage } from '../models/image.interface';

export interface IImagesRepository {
  create(imagesToCreate: ICreateImage[]): Promise<IImage[]>;
  deleteByOrphanageId(orphanageId: number): Promise<void>;
}
