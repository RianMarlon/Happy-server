import { Request, Response } from 'express';

import orphanagesView from '../../../../../views/orphanagesView';
import FindAllOrphanagesService from '../../../service/find-all-orphanages-service';

import OrphanagesRepository from '../../typeorm/repositories/orphanages-repository';

class FindAllOrphanagesController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const orphanagesRepository = new OrphanagesRepository();
    const findAllOrphanageService = new FindAllOrphanagesService(
      orphanagesRepository
    );
    const orphanages = await findAllOrphanageService.execute(true);

    return response.status(200).json(orphanagesView.renderMany(orphanages));
  }
}

export default FindAllOrphanagesController;
