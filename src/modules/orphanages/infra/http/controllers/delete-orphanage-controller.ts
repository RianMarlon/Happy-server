import { Request, Response } from 'express';

import DeleteOrphanageService from '../../../service/delete-orphanage-service';
import OrphanagesRepository from '../../typeorm/repositories/orphanages-repository';
import DiskStorageProvider from '../../../../../shared/providers/file-storage/implementations/disk-storage-provider';

class DeleteOrphanageController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const orphanagesRepository = new OrphanagesRepository();
    const diskStorageProvider = new DiskStorageProvider();
    const deleteOrphanageService = new DeleteOrphanageService(
      orphanagesRepository,
      diskStorageProvider
    );
    await deleteOrphanageService.execute(Number(id));

    return response.status(204).json();
  }
}

export default DeleteOrphanageController;
