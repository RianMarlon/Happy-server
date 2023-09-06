import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../modules/users/infra/typeorm/entities/user';

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
};
