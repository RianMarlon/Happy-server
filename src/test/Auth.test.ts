import request from 'supertest';
import {
  getConnectionOptions,
  createConnection,
  Connection,
  getRepository,
} from 'typeorm';

import { app } from '../app';
import User from '../models/User';

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

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should return an error when the email is not informed', async () => {
      const response = await request(app).post('/signin').send({
        password: 'teste1234',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        messagesError: ['E-mail não informado!'],
      });
    });

    it('should return an error when the email is invalid', async () => {
      const response = await request(app).post('/signin').send({
        email: 'teste',
        password: 'teste1234',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        messagesError: ['E-mail inválido!'],
      });
    });

    it('should return an error when the password is not informed', async () => {
      const response = await request(app).post('/signin').send({
        email: 'teste@teste.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        messagesError: ['Senha não informada!'],
      });
    });

    it('should return an error when not exists an user with the email informed ', async () => {
      const response = await request(app).post('/signin').send({
        email: 'teste@teste.com',
        password: 'teste1234',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        messagesError: ['E-mail não cadastrado!'],
      });
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

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        messagesError: ['Senha inválida!'],
      });
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

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        messagesError: ['Usuário não confirmou o e-mail!'],
      });
    });
  });
});
