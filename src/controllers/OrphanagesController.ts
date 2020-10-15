import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import Orphanage from '../models/Orphanage';
import orphanagesView from '../views/orphanagesView';

export default {
  async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = request.body;
  
    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map((image) => {
      return {
        path: image.filename
      }
    });
  
    const orphanage = orphanagesRepository.create({
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images,
    });
  
    await orphanagesRepository.save(orphanage)
    
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
      return response.status(200).json({
        messageError: 'Nenhum orfanato encontrado!'
      });
    }
  }
}