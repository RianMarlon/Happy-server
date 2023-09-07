import jwt from 'jsonwebtoken';

import AppError from '../../../shared/errors/app-error';
import { IUsersRepository } from '../../users/domain/repositories/users-repository.interface';

interface IRequest {
  token: string;
}

interface IResponse {
  is_admin: boolean;
}

class ValidateTokenService {
  constructor(private usersRepository: IUsersRepository) {}

  async execute({ token }: IRequest): Promise<IResponse> {
    if (!token) {
      throw new AppError('Token não informado!', 400);
    }

    const { id }: any = jwt.verify(token, process.env.AUTH_SECRET as string);

    const userById = await this.usersRepository.findById(id);

    if (!userById?.verified_email) {
      throw new AppError('Usuário não encontrado!', 400);
    }

    return {
      is_admin: userById.admin,
    };
  }
}

export default ValidateTokenService;
