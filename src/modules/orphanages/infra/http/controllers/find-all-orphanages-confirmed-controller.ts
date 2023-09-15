import { Request, Response } from 'express';
import { container } from 'tsyringe';

import orphanagesView from '../../../../../shared/views/orphanagesView';
import FindAllOrphanagesPaginatedService from '../../../services/find-all-orphanages-paginated-service';

class FindAllOrphanagesConfirmedController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const filters = request.query;
    const page = Number(filters.page as string) || 1;
    const perPage = Number(filters.per_page as string) || 10;
    const limit = perPage;
    const offset = perPage * (page - 1);

    const findAllOrphanagesPaginatedService = container.resolve(
      FindAllOrphanagesPaginatedService
    );
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
