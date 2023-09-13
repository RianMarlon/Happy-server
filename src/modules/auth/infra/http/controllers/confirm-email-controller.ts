import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ConfirmEmailService from '../../../services/confirm-email-service';

class ConfirmEmailController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { token } = request.body;

    const confirmEmailService = container.resolve(ConfirmEmailService);
    await confirmEmailService.execute({ token });

    return response.status(204).json();
  }
}

export default ConfirmEmailController;
