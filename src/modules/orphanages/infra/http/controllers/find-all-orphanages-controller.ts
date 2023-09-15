import { Request, Response } from 'express';
import { container } from 'tsyringe';

import orphanagesView from '../../../../../shared/views/orphanagesView';
import FindAllOrphanagesService from '../../../services/find-all-orphanages-service';

class FindAllOrphanagesController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const findAllOrphanageService = container.resolve(FindAllOrphanagesService);
    const orphanages = await findAllOrphanageService.execute(true);

    return response.status(200).json(orphanagesView.renderMany(orphanages));
  }
}

export default FindAllOrphanagesController;
