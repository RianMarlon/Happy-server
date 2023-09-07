import { Request, Response } from 'express';

import UsersRepository from '../../../users/infra/typeorm/repositories/users-repository';
import ValidateTokenService from '../../services/validate-token-service';

class ValidateTokenController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { token } = request.body;

    const usersRepository = new UsersRepository();
    const validateTokenService = new ValidateTokenService(usersRepository);
    const { is_admin } = await validateTokenService.execute({
      token,
    });

    return response.status(200).json({
      is_admin,
    });
  }
}

export default ValidateTokenController;
