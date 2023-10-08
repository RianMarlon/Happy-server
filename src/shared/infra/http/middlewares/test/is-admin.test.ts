import request from 'supertest';

import { app } from '../../app';
import { dataSource } from '../../../typeorm';

import User from '../../../../../modules/users/infra/typeorm/entities/user';

interface IUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

async function createUserAndReturnAccessToken(
  data: IUserData,
  isAdmin: boolean
) {
  await request(app).post('/signup').send(data);
  const usersRepository = dataSource.getRepository(User);
  await usersRepository.update(
    {
      email: data.email,
    },
    {
      verified_email: true,
      admin: isAdmin,
    }
  );
  const response = await request(app).post('/signin').send({
    email: data.email,
    password: data.password,
  });
  return response.body.token;
}

describe('isAdmin Tests', () => {
  let accessTokenAdmin: string;
  let accessTokenUser: string;

  beforeAll(async () => {
    await dataSource.initialize();
    accessTokenAdmin = await createUserAndReturnAccessToken(
      {
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      },
      true
    );
    accessTokenUser = await createUserAndReturnAccessToken(
      {
        first_name: 'Teste 2',
        last_name: 'Teste 2',
        email: 'teste2@teste.com',
        password: 'teste1234',
        confirm_password: 'teste1234',
      },
      false
    );
  });

  afterAll(async () => {
    const usersRepository = dataSource.getRepository(User);
    await usersRepository.delete({});
    await dataSource.destroy();
  });

  it('should call the next function when the user is authorized', async () => {
    const response = await request(app)
      .get('/orphanages-pending')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.status).toBe(200);
  });

  it('should return an error when the token is not informed', async () => {
    const response = await request(app).get('/orphanages-pending');

    expect(response.body).toEqual({
      messagesError: ['Acesso não autorizado!'],
    });
    expect(response.status).toBe(401);
  });

  it('should return an error when the token is invalid', async () => {
    const response = await request(app)
      .get('/orphanages-pending')
      .set({ Authorization: 'Basic ' });

    expect(response.body).toEqual({
      messagesError: ['Acesso não autorizado!'],
    });
    expect(response.status).toBe(401);
  });

  it('should return an error when the user is not admin', async () => {
    const response = await request(app)
      .get('/orphanages-pending')
      .set({ Authorization: `Basic ${accessTokenUser}` });

    expect(response.body).toEqual({
      messagesError: ['Acesso não autorizado!'],
    });
    expect(response.status).toBe(401);
  });
});
