import { Request, Response } from 'express';
import * as Yup from 'yup';

import UsersRepository from '../../../../users/infra/typeorm/repositories/users-repository';

import SigninService from '../../../services/signin-service';

import BcryptHashProvider from '../../../../../shared/providers/hash/implementations/bcrypt-hash-provider';
import JsonWebTokenProvider from '../../../../../shared/providers/jwt/implementations/jsonwebtoken-provider';

class SigninController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { email, password, remember_me } = request.body;

    const schema = Yup.object().shape({
      email: Yup.string()
        .required('E-mail não informado!')
        .email('E-mail inválido!'),
      password: Yup.string().required('Senha não informada!'),
    });

    const data = {
      email,
      password,
    };

    await schema.validate(data, {
      abortEarly: false,
    });

    const usersRepository = new UsersRepository();
    const bcryptHashProvider = new BcryptHashProvider();
    const jsonWebTokenProvider = new JsonWebTokenProvider();
    const signinService = new SigninService(
      usersRepository,
      bcryptHashProvider,
      jsonWebTokenProvider
    );
    const token = await signinService.execute({
      email,
      password,
      remember_me,
    });

    return response.status(201).json({
      token,
    });
  }
}

export default SigninController;
