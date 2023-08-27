import request from 'supertest';
import jwt from 'jsonwebtoken';
import {
  getConnectionOptions,
  createConnection,
  Connection,
  getRepository,
} from 'typeorm';

import { app } from '../app';
import User from '../models/User';

import SendMailService from '../services/SendMailService';

describe('Auth Tests', () => {
  let connection: Connection;

  beforeAll(async () => {
    const connectionOptions = await getConnectionOptions('test');
    connection = await createConnection({
      ...connectionOptions,
      name: 'default',
    });
  });

  beforeEach(async () => {
    SendMailService.execute = jest.fn();
    const usersRepository = getRepository(User);
    await usersRepository.clear();
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('/signin', () => {
    it('should return access token when login successfully', async () => {
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

      const response = await request(app).post('/signin').send({
        email: 'teste@teste.com',
        password: 'teste1234',
      });

      expect(response.body).toHaveProperty('token');
      expect(response.status).toBe(201);
    });

    it('should return an error when the email is not informed', async () => {
      const response = await request(app).post('/signin').send({
        password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['E-mail não informado!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when the email is invalid', async () => {
      const response = await request(app).post('/signin').send({
        email: 'teste',
        password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['E-mail inválido!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when the password is not informed', async () => {
      const response = await request(app).post('/signin').send({
        email: 'teste@teste.com',
      });

      expect(response.body).toEqual({
        messagesError: ['Senha não informada!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when not exists an user with the email informed ', async () => {
      const response = await request(app).post('/signin').send({
        email: 'teste@teste.com',
        password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['E-mail não cadastrado!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when password not match with the password in database', async () => {
      await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      const response = await request(app).post('/signin').send({
        email: 'teste@teste.com',
        password: '12334567',
      });

      expect(response.body).toEqual({
        messagesError: ['Senha inválida!'],
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

      const response = await request(app).post('/signin').send({
        email: 'teste@teste.com',
        password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['Usuário não confirmou o e-mail!'],
      });
      expect(response.status).toBe(400);
    });
  });

  describe('/forgot-password', () => {
    it('should return status code 200', async () => {
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

      expect(SendMailService.execute).toHaveBeenCalledTimes(2);
      expect(response.status).toBe(200);
    });

    it('should return internal error when not possible send the email', async () => {
      SendMailService.execute = jest
        .fn()
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

      expect(SendMailService.execute).toHaveBeenCalledTimes(2);
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

  describe('/validate-token', () => {
    it('should return status code 200 when token is valid', async () => {
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
      const token = jwt.sign(
        { id: 'teste' },
        process.env.AUTH_SECRET as string,
        {
          expiresIn: '1d',
        }
      );
      const response = await request(app).post('/validate-token').send({
        token,
      });

      expect(response.body).toEqual({
        messagesError: ['Usuário não encontrado!'],
      });
      expect(response.status).toBe(400);
    });
  });
});
