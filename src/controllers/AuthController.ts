import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { resolve } from 'path';
import * as Yup from 'yup';

import User from '../modules/users/infra/typeorm/entities/user';

import SendMailService from '../services/SendMailService';

import encryptPassword from '../utils/encryptPassword';

export default {
  async validateToken(request: Request, response: Response) {
    const { token } = request.body;

    const usersRepository = getRepository(User);

    if (!token) {
      throw new Yup.ValidationError('Token não informado!', null, '');
    }

    const { id }: any = jwt.verify(token, process.env.AUTH_SECRET as string);

    const userById = await usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id AND user.verified_email = true')
      .setParameters({
        id,
      })
      .getOne();

    if (!userById) {
      throw new Yup.ValidationError('Usuário não encontrado!', null, '');
    }

    return response.status(200).json({
      is_admin: userById.admin,
    });
  },

  async changePassword(request: Request, response: Response) {
    const { token, password, confirm_password } = request.body;

    const usersRepository = getRepository(User);

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

    const { id }: any = jwt.verify(token, process.env.AUTH_SECRET as string);

    const userById = await usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id')
      .setParameters({
        id,
      })
      .getOne();

    if (!userById) {
      throw new Yup.ValidationError('Usuário não encontrado!', null, '');
    }

    await usersRepository.update(id, {
      password: encryptPassword(password),
    });

    return response.status(204).json();
  },
};
