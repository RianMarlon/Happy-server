import request from 'supertest';

import { app } from '../../app';
import { dataSource } from '../../../typeorm';

import User from '../../../../../modules/users/infra/typeorm/entities/user';

describe('isAutheticated Tests', () => {
  let accessToken: string;

  beforeAll(async () => {
    await dataSource.initialize();
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
    const response = await request(app).post('/signin').send({
      email: 'teste@teste.com',
      password: 'teste1234',
    });
    accessToken = response.body.token;
  });

  afterAll(async () => {
    const usersRepository = dataSource.getRepository(User);
    await usersRepository.delete({});
    await dataSource.destroy();
  });

  it('should call the next function when the user is authorized', async () => {
    const response = await request(app)
      .get('/orphanages')
      .set({ Authorization: `Basic ${accessToken}` });

    expect(response.status).toBe(200);
  });

  it('should return an error when the token is not informed', async () => {
    const response = await request(app).get('/orphanages');

    expect(response.body).toEqual({
      messagesError: ['Acesso não autorizado!'],
    });
    expect(response.status).toBe(401);
  });

  it('should return an error when the token is invalid', async () => {
    const response = await request(app)
      .get('/orphanages')
      .set({ Authorization: 'Basic ' });

    expect(response.body).toEqual({
      messagesError: ['Acesso não autorizado!'],
    });
    expect(response.status).toBe(401);
  });
});
