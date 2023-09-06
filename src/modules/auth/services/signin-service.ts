import jwt from 'jsonwebtoken';

import AppError from '../../../shared/errors/app-error';
import { IHashProvider } from '../../../shared/providers/hash/models/hash-provider.interface';

import { IUsersRepository } from '../../users/domain/repositories/users-repository.interface';

interface IRequest {
  email: string;
  password: string;
  remember_me: boolean;
}

class SigninService {
  constructor(
    private usersRepository: IUsersRepository,
    private hashProvider: IHashProvider
  ) {}

  async execute({ email, password, remember_me }: IRequest): Promise<string> {
    const userByEmail = await this.usersRepository.findByEmail(email);

    if (!userByEmail) {
      throw new AppError('E-mail ou senha inválido!', 400);
    }

    const isMatch = await this.hashProvider.compare(
      password,
      userByEmail.password
    );

    if (!isMatch) {
      throw new AppError('E-mail ou senha inválido!', 400);
    }

    const userHasVerifiedEmail = await this.usersRepository.findById(
      userByEmail.id
    );

    if (!userHasVerifiedEmail?.verified_email) {
      throw new AppError('Usuário não confirmou o e-mail!', 400);
    }

    const payload = {
      id: userByEmail.id,
      admin: userByEmail.admin,
    };

    const token = jwt.sign({ ...payload }, process.env.AUTH_SECRET as string, {
      expiresIn: remember_me ? '14d' : '1d',
    });

    return token;
  }
}

export default SigninService;
