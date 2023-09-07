import { Request, Response } from 'express';
import MailtrapProvider from '../../../../../shared/providers/mail/implementations/mailtrap-provider';
import UsersRepository from '../../../../users/infra/typeorm/repositories/users-repository';
import ForgotPasswordService from '../../../services/forgot-password-service';

class ForgotPasswordController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { email } = request.body;

    const usersRepository = new UsersRepository();
    const mailtrapProvider = new MailtrapProvider();
    const forgotPasswordService = new ForgotPasswordService(
      usersRepository,
      mailtrapProvider
    );
    await forgotPasswordService.execute({ email });

    return response.status(200).json();
  }
}

export default ForgotPasswordController;
