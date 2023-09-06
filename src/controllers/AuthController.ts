import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { resolve } from 'path';
import * as Yup from 'yup';

import User from '../modules/users/infra/typeorm/entities/user';

import SendMailService from '../services/SendMailService';

import encryptPassword from '../utils/encryptPassword';

export default {
  async signin(request: Request, response: Response) {
    const { email, password, remember_me } = request.body;

    const usersRepository = getRepository(User);

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

    const userByEmail: any = await usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email')
      .setParameters({
        email,
      })
      .getOne();

    if (!userByEmail) {
      throw new Yup.ValidationError('E-mail não cadastrado!', null, '');
    }

    const isMatch = bcrypt.compareSync(password, userByEmail.password);

    if (!isMatch) {
      throw new Yup.ValidationError('Senha inválida!', null, '');
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
        null,
        ''
      );
    }

    const payload = {
      id: userByEmail.id,
      admin: userByEmail.admin,
    };

    const token = jwt.sign({ ...payload }, process.env.AUTH_SECRET as string, {
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

  async forgotPassword(request: Request, response: Response) {
    const { email } = request.body;

    const userRepository = getRepository(User);

    const userByEmail = await userRepository
      .createQueryBuilder('user')
      .where('user.email = :email')
      .setParameters({
        email,
      })
      .getOne();

    if (!userByEmail) {
      throw new Yup.ValidationError(
        'E-mail informado não está sendo usado por nenhum usuário!',
        null,
        ''
      );
    }

    const userHasVerifiedEmail = await userRepository
      .createQueryBuilder('user')
      .where('user.email = :email AND user.verified_email = true')
      .setParameters({
        email,
      })
      .getOne();

    if (!userHasVerifiedEmail) {
      throw new Yup.ValidationError(
        'Usuário não confirmou o e-mail!',
        null,
        ''
      );
    }

    const payload = {
      id: userByEmail.id,
    };

    const token = jwt.sign({ ...payload }, process.env.AUTH_SECRET as string, {
      expiresIn: '30m',
    });

    const mailPath = resolve('./src/templates/emails/auth/forgotPassword.hbs');

    const to = email;
    const from = `Happy <${process.env.MAIL_SERVICE_EMAIL}>`;

    const variables = {
      mailUrl: process.env.MAIL_URL,
      token,
    };

    try {
      await SendMailService.execute(
        to,
        from,
        'Esqueceu sua senha?',
        variables,
        mailPath
      );
    } catch (err) {
      return response.status(500).json({
        messagesError: ['Não foi possível enviar o e-mail!'],
      });
    }

    return response.status(200).json();
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

  async confirmEmail(request: Request, response: Response) {
    const { token } = request.body;

    const usersRepository = getRepository(User);

    const { id }: any = jwt.verify(
      token,
      process.env.AUTH_SECRET_CONFIRM_EMAIL as string
    );

    const userByToken = await usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id')
      .setParameters({
        id,
      })
      .getOne();

    if (!userByToken) {
      throw new Yup.ValidationError('Usuário não encontrado!', null, '');
    }

    const userByVerifiedEmail = await usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id AND user.verified_email = true')
      .setParameters({
        id,
      })
      .getOne();

    if (userByVerifiedEmail) {
      throw new Yup.ValidationError('Usuário já confirmou o e-mail!', null, '');
    }

    await usersRepository.update(id, {
      verified_email: true,
    });

    return response.status(204).json();
  },
};
