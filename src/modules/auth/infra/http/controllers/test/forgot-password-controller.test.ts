import request from 'supertest';
import {
  getConnectionOptions,
  createConnection,
  Connection,
  getRepository,
} from 'typeorm';

import { app } from '../../../../../../shared/infra/http/app';

import User from '../../../../../users/infra/typeorm/entities/user';
import MailtrapProvider from '../../../../../../shared/providers/mail/implementations/mailtrap-provider';

describe('ForgotPasswordController Tests', () => {
  let connection: Connection;

  beforeAll(async () => {
    const connectionOptions = await getConnectionOptions('test');
    connection = await createConnection({
      ...connectionOptions,
      name: 'default',
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    jest
      .spyOn(MailtrapProvider.prototype, 'send')
      .mockImplementation(jest.fn());
  });

  afterEach(async () => {
    const usersRepository = getRepository(User);
    await usersRepository.clear();
  });

  it('should return status code 200', async () => {
    const sendEmail = jest
      .spyOn(MailtrapProvider.prototype, 'send')
      .mockImplementation(jest.fn());

    await request(app).post('/signup').send({
      first_name: 'Teste',
      last_name: 'Teste',
      email: 'teste@teste.com',
      password: 'teste1234',
      confirm_password: 'teste1234',
    });

    const usersRepository = getRepository(User);
    await usersRepository.update(
      {
        email: 'teste@teste.com',
      },
      {
        verified_email: true,
      }
    );

    const response = await request(app).post('/forgot-password').send({
      email: 'teste@teste.com',
    });

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
  });

  it('should return internal error when not possible send the email', async () => {
    const sendEmail = jest
      .spyOn(MailtrapProvider.prototype, 'send')
      .mockImplementationOnce(jest.fn())
      .mockImplementationOnce(() => {
        throw new Error();
      });

    await request(app).post('/signup').send({
      first_name: 'Teste',
      last_name: 'Teste',
      email: 'teste@teste.com',
      password: 'teste1234',
      confirm_password: 'teste1234',
    });

    const usersRepository = getRepository(User);
    await usersRepository.update(
      {
        email: 'teste@teste.com',
      },
      {
        verified_email: true,
      }
    );

    const response = await request(app).post('/forgot-password').send({
      email: 'teste@teste.com',
    });

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(response.body).toEqual({
      messagesError: ['Não foi possível enviar o e-mail!'],
    });
    expect(response.status).toBe(500);
  });

  it('should return an error when email is not used for a user', async () => {
    const response = await request(app).post('/forgot-password').send({
      email: 'teste@teste.com',
    });

    expect(response.body).toEqual({
      messagesError: [
        'E-mail informado não está sendo usado por nenhum usuário!',
      ],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when email is not confirmed', async () => {
    await request(app).post('/signup').send({
      first_name: 'Teste',
      last_name: 'Teste',
      email: 'teste@teste.com',
      password: 'teste1234',
      confirm_password: 'teste1234',
    });

    const response = await request(app).post('/forgot-password').send({
      email: 'teste@teste.com',
    });

    expect(response.body).toEqual({
      messagesError: ['Usuário não confirmou o e-mail!'],
    });
    expect(response.status).toBe(400);
  });
});
