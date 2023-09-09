import AppError from '../../../shared/errors/app-error';
import convertHourToMinute from '../../../shared/utils/convertHourToMinute';
import removeImages from '../../../shared/utils/removeImages';
import { IImage } from '../../images/domain/models/image.interface';
import CreateImagesService from '../../images/services/create-images-service';

import DeleteImagesByOrphanageService from '../../images/services/delete-images-by-orphanage-service';

import { IOrphanagesRepository } from '../domain/repositories/orphanages-repository.interface';

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

class UpdateOrphanageService {
  constructor(
    private orphanagesRepository: IOrphanagesRepository,
    private createImagesService: CreateImagesService,
    private deleteImagesByOrphanageService: DeleteImagesByOrphanageService
  ) {}

  async execute(id: number, data: IRequest): Promise<void> {
    const orphanageById = await this.orphanagesRepository.findById(id);

    if (!orphanageById) {
      throw new AppError('Nenhum orfanato encontrado!', 404);
    }

    const newData = {
      ...data,
      open_from: convertHourToMinute(data.open_from),
      open_until: convertHourToMinute(data.open_until),
    };

    if (newData.open_from > newData.open_until) {
      throw new AppError(
        'Horário de abertura após o horário de fechamento!',
        400
      );
    } else if (newData.open_until - newData.open_from < 30) {
      throw new AppError(
        'Necessário, no mínimo, disponibilidade de 30 minutos para visitas!',
        400
      );
    }

    const orphanageByLocation = await this.orphanagesRepository.findByLocation({
      latitude: newData.latitude,
      longitude: newData.longitude,
    });

    if (orphanageByLocation) {
      throw new AppError('Existe um orfanato nessa localização!', 400);
    }

    await this.orphanagesRepository.update(id, {
      ...newData,
    });

    if (data.images.length > 0) {
      const imagesOld = orphanageById.images;
      const filenamesOld = imagesOld.map((image) => image.path);

      removeImages('/uploads', filenamesOld);
      await this.deleteImagesByOrphanageService.execute(orphanageById.id);

      const newImages = data.images.map((image) => {
        const newImage = {} as IImage;
        newImage.path = image.path;
        newImage.orphanage = orphanageById;

        return newImage;
      });

      await this.createImagesService.execute(newImages);
    }
  }
}

export default UpdateOrphanageService;
