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

describe('FindAllOrphanagesPendingController Tests', () => {
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

  beforeEach(async () => {
    jest
      .spyOn(MailtrapProvider.prototype, 'send')
      .mockImplementation(jest.fn());
    const imagesRepository = dataSource.getRepository(Image);
    const orphanagesRepository = dataSource.getRepository(Orphanage);
    await imagesRepository.delete({});
    await orphanagesRepository.delete({});
  });

  afterAll(async () => {
    const usersRepository = dataSource.getRepository(User);
    await usersRepository.delete({});
    await dataSource.destroy();
  });

  it('should return all orphanages pending', async () => {
    const orphanagesRepository = dataSource.getRepository(Orphanage);
    await orphanagesRepository.insert([
      {
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
      {
        name: 'Teste 2',
        latitude: -5.096411,
        longitude: -38.368701,
        about: 'Teste 2',
        whatsapp: '9999999999',
        instructions: 'Teste',
        open_from: 540,
        open_until: 780,
        open_on_weekends: true,
        confirmed: true,
      },
      {
        name: 'Teste 3',
        latitude: -5.095159,
        longitude: -38.371198,
        about: 'Teste 3',
        whatsapp: '9999999999',
        instructions: 'Teste',
        open_from: 900,
        open_until: 1140,
        open_on_weekends: true,
        confirmed: false,
      },
    ]);
    const response = await request(app)
      .get('/orphanages-pending')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    const { orphanages_by_page, quantity_pending } = response.body;

    expect(orphanages_by_page.length).toBe(1);
    expect(quantity_pending).toBe(1);
    expect(orphanages_by_page[0]).toMatchObject({
      about: 'Teste 3',
      images: [],
      instructions: 'Teste',
      latitude: -5.095159,
      longitude: -38.371198,
      name: 'Teste 3',
      open_from: '15:00',
      open_on_weekends: true,
      open_until: '19:00',
      whatsapp: '9999999999',
    });
    expect(response.status).toBe(200);
  });

  it('should return all orphanages pending with pagination', async () => {
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
      {
        id: 2,
        name: 'Teste 2',
        latitude: -5.096411,
        longitude: -38.368701,
        about: 'Teste 2',
        whatsapp: '9999999999',
        instructions: 'Teste',
        open_from: 540,
        open_until: 780,
        open_on_weekends: true,
        confirmed: false,
      },
      {
        id: 3,
        name: 'Teste 3',
        latitude: -5.095159,
        longitude: -38.371198,
        about: 'Teste 3',
        whatsapp: '9999999999',
        instructions: 'Teste',
        open_from: 900,
        open_until: 1140,
        open_on_weekends: true,
        confirmed: false,
      },
    ]);
    const response = await request(app)
      .get('/orphanages-pending')
      .query({
        page: 2,
        per_page: 1,
      })
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    const { orphanages_by_page, quantity_pending } = response.body;

    expect(orphanages_by_page.length).toBe(1);
    expect(quantity_pending).toBe(2);
    expect(orphanages_by_page[0]).toMatchObject({
      about: 'Teste 3',
      images: [],
      instructions: 'Teste',
      latitude: -5.095159,
      longitude: -38.371198,
      name: 'Teste 3',
      open_from: '15:00',
      open_on_weekends: true,
      open_until: '19:00',
      whatsapp: '9999999999',
    });
    expect(response.status).toBe(200);
  });

  it('should return an empty array when not exists an orphanage pending', async () => {
    const response = await request(app)
      .get('/orphanages-pending')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    const { orphanages_by_page, quantity_pending } = response.body;

    expect(orphanages_by_page.length).toBe(0);
    expect(quantity_pending).toBe(0);
    expect(response.status).toBe(200);
  });
});
