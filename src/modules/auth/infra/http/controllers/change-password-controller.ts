import { Request, Response } from 'express';
import * as Yup from 'yup';

import UsersRepository from '../../../../users/infra/typeorm/repositories/users-repository';

import ChangePasswordService from '../../../services/change-password-service';

import BcryptHashProvider from '../../../../../shared/providers/hash/implementations/bcrypt-hash-provider';
import JsonWebTokenProvider from '../../../../../shared/providers/jwt/implementations/jsonwebtoken-provider';

class ChangePasswordController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { token, password, confirm_password } = request.body;

    const data = {
      password,
      confirm_password,
    };

    const schema = Yup.object().shape({
      password: Yup.string()
        .required('Senha não informada!')
        .min(6, 'Senha deve conter, no mínimo, 6 caracteres'),
      confirm_password: Yup.string()
        .required('Senha de confirmação não informada!')
        .equals([password], 'Senhas não conferem'),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const usersRepository = new UsersRepository();
    const bcryptHashProvider = new BcryptHashProvider();
    const jsonWebTokenProvider = new JsonWebTokenProvider();
    const changePasswordService = new ChangePasswordService(
      usersRepository,
      bcryptHashProvider,
      jsonWebTokenProvider
    );
    await changePasswordService.execute({
      token,
      password,
    });

    return response.status(204).json({
      token,
    });
  }
}

export default ChangePasswordController;
