import request from 'supertest';
import {
  getConnectionOptions,
  createConnection,
  Connection,
  getRepository,
} from 'typeorm';

import { app } from '../../app';
import User from '../../modules/users/infra/typeorm/entities/user';
import MailtrapProvider from '../../shared/providers/mail/implementations/mailtrap-provider';

describe('UsersController Tests', () => {
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

  describe('/signup', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      expect(response.status).toBe(201);
    });

    it('should return internal error when not possible send the email', async () => {
      jest
        .spyOn(MailtrapProvider.prototype, 'send')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['Não foi possível enviar o e-mail!'],
      });
      expect(response.status).toBe(500);
    });

    it('should return an error when the first name is not informed', async () => {
      const response = await request(app).post('/signup').send({
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['Nome não informado!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when the last name is not informed', async () => {
      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['Sobrenome não informado!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when the email is not informed', async () => {
      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['E-mail não informado!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when the email is invalid', async () => {
      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['E-mail inválido!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when the passsword is not informed', async () => {
      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        confirm_password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['Senha não informada!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when the password is less than 6 characters', async () => {
      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste',
        confirm_password: 'teste',
      });

      expect(response.body).toEqual({
        messagesError: ['Senha deve conter, no mínimo, 6 caracteres'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when the confirm passsword is not informed', async () => {
      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['Senha de confirmação não informada!'],
      });
      expect(response.status).toBe(400);
    });

    it('should return an error when already exists an user with the email', async () => {
      await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      const response = await request(app).post('/signup').send({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      });

      expect(response.body).toEqual({
        messagesError: ['E-mail informado já foi cadastrado!'],
      });
      expect(response.status).toBe(400);
    });
  });
});
