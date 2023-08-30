import { Image } from '../../../images/domain/models/image.interface';

export interface IOrphanage {
  id: number;
  name: string;
  about: string;
  latitude: number;
  longitude: number;
  whatsapp: string;
  instructions: string;
  open_from: number;
  open_until: number;
  confirmed: boolean;
  images: Image[];
}
