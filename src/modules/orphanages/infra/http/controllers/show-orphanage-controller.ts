import { Request, Response } from 'express';
import { container } from 'tsyringe';

import orphanagesView from '../../../../../shared/views/orphanagesView';
import ShowOrphanageService from '../../../service/show-orphanage-service';

class ShowOrphanageController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const showOrphanageService = container.resolve(ShowOrphanageService);
    const orphanage = await showOrphanageService.execute(Number(id));

    return response.status(200).json(orphanagesView.render(orphanage));
  }
}

export default ShowOrphanageController;
