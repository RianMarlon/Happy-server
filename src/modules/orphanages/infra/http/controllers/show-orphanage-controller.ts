import { Request, Response } from 'express';

import orphanagesView from '../../../../../shared/views/orphanagesView';
import ShowOrphanageService from '../../../service/show-orphanage-service';
import OrphanagesRepository from '../../typeorm/repositories/orphanages-repository';

class ShowOrphanageController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const orphanagesRepository = new OrphanagesRepository();
    const showOrphanageService = new ShowOrphanageService(orphanagesRepository);
    const orphanage = await showOrphanageService.execute(Number(id));

    return response.status(200).json(orphanagesView.render(orphanage));
  }
}

export default ShowOrphanageController;
