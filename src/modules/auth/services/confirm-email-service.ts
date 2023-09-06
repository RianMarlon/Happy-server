import jwt from 'jsonwebtoken';
import AppError from '../../../shared/errors/app-error';

import { IUsersRepository } from '../../users/domain/repositories/users-repository.interface';

interface IRequest {
  token: string;
}

class ConfirmEmailService {
  constructor(private usersRepository: IUsersRepository) {}

  async execute({ token }: IRequest): Promise<void> {
    const { id }: any = jwt.verify(
      token,
      process.env.AUTH_SECRET_CONFIRM_EMAIL as string
    );

    const userByToken = await this.usersRepository.findById(id);

    if (!userByToken) {
      throw new AppError('Usuário não encontrado!', 400);
    }

    if (userByToken?.verified_email) {
      throw new AppError('Usuário já confirmou o e-mail!', 400);
    }

    await this.usersRepository.update(id, {
      verified_email: true,
    });
  }
}

export default ConfirmEmailService;
