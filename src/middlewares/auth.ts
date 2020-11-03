import { Request, Response, NextFunction } from 'express';
import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import 'dotenv/config';

import User from '../models/User';

export default async function (request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Yup.ValidationError(
      'Acesso não autorizado!',
      null, ''
    );
  }

  const usersRepository = getRepository(User);

  const [scheme, token] = authHeader.split(' ');
  const user: any = await jwt.verify(token, process.env.AUTH_SECRET || '');

  const userById = await usersRepository
    .createQueryBuilder('user')
    .where('user.id = :id AND user.verified_email = true')
    .setParameters({
      id: user.id
    })
    .getOne();
 
  if (userById) {
    request.body.id = user.id;
    return next();
  }

  else {
    return response.status(401).json({
      messagesError: ['Acesso não permitido!'],
    });
  }
}