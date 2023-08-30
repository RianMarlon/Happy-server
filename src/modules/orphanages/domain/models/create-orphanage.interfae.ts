export interface ICreateOrphanage {
  name: string;
  about: string;
  latitude: number;
  longitude: number;
  whatsapp: string;
  instructions: string;
  open_from: number;
  open_until: number;
  confirmed: boolean;
  images: {
    path: string;
  }[];
}
