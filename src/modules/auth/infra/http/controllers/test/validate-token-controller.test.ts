import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../../../../../../shared/infra/http/app';

import User from '../../../../../users/infra/typeorm/entities/user';
import MailtrapProvider from '../../../../../../shared/providers/mail/implementations/mailtrap-provider';
import { dataSource } from '../../../../../../shared/infra/typeorm';

describe('AuthController Tests', () => {
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

  it('should return status code 200 when token is valid', async () => {
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

    const responseSignin = await request(app).post('/signin').send({
      email: 'teste@teste.com',
      password: 'teste1234',
    });

    const token = responseSignin.body.token;

    const response = await request(app).post('/validate-token').send({
      token,
    });

    expect(response.status).toBe(200);
  });

  it('should return an error when token is not informed', async () => {
    const response = await request(app).post('/validate-token').send();

    expect(response.body).toEqual({
      messagesError: ['Token não informado!'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the user of token not exists', async () => {
    const token = jwt.sign({ id: 1 }, process.env.AUTH_SECRET as string, {
      expiresIn: '1d',
    });
    const response = await request(app).post('/validate-token').send({
      token,
    });

    expect(response.body).toEqual({
      messagesError: ['Usuário não encontrado!'],
    });
    expect(response.status).toBe(400);
  });
});
