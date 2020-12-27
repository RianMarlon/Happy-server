import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage';
import Image from '../models/Image';
import orphanagesView from '../views/orphanagesView';

import convertHourToMinute from '../utils/convertHourToMinute';
import removeImages from '../utils/removeImages';

export default {
  async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      whatsapp,
      instructions,
      open_from,
      open_until,
      open_on_weekends
    } = request.body;
    
    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map((image) => {
      return {
        path: image.filename
      }
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
      images
    }

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome não informado!'),
      latitude: Yup.number().required('Localização não informada!'),
      longitude: Yup.number().required('Localização não informada!'),
      about: Yup.string().required('Informações sobre o orfanato não fornecidas!').max(500, 'Informação sobre o orfanado deve conter, no máximo, 500 caracteres!'),
      whatsapp: Yup.string().required('Número do Whatsapp não informado!'),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required('Imagem não fornecida!')
        })
      ),
      open_from: Yup.string().required('Horário de abertura não informado!')
        .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Horário de abertura inválido!'}),
      open_until: Yup.string().required('Horário de fechamento não informado!')
        .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Horário de fechamento inválido!'}),
      instructions: Yup.string().required('Instruções de visitas não informadas!').max(500, 'Instruções de visitas deve conter, no máximo, 500 caracteres!'),
      open_on_weekends: Yup.boolean().required('Não foi informado se recebe visitas nos finais de semana!')
    });
    
    await schema.validate(data, {
      abortEarly: false
    });

    const newData = {
      ...data,
      open_from: convertHourToMinute(data.open_from),
      open_until: convertHourToMinute(data.open_until)
    }
    
    if (newData.open_from > newData.open_until) {
      throw new Yup.ValidationError(
        'Horário de abertura após o horário de fechamento!',
        null, ''
      );
    }

    else if (newData.open_until - newData.open_from < 30) {
      throw new Yup.ValidationError(
        'Necessário, no mínimo, disponibilidade de 30 minutos para visitas!',
        null, ''
      );
    }

    const orphanageByLocation = await orphanagesRepository
      .createQueryBuilder('orphanage')
      .where('orphanage.latitude = :latitude AND orphanage.longitude = :longitude')
      .setParameters({
        latitude, longitude
      })
      .getOne();

    if (orphanageByLocation) {
      throw new Yup.ValidationError(
        'Existe um orfanato nessa localização!',
        null, ''
      );
    }

    const orphanage = orphanagesRepository.create({ ...newData });
  
    await orphanagesRepository.save(orphanage);

    return response.status(201).json();
  },

  async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);
  
    const orphanages = await orphanagesRepository.find({
      relations: ['images'],
      where: {
        confirmed: true
      }
    });

    return response.status(200).json(orphanagesView.renderMany(orphanages));
  },

  async indexConfirmed(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);

    const filters = request.query;

    const page = Number(filters.page as string) || 1;
    const perPage = Number(filters.per_page as string) || 1;

    const limit = perPage;
    const offset = perPage * (page - 1);

    const quantityOrphanagesConfirmed = await orphanagesRepository
      .count({ confirmed: true });
  
    const orphanages = await orphanagesRepository.find({
      relations: ['images'],
      skip: offset,
      take: limit,
      where: {
        confirmed: true
      }
    });

    return response.status(200).json({
      orphanages_by_page: orphanagesView.renderMany(orphanages),
      quantity_confirmed: quantityOrphanagesConfirmed
    });
  },

  async indexPending(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);

    const filters = request.query;

    const page = Number(filters.page as string) || 1;
    const perPage = Number(filters.per_page as string) || 1;

    const limit = perPage;
    const offset = perPage * (page - 1);

    const quantityOrphanagesPending = await orphanagesRepository
      .count({ confirmed: false });
  
    const orphanages = await orphanagesRepository.find({
      relations: ['images'],
      skip: offset,
      take: limit,
      where: {
        confirmed: false
      }
    });

    return response.status(200).json({
      orphanages_by_page: orphanagesView.renderMany(orphanages),
      quantity_pending: quantityOrphanagesPending
    });
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const orphanagesRepository = getRepository(Orphanage);

    try {
      const orphanage = await orphanagesRepository.findOneOrFail(id, {
        relations: ['images']
      });

      return response.status(200).json(orphanagesView.render(orphanage));
    }

    catch(e) {
      return response.status(400).json({
        messagesError: ['Nenhum orfanato encontrado!']
      });
    }
  },

  async update(request: Request, response: Response) {
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
      open_on_weekends
    } = request.body;

    const requestImages = request.files as Express.Multer.File[];

    const orphanagesRepository = getRepository(Orphanage);

    const orphanageById = await orphanagesRepository.findOne({
      relations: ['images'],
      where: {
        id
      }
    });

    if (!orphanageById) {
      return response.status(400).json({
        messagesError: ['Nenhum orfanato encontrado!']
      });
    }
    
    const data = {
      name,
      latitude,
      longitude,
      about,
      whatsapp,
      instructions,
      open_from,
      open_until,
      open_on_weekends: open_on_weekends === 'true'
    }

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome não informado!'),
      latitude: Yup.number().required('Localização não informada!'),
      longitude: Yup.number().required('Localização não informada!'),
      about: Yup.string().required('Informações sobre o orfanato não fornecidas!').max(500, 'Informação sobre o orfanado deve conter, no máximo, 500 caracteres!'),
      whatsapp: Yup.string().required('Número do Whatsapp não informado!'),
      open_from: Yup.string().required('Horário de abertura não informado!')
        .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Horário de abertura inválido!'}),
      open_until: Yup.string().required('Horário de fechamento não informado!')
        .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Horário de fechamento inválido!'}),
      instructions: Yup.string().required('Instruções de visitas não informadas!').max(500, 'Instruções de visitas deve conter, no máximo, 500 caracteres!'),
      open_on_weekends: Yup.boolean().required('Não foi informado se recebe visitas nos finais de semana!')
    });
    
    await schema.validate({ ...data }, {
      abortEarly: false
    });

    const newData = {
      ...data,
      open_from: convertHourToMinute(data.open_from),
      open_until: convertHourToMinute(data.open_until)
    }
    
    if (newData.open_from > newData.open_until) {
      throw new Yup.ValidationError(
        'Horário de abertura após o horário de fechamento!',
        null, ''
      );
    }

    else if (newData.open_until - newData.open_from < 30) {
      throw new Yup.ValidationError(
        'Necessário, no mínimo, disponibilidade de 30 minutos para visitas!',
        null, ''
      );
    }
    
    const orphanageByLocation = await orphanagesRepository
      .createQueryBuilder('orphanage')
      .where('id IS NOT :id AND orphanage.latitude = :latitude AND orphanage.longitude = :longitude')
      .setParameters({
        id, latitude, longitude
      })
      .getOne();

    if (orphanageByLocation) {
      throw new Yup.ValidationError(
        'Existe um orfanato nessa localização!',
        null, ''
      );
    }

    await orphanagesRepository
      .update(id, {
        ...newData
      });

    if (requestImages.length > 0) {
      const imagesRepository = getRepository(Image);

      const imagesOld = orphanageById.images;

      const pathImages = requestImages[0].destination;
      const filenamesOld = imagesOld.map((image) => image.path);

      removeImages(pathImages, filenamesOld);

      const images = requestImages.map((image) => {
        return {
          path: image.filename
        }
      });

      await imagesRepository
        .createQueryBuilder()
        .delete()
        .where('id_orphanage = :id')
        .setParameters({
          id
        })
        .execute();
      
      const orphanageUpdated = await orphanagesRepository.findOneOrFail({
        relations: ['images'],
        where: {
          id
        }
      });
  
      const newImages = images.map((image) => {
        const newImage = new Image();
        newImage.path = image.path;
        newImage.orphanage = orphanageUpdated;

        return newImage;
      });
  
      const image = imagesRepository.create(newImages);
      await imagesRepository.save(image);
    }

    return response.status(204).json();
  },

  async destroy(request: Request, response: Response) {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanageById = await orphanagesRepository.findOne({
      relations: ['images'],
      where: {
        id
      }
    });

    if (!orphanageById) {
      return response.status(400).json({
        messagesError: ['Nenhum orfanato encontrado!']
      });
    }

    await orphanagesRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id')
      .setParameters({
        id
      })
      .execute();

    return response.status(200).json();
  },

  async confirm(request: Request, response: Response) {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanageById = await orphanagesRepository.findOne({
      relations: ['images'],
      where: {
        id
      }
    });

    if (!orphanageById) {
      return response.status(400).json({
        messagesError: ['Nenhum orfanato encontrado!']
      });
    }

    await orphanagesRepository
      .update(id, {
        confirmed: true
      });

    return response.status(204).json();
  }
}