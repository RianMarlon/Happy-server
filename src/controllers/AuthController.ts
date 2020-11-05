import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import 'dotenv/config';

import User from '../models/User';

export default {
  async signin(request: Request, response: Response) {
    const { email, password, remember_me } = request.body;

    const usersRepository = getRepository(User);

    const schema = Yup.object().shape({
      email: Yup.string().required('E-mail não informado!').email('E-mail inválido!'),
      password: Yup.string().required('Senha não informada!'),
    });

    const data = {
      email,
      password,
    }

    await schema.validate(data, {
      abortEarly: false,
    });

    const userByEmail: any = await usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email')
      .setParameters({
        email,
      })
      .getOne();

    if (!userByEmail) {
      throw new Yup.ValidationError(
        'E-mail não cadastrado!',
        null, ''
      );
    }

    const isMatch = bcrypt.compareSync(password, userByEmail.password);

    if (!isMatch) {
      throw new Yup.ValidationError(
        'Senha inválida!',
        null, ''
      );
    }

    const userHasVerifiedEmail = await usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id AND user.verified_email = true')
      .setParameters({
        id: userByEmail.id,
      })
      .getOne();

    if (!userHasVerifiedEmail) {
      throw new Yup.ValidationError(
        'Usuário não confirmou o e-mail!',
        null, ''
      );
    }

    const payload = {
      id: userByEmail.id,
    }

    const token = jwt.sign({ ...payload }, process.env.AUTH_SECRET || '', {
      expiresIn: remember_me ? '14d' : '1d',
    });

    return response.status(201).json({
      token,
    });
  },

  async validateToken(request: Request, response: Response) {
    const { token } = request.body;

    const usersRepository = getRepository(User);

    if (!token) {
      throw new Yup.ValidationError(
        'Token não informado!',
        null, ''
      );
    }

    const { id }: any = jwt.verify(token, process.env.AUTH_SECRET || '');

    const userById = await usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id AND user.verified_email = true')
      .setParameters({
        id,
      })
      .getOne();

    if (!userById) {
      return response.status(200).json({
        isValidToken: false,
      });
    }

    else {
      return response.status(200).json({
        isValidToken: true,
      });
    }
  },
}