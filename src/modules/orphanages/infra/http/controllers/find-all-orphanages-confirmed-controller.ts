import { Request, Response } from 'express';

import orphanagesView from '../../../../../views/orphanagesView';
import FindAllOrphanagesPaginatedService from '../../../service/find-all-orphanages-paginated-service';

import OrphanagesRepository from '../../typeorm/repositories/orphanages-repository';

class FindAllOrphanagesConfirmedController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const filters = request.query;
    const page = Number(filters.page as string) || 1;
    const perPage = Number(filters.per_page as string) || 10;
    const limit = perPage;
    const offset = perPage * (page - 1);

    const orphanagesRepository = new OrphanagesRepository();
    const findAllOrphanagesPaginatedService =
      new FindAllOrphanagesPaginatedService(orphanagesRepository);
    const paginated = await findAllOrphanagesPaginatedService.execute(
      true,
      limit,
      offset
    );

    return response.status(200).json({
      orphanages_by_page: orphanagesView.renderMany(paginated.orphanages),
      quantity_confirmed: paginated.quantity,
    });
  }
}

export default FindAllOrphanagesConfirmedController;
