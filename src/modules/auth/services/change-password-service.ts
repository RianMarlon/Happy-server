import jwt from 'jsonwebtoken';

import AppError from '../../../shared/errors/app-error';

import { IHashProvider } from '../../../shared/providers/hash/models/hash-provider.interface';
import { IUsersRepository } from '../../users/domain/repositories/users-repository.interface';

interface IRequest {
  token: string;
  password: string;
}

class ChangePasswordService {
  constructor(
    private usersRepository: IUsersRepository,
    private hashProvider: IHashProvider
  ) {}

  async execute({ token, password }: IRequest): Promise<void> {
    const { id }: any = jwt.verify(token, process.env.AUTH_SECRET as string);

    const userById = await this.usersRepository.findById(id);

    if (!userById) {
      throw new AppError('Usuário não encontrado!', 400);
    }

    const newPassword = await this.hashProvider.generate(password);

    await this.usersRepository.update(id, {
      password: newPassword,
    });
  }
}

export default ChangePasswordService;
