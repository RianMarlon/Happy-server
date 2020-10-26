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
      open_on_weekends,
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
      open_from: convertHourToMinute(open_from),
      open_until: convertHourToMinute(open_until),
      open_on_weekends: open_on_weekends === 'true',
      images,
    }

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome não informado!'),
      latitude: Yup.number().required('Localização não informada!'),
      longitude: Yup.number().required('Localização não informada!'),
      about: Yup.string().required('Informações sobre o orfanato não fornecidas!').max(500),
      whatsapp: Yup.number().required('Whatsapp não informado!'),
      instructions: Yup.string().required('Instruções de visita não informadas!'),
      open_from: Yup.number().required('Horário de abertura não informado!'),
      open_until: Yup.number().required('Horário de fechamento não informado!'),
      open_on_weekends: Yup.boolean().required('Não foi informado se funciona nos finais de semana!'),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required('Imagem não fornecida!')
        })
      )
    });
    
    await schema.validate(data, {
      abortEarly: false,
    });
    
    if (data.open_from > data.open_until) {
      throw new Yup.ValidationError(
        'Horário de abertura após o horário de fechamento!',
        null, ''
      );
    }

    else if (data.open_until - data.open_from < 30) {
      throw new Yup.ValidationError(
        'Necessário, no mínimo, disponibilidade de 30 minutos para visitas!',
        null, ''
      );
    }
    
    const orphanage = orphanagesRepository.create({ ...data });
  
    await orphanagesRepository.save(orphanage);
    
    return response.status(201).json(orphanage);
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