import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ValidateTokenService from '../../../services/validate-token-service';

class ValidateTokenController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { token } = request.body;

    const validateTokenService = container.resolve(ValidateTokenService);
    const { is_admin } = await validateTokenService.execute({
      token,
    });

    return response.status(200).json({
      is_admin,
    });
  }
}

export default ValidateTokenController;
