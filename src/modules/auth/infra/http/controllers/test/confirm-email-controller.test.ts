import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../../../../../../shared/infra/http/app';
import { dataSource } from '../../../../../../shared/infra/typeorm';

import User from '../../../../../users/infra/typeorm/entities/user';
import MailtrapProvider from '../../../../../../shared/providers/mail/implementations/mailtrap-provider';

describe('ConfirmEmailController Tests', () => {
  beforeAll(async () => {
    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    jest
      .spyOn(MailtrapProvider.prototype, 'send')
      .mockImplementation(jest.fn());
  });

  afterEach(async () => {
    const usersRepository = dataSource.getRepository(User);
    await usersRepository.delete({});
  });

  it('should return status code 204 when the email is confirmed', async () => {
    await request(app).post('/signup').send({
      first_name: 'Teste',
      last_name: 'Teste',
      email: 'teste@teste.com',
      password: 'teste1234',
      confirm_password: 'teste1234',
    });

    const usersRepository = dataSource.getRepository(User);
    const userByEmail = await usersRepository.findOne({
      where: {
        email: 'teste@teste.com',
      },
    });

    const token = jwt.sign(
      { id: userByEmail?.id },
      process.env.AUTH_SECRET_CONFIRM_EMAIL as string
    );

    const response = await request(app).put('/confirm-email').send({
      token,
    });

    const userById = await usersRepository.findOne({
      where: {
        id: userByEmail?.id,
      },
    });

    expect(userById?.verified_email).toBeTruthy();
    expect(response.status).toBe(204);
  });

  it('should return an error when user of token not exists', async () => {
    const token = jwt.sign(
      { id: '4232' },
      process.env.AUTH_SECRET_CONFIRM_EMAIL as string
    );

    const response = await request(app).put('/confirm-email').send({
      token,
    });

    expect(response.body).toEqual({
      messagesError: ['Usuário não encontrado!'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when user has already confirmed the email', async () => {
    await request(app).post('/signup').send({
      first_name: 'Teste',
      last_name: 'Teste',
      email: 'teste@teste.com',
      password: 'teste1234',
      confirm_password: 'teste1234',
    });

    const usersRepository = dataSource.getRepository(User);
    await usersRepository.update(
      {
        email: 'teste@teste.com',
      },
      {
        verified_email: true,
      }
    );
    const userByEmail = await usersRepository.findOne({
      where: {
        email: 'teste@teste.com',
      },
    });

    const token = jwt.sign(
      { id: userByEmail?.id },
      process.env.AUTH_SECRET_CONFIRM_EMAIL as string
    );

    const response = await request(app).put('/confirm-email').send({
      token,
    });

    expect(response.body).toEqual({
      messagesError: ['Usuário já confirmou o e-mail!'],
    });
    expect(response.status).toBe(400);
  });
});
