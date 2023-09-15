import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ConfirmOrphanageService from '../../../services/confirm-orphanage-service';

class ConfirmOrphanageController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const confirmOrphanageService = container.resolve(ConfirmOrphanageService);
    await confirmOrphanageService.execute(Number(id));

    return response.status(200).json();
  }
}

export default ConfirmOrphanageController;
