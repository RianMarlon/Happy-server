import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage';
import orphanagesView from '../views/orphanagesView';

import convertHourToMinute from '../utils/convertHourToMinute';

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
      instructions: Yup.string().required('Instruções de visita não informadas!'),
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
      relations: ['images']
    });

    return response.status(200).json(orphanagesView.renderMany(orphanages));
  },

  async show (request: Request, response: Response) {
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
  }
}