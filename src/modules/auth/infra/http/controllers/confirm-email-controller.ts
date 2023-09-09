import { Request, Response } from 'express';

import UsersRepository from '../../../../users/infra/typeorm/repositories/users-repository';

import ConfirmEmailService from '../../../services/confirm-email-service';

import JsonWebTokenProvider from '../../../../../shared/providers/jwt/implementations/jsonwebtoken-provider';

class ConfirmEmailController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { token } = request.body;

    const usersRepository = new UsersRepository();
    const jsonWebTokenProvider = new JsonWebTokenProvider();
    const confirmEmailService = new ConfirmEmailService(
      usersRepository,
      jsonWebTokenProvider
    );
    await confirmEmailService.execute({ token });

    return response.status(204).json();
  }
}

export default ConfirmEmailController;
