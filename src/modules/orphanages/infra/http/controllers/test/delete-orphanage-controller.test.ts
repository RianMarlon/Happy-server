import request from 'supertest';

import { app } from '../../../../../../shared/infra/http/app';
import { dataSource } from '../../../../../../shared/infra/typeorm';

import User from '../../../../../users/infra/typeorm/entities/user';
import Image from '../../../../../images/infra/typeorm/entities/image';
import Orphanage from '../../../typeorm/entities/orphanage';

import MailtrapProvider from '../../../../../../shared/providers/mail/implementations/mailtrap-provider';

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

describe('DeleteOrphanageController Tests', () => {
  let accessTokenAdmin: string;

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
  });

  beforeEach(() => {
    jest
      .spyOn(MailtrapProvider.prototype, 'send')
      .mockImplementation(jest.fn());
  });

  afterEach(async () => {
    const imagesRepository = dataSource.getRepository(Image);
    const orphanagesRepository = dataSource.getRepository(Orphanage);
    await imagesRepository.clear();
    await orphanagesRepository.clear();
  });

  afterAll(async () => {
    const usersRepository = dataSource.getRepository(User);
    await usersRepository.clear();
    await dataSource.destroy();
  });

  it('should delete orphanage by id', async () => {
    const orphanagesRepository = dataSource.getRepository(Orphanage);
    await orphanagesRepository.insert([
      {
        id: 1,
        name: 'Teste',
        latitude: -5.101444,
        longitude: -38.369682,
        about: 'Teste',
        whatsapp: '9999999999',
        instructions: 'Teste',
        open_from: 1020,
        open_until: 1140,
        open_on_weekends: true,
        confirmed: true,
      },
    ]);
    const response = await request(app)
      .delete('/orphanages/1')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.status).toBe(204);
  });

  it('should return an error when the orphanage not exists', async () => {
    const response = await request(app)
      .delete('/orphanages/1')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.body).toEqual({
      messagesError: ['Nenhum orfanato encontrado!'],
    });
    expect(response.status).toBe(404);
  });
});
