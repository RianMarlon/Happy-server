import { Request, Response } from 'express';
import { container } from 'tsyringe';

import FindImageByFileNameService from '../../services/find-image-by-filename-service';

export class FindImageByFilenameController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { filename } = request.params;

    const findImageByFilename = container.resolve(FindImageByFileNameService);
    const fileContent = await findImageByFilename.execute(filename);

    return response.end(fileContent);
  }
}
