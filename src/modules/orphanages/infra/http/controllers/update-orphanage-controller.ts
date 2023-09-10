import { Request, Response } from 'express';
import * as Yup from 'yup';
import DiskStorageProvider from '../../../../../shared/providers/file-storage/implementations/disk-storage-provider';
import ImagesRepository from '../../../../images/infra/typeorm/repositories/images-repository';
import CreateImagesService from '../../../../images/services/create-images-service';
import DeleteImagesByOrphanageService from '../../../../images/services/delete-images-by-orphanage-service';

import UpdateOrphanageService from '../../../service/update-orphanage-service';
import OrphanagesRepository from '../../typeorm/repositories/orphanages-repository';

class UpdateOrphanageController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const {
      name,
      latitude,
      longitude,
      about,
      whatsapp,
      instructions,
      open_from,
      open_until,
      open_on_weekends,
    } = request.body;

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages?.map((image) => {
      return {
        path: image.filename,
      };
    });

    const data = {
      name,
      latitude,
      longitude,
      about,
      whatsapp,
      instructions,
      open_from,
      open_until,
      open_on_weekends: open_on_weekends === 'true',
      images,
    };

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome não informado!'),
      latitude: Yup.number().required('Localização não informada!'),
      longitude: Yup.number().required('Localização não informada!'),
      about: Yup.string()
        .required('Informações sobre o orfanato não fornecidas!')
        .max(
          500,
          'Informação sobre o orfanado deve conter, no máximo, 500 caracteres!'
        ),
      whatsapp: Yup.string().required('Número do Whatsapp não informado!'),
      open_from: Yup.string()
        .required('Horário de abertura não informado!')
        .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
          message: 'Horário de abertura inválido!',
        }),
      open_until: Yup.string()
        .required('Horário de fechamento não informado!')
        .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
          message: 'Horário de fechamento inválido!',
        }),
      instructions: Yup.string()
        .required('Instruções de visitas não informadas!')
        .max(
          500,
          'Instruções de visitas deve conter, no máximo, 500 caracteres!'
        ),
      open_on_weekends: Yup.boolean().required(
        'Não foi informado se recebe visitas nos finais de semana!'
      ),
    });

    await schema.validate(
      { ...data },
      {
        abortEarly: false,
      }
    );

    const orphanagesRepository = new OrphanagesRepository();
    const imagesRepository = new ImagesRepository();

    const createImagesService = new CreateImagesService(imagesRepository);
    const deleteImagesByOrphanageService = new DeleteImagesByOrphanageService(
      imagesRepository
    );
    const diskStorageProvider = new DiskStorageProvider();
    const updateOrphanageService = new UpdateOrphanageService(
      orphanagesRepository,
      createImagesService,
      deleteImagesByOrphanageService,
      diskStorageProvider
    );
    await updateOrphanageService.execute(Number(id), data);

    return response.status(200).json();
  }
}

export default UpdateOrphanageController;
