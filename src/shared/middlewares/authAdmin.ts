import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import User from '../../modules/users/infra/typeorm/entities/user';

export default async function (
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({
      messagesError: ['Acesso não autorizado!'],
    });
  }

  const usersRepository = getRepository(User);

  const [scheme, token] = authHeader.split(' ');

  if (!token) {
    return response.status(401).json({
      messagesError: ['Acesso não autorizado!'],
    });
  }

  const user: any = await jwt.verify(token, process.env.AUTH_SECRET as string);

  const userById = await usersRepository
    .createQueryBuilder('user')
    .where('user.id = :id AND user.verified_email = true AND user.admin = true')
    .setParameters({
      id: user.id,
    })
    .getOne();

  if (userById) {
    return next();
  } else {
    return response.status(401).json({
      messagesError: ['Acesso não autorizado!'],
    });
  }
}
