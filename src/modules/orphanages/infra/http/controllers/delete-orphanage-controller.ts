import { Request, Response } from 'express';
import { container } from 'tsyringe';

import DeleteOrphanageService from '../../../services/delete-orphanage-service';

class DeleteOrphanageController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const deleteOrphanageService = container.resolve(DeleteOrphanageService);
    await deleteOrphanageService.execute(Number(id));

    return response.status(204).json();
  }
}

export default DeleteOrphanageController;
