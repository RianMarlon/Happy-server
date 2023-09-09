import { Request, Response } from 'express';

import UsersRepository from '../../../../users/infra/typeorm/repositories/users-repository';

import ForgotPasswordService from '../../../services/forgot-password-service';

import JsonWebTokenProvider from '../../../../../shared/providers/jwt/implementations/jsonwebtoken-provider';
import MailtrapProvider from '../../../../../shared/providers/mail/implementations/mailtrap-provider';

class ForgotPasswordController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { email } = request.body;

    const usersRepository = new UsersRepository();
    const mailtrapProvider = new MailtrapProvider();
    const jsonWebTokenProvider = new JsonWebTokenProvider();
    const forgotPasswordService = new ForgotPasswordService(
      usersRepository,
      mailtrapProvider,
      jsonWebTokenProvider
    );
    await forgotPasswordService.execute({ email });

    return response.status(200).json();
  }
}

export default ForgotPasswordController;
