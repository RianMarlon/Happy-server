import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import Orphanage from '../modules/orphanages/infra/typeorm/entities/orphanage';

import orphanagesView from '../views/orphanagesView';

export default {
  async indexConfirmed(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);

    const filters = request.query;

    const page = Number(filters.page as string) || 1;
    const perPage = Number(filters.per_page as string) || 10;

    const limit = perPage;
    const offset = perPage * (page - 1);

    const quantityOrphanagesConfirmed = await orphanagesRepository.count({
      confirmed: true,
    });

    const orphanages = await orphanagesRepository.find({
      relations: ['images'],
      skip: offset,
      take: limit,
      where: {
        confirmed: true,
      },
    });

    return response.status(200).json({
      orphanages_by_page: orphanagesView.renderMany(orphanages),
      quantity_confirmed: quantityOrphanagesConfirmed,
    });
  },

  async indexPending(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);

    const filters = request.query;

    const page = Number(filters.page as string) || 1;
    const perPage = Number(filters.per_page as string) || 10;

    const limit = perPage;
    const offset = perPage * (page - 1);

    const quantityOrphanagesPending = await orphanagesRepository.count({
      confirmed: false,
    });

    const orphanages = await orphanagesRepository.find({
      relations: ['images'],
      skip: offset,
      take: limit,
      where: {
        confirmed: false,
      },
    });

    return response.status(200).json({
      orphanages_by_page: orphanagesView.renderMany(orphanages),
      quantity_pending: quantityOrphanagesPending,
    });
  },
};
