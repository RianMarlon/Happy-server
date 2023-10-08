import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../../../../../../shared/infra/http/app';
import { dataSource } from '../../../../../../shared/infra/typeorm';

import User from '../../../../../users/infra/typeorm/entities/user';
import MailtrapProvider from '../../../../../../shared/providers/mail/implementations/mailtrap-provider';

describe('ChangePasswordController Tests', () => {
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

  it('should return status code 204 when password is changed', async () => {
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

    const response = await request(app).put('/change-password').send({
      token,
      password: 'teste8493',
      confirm_password: 'teste8493',
    });

    const responseSigninWithNewPassword = await request(app)
      .post('/signin')
      .send({
        email: 'teste@teste.com',
        password: 'teste8493',
      });

    expect(response.status).toBe(204);
    expect(responseSigninWithNewPassword.status).toBe(201);
  });

  it('should return an error when the user of token not exists', async () => {
    const token = jwt.sign({ id: 1 }, process.env.AUTH_SECRET as string, {
      expiresIn: '1d',
    });
    const response = await request(app).put('/change-password').send({
      token,
      password: 'teste8493',
      confirm_password: 'teste8493',
    });

    expect(response.body).toEqual({
      messagesError: ['Usuário não encontrado!'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the password is not informed', async () => {
    const token = jwt.sign({ id: 'teste' }, process.env.AUTH_SECRET as string, {
      expiresIn: '1d',
    });
    const response = await request(app).put('/change-password').send({
      token,
    });

    expect(response.body).toEqual({
      messagesError: [
        'Senha de confirmação não informada!',
        'Senha não informada!',
      ],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the password is not match with the confirm password', async () => {
    const token = jwt.sign({ id: 'teste' }, process.env.AUTH_SECRET as string, {
      expiresIn: '1d',
    });
    const response = await request(app).put('/change-password').send({
      token,
      password: 'teste93820',
      confirm_password: 'teste9823',
    });

    expect(response.body).toEqual({
      messagesError: ['Senhas não conferem'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the password is less than 6 characters', async () => {
    const token = jwt.sign({ id: 'teste' }, process.env.AUTH_SECRET as string, {
      expiresIn: '1d',
    });
    const response = await request(app).put('/change-password').send({
      token,
      password: 'teste',
      confirm_password: 'teste',
    });

    expect(response.body).toEqual({
      messagesError: ['Senha deve conter, no mínimo, 6 caracteres'],
    });
    expect(response.status).toBe(400);
  });
});
