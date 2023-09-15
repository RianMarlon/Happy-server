import request from 'supertest';

import { app } from '../../../../../../shared/infra/http/app';

import User from '../../../../../users/infra/typeorm/entities/user';
import Image from '../../../../../images/infra/typeorm/entities/image';
import Orphanage from '../../../typeorm/entities/orphanage';

import MailtrapProvider from '../../../../../../shared/providers/mail/implementations/mailtrap-provider';
import { dataSource } from '../../../../../../shared/infra/typeorm';

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

describe('FindAllOrphanagesController Tests', () => {
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
    await imagesRepository.clear();
    await orphanagesRepository.clear();
  });

  afterAll(async () => {
    const usersRepository = dataSource.getRepository(User);
    await usersRepository.clear();
    await dataSource.destroy();
  });

  it('should return all orphanages confirmed', async () => {
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
        confirmed: true,
      },
    ]);
    const response = await request(app)
      .get('/orphanages-confirmed')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    const { orphanages_by_page, quantity_confirmed } = response.body;

    expect(orphanages_by_page.length).toBe(2);
    expect(quantity_confirmed).toBe(2);
    expect(orphanages_by_page[0]).toEqual({
      about: 'Teste',
      id: 1,
      images: [],
      instructions: 'Teste',
      latitude: -5.101444,
      longitude: -38.369682,
      name: 'Teste',
      open_from: '17:00',
      open_on_weekends: true,
      open_until: '19:00',
      whatsapp: '9999999999',
    });
    expect(response.status).toBe(200);
  });

  it('should return all orphanages confirmed with pagination', async () => {
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
        confirmed: true,
      },
    ]);
    const response = await request(app)
      .get('/orphanages-confirmed')
      .query({
        page: 2,
        per_page: 1,
      })
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    const { orphanages_by_page, quantity_confirmed } = response.body;

    expect(orphanages_by_page.length).toBe(1);
    expect(quantity_confirmed).toBe(2);
    expect(orphanages_by_page[0]).toEqual({
      about: 'Teste 3',
      id: 3,
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

  it('should return an empty array when the page not have an orphanage confirmed', async () => {
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
        confirmed: true,
      },
    ]);
    const response = await request(app)
      .get('/orphanages-confirmed')
      .query({
        page: 3,
        per_page: 10,
      })
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    const { orphanages_by_page, quantity_confirmed } = response.body;

    expect(orphanages_by_page.length).toBe(0);
    expect(quantity_confirmed).toBe(2);
    expect(response.status).toBe(200);
  });

  it('should return an empty array when not exists an orphanage confirmed', async () => {
    const response = await request(app)
      .get('/orphanages-confirmed')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    const { orphanages_by_page, quantity_confirmed } = response.body;

    expect(orphanages_by_page.length).toBe(0);
    expect(quantity_confirmed).toBe(0);
    expect(response.status).toBe(200);
  });
});
