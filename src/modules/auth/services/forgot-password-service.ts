import { resolve } from 'path';
import jwt from 'jsonwebtoken';

import AppError from '../../../shared/errors/app-error';
import { IUsersRepository } from '../../users/domain/repositories/users-repository.interface';
import { IMailProvider } from '../../../shared/providers/mail/models/mail-provider.interface';

interface IRequest {
  email: string;
}

class ForgotPasswordService {
  constructor(
    private usersRepository: IUsersRepository,
    private mailProvider: IMailProvider
  ) {}

  async execute({ email }: IRequest): Promise<void> {
    const userByEmail = await this.usersRepository.findByEmail(email);

    if (!userByEmail) {
      throw new AppError(
        'E-mail informado não está sendo usado por nenhum usuário!'
      );
    }

    if (!userByEmail.verified_email) {
      throw new AppError('Usuário não confirmou o e-mail!');
    }

    const payload = {
      id: userByEmail.id,
    };

    const token = jwt.sign({ ...payload }, process.env.AUTH_SECRET as string, {
      expiresIn: '30m',
    });

    const mailPath = resolve('./src/templates/emails/auth/forgotPassword.hbs');

    const to = email;
    const from = `Happy <${process.env.MAIL_SERVICE_EMAIL}>`;

    const variables = {
      mailUrl: process.env.MAIL_URL,
      token,
    };

    try {
      await this.mailProvider.send(
        to,
        from,
        'Esqueceu sua senha?',
        variables,
        mailPath
      );
    } catch (err) {
      throw new AppError('Não foi possível enviar o e-mail!', 500);
    }
  }
}

export default ForgotPasswordService;
