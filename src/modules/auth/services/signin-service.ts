import { injectable, inject } from 'tsyringe';

import AppError from '../../../shared/errors/app-error';

import { IHashProvider } from '../../../shared/providers/hash/models/hash-provider.interface';
import { IJwtProvider } from '../../../shared/providers/jwt/models/jwt-provider.interface';
import { IUsersRepository } from '../../users/domain/repositories/users-repository.interface';

interface IRequest {
  email: string;
  password: string;
  remember_me: boolean;
}

@injectable()
class SigninService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider,
    @inject('JwtProvider')
    private jwtProvider: IJwtProvider
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

    if (!userByEmail.verified_email) {
      throw new AppError('Usuário não confirmou o e-mail!', 400);
    }

    const payload = {
      id: userByEmail.id,
      isAdmin: userByEmail.admin,
    };

    const token = this.jwtProvider.sign(
      { ...payload },
      process.env.AUTH_SECRET as string,
      {
        expiresIn: remember_me ? '14d' : '1d',
      }
    );

    return token;
  }
}

export default SigninService;
