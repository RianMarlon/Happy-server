import { Request, Response } from 'express';

import ConfirmOrphanageService from '../../../service/confirm-orphanage-service';
import OrphanagesRepository from '../../typeorm/repositories/orphanages-repository';

class ConfirmOrphanageController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const orphanagesRepository = new OrphanagesRepository();
    const confirmOrphanageService = new ConfirmOrphanageService(
      orphanagesRepository
    );
    await confirmOrphanageService.execute(Number(id));

    return response.status(200).json();
  }
}

export default ConfirmOrphanageController;
