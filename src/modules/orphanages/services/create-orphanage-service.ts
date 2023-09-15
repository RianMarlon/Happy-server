import { injectable, inject } from 'tsyringe';

import AppError from '../../../shared/errors/app-error';
import convertHourToMinute from '../../../shared/utils/convertHourToMinute';

import { IOrphanagesRepository } from '../domain/repositories/orphanages-repository.interface';
import { IFileStorageProvider } from '../../../shared/providers/file-storage/models/file-storage-provider.interface';

interface IRequest {
  name: string;
  about: string;
  latitude: number;
  longitude: number;
  whatsapp: string;
  instructions: string;
  open_from: string;
  open_until: string;
  open_on_weekends: boolean;
  images: {
    path: string;
  }[];
}

@injectable()
class CreateOrphanageService {
  constructor(
    @inject('OrphanagesRepository')
    private orphanagesRepository: IOrphanagesRepository,
    @inject('FileStorageProvider')
    private fileStorageProvider: IFileStorageProvider
  ) {}

  async execute(data: IRequest): Promise<void> {
    const newOrphanage = {
      ...data,
      open_from: convertHourToMinute(data.open_from),
      open_until: convertHourToMinute(data.open_until),
    };

    if (newOrphanage.open_from > newOrphanage.open_until) {
      throw new AppError(
        'Horário de abertura após o horário de fechamento!',
        400
      );
    } else if (newOrphanage.open_until - newOrphanage.open_from < 30) {
      throw new AppError(
        'Necessário, no mínimo, disponibilidade de 30 minutos para visitas!',
        400
      );
    }

    const orphanageByLocation = await this.orphanagesRepository.findByLocation({
      latitude: data.latitude,
      longitude: data.longitude,
    });

    if (orphanageByLocation) {
      throw new AppError('Existe um orfanato nessa localização!', 400);
    }

    await this.orphanagesRepository.create(newOrphanage);
    for (const image of data.images) {
      await this.fileStorageProvider.save(image.path);
    }
  }
}

export default CreateOrphanageService;
