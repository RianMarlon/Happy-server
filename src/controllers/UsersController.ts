import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import User from '../models/User';

import encryptPassword from '../utils/encryptPassword';

import emailService from '../modules/emailService';

export default {
  async create (request: Request, response: Response) {
    const {
      first_name,
      last_name,
      email,
      password,
      confirm_password
    } = request.body;

    const usersRepository = getRepository(User);

    const data = {
      first_name,
      last_name,
      email,
      password,
      confirm_password
    }

    const schema = Yup.object().shape({
      first_name: Yup.string().required('Nome não informado!'),
      last_name: Yup.string().required('Sobrenome não informado!'),
      email: Yup.string().required('E-mail não informado!')
        .email('E-mail inválido!'),
      password: Yup.string().required('Senha não informada!')
        .min(6, 'Senha deve conter, no mínimo, 6 caracteres')
    });

    await schema.validate(data, {
      abortEarly: false
    });

    const schemaConfirmPassword = Yup.object().shape({
      confirm_password: Yup.string().required('Senha de confirmação não informada!')
        .equals([password], 'Senhas não conferem!')
    });

    await schemaConfirmPassword.validate(data, {
      abortEarly: false 
    });

    const userByEmail = await usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email')
      .setParameters({
        email
      })
      .getOne();

    if (userByEmail) {
      throw new Yup.ValidationError(
        'E-mail informado já foi cadastrado!',
        null, ''
      );
    }

    const passwordEncrypted = encryptPassword(password);

    const newData = {
      first_name,
      last_name,
      email,
      password: passwordEncrypted
    }

    const user = usersRepository.create({ ...newData });

    await usersRepository.save(user);

    const payload = {
      id: user.id
    }

    const token = jwt.sign({ ...payload }, process.env.AUTH_SECRET_CONFIRM_EMAIL as string);

    emailService.sendMail({
      from: `Happy <${process.env.MAIL_SERVICE_EMAIL}>`,
      to: email,
      subject: 'Confirme seu e-mail',
      template: 'auth/confirmEmail',
      context: {
        token
      }
    } as any, (err) => {
      return response.status(500).json({
        messagesError: ['Não foi possível enviar o e-mail!']
      });
    });

    return response.status(201).json();
  },
}