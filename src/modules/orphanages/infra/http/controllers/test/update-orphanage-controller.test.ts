import request from 'supertest';
import {
  getConnectionOptions,
  createConnection,
  Connection,
  getRepository,
} from 'typeorm';
import path from 'path';

import { app } from '../../../../../../shared/infra/http/app';

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
  const usersRepository = getRepository(User);
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

describe('UpdateOrphanageController Tests', () => {
  let connection: Connection;
  let accessTokenAdmin: string;

  beforeAll(async () => {
    const connectionOptions = await getConnectionOptions('test');
    connection = await createConnection({
      ...connectionOptions,
      name: 'default',
    });
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
    const imagesRepository = getRepository(Image);
    const orphanagesRepository = getRepository(Orphanage);
    await imagesRepository.clear();
    await orphanagesRepository.clear();
  });

  afterAll(async () => {
    const usersRepository = getRepository(User);
    await usersRepository.clear();
    await connection.close();
  });

  it('should update orphanage by id', async () => {
    const orphanagesRepository = getRepository(Orphanage);
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
      .put('/orphanages/1')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste Novo')
      .field('latitude', '-5.093242')
      .field('longitude', '-38.367069')
      .field('about', 'Teste')
      .field('whatsapp', '88888888888')
      .field('instructions', 'Teste Novo')
      .field('open_from', '10:00')
      .field('open_until', '13:00')
      .field('open_on_weekends', 'true')
      .attach(
        'images',
        path.resolve(__dirname, '../../../../../../../mocks/image.jpeg')
      )
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.status).toBe(200);
  });

  it('should return an error when the orphanage not exists', async () => {
    const response = await request(app)
      .put('/orphanages/1')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste Novo')
      .field('latitude', '-5.093242')
      .field('longitude', '-38.367069')
      .field('about', 'Teste')
      .field('whatsapp', '88888888888')
      .field('instructions', 'Teste Novo')
      .field('open_from', '10:00')
      .field('open_until', '13:00')
      .field('open_on_weekends', 'true')
      .attach(
        'images',
        path.resolve(__dirname, '../../../../../../../mocks/image.jpeg')
      )
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.body).toEqual({
      messagesError: ['Nenhum orfanato encontrado!'],
    });
    expect(response.status).toBe(404);
  });

  it('should return an error when already exists an orphanage on the location', async () => {
    const orphanagesRepository = getRepository(Orphanage);
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
        confirmed: true,
      },
    ]);
    const response = await request(app)
      .put('/orphanages/1')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste Novo')
      .field('latitude', '-5.096411')
      .field('longitude', '-38.368701')
      .field('about', 'Teste')
      .field('whatsapp', '88888888888')
      .field('instructions', 'Teste Novo')
      .field('open_from', '10:00')
      .field('open_until', '13:00')
      .field('open_on_weekends', 'true')
      .attach(
        'images',
        path.resolve(__dirname, '../../../../../../../mocks/image.jpeg')
      )
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.body).toEqual({
      messagesError: ['Existe um orfanato nessa localização!'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the open from is greater than open util', async () => {
    const orphanagesRepository = getRepository(Orphanage);
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
      .put('/orphanages/1')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste Novo')
      .field('latitude', '-5.096411')
      .field('longitude', '-38.368701')
      .field('about', 'Teste')
      .field('whatsapp', '88888888888')
      .field('instructions', 'Teste Novo')
      .field('open_from', '13:00')
      .field('open_until', '10:00')
      .field('open_on_weekends', 'true')
      .attach(
        'images',
        path.resolve(__dirname, '../../../../../../../mocks/image.jpeg')
      )
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.body).toEqual({
      messagesError: ['Horário de abertura após o horário de fechamento!'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the difference between open from and open until is less than 30 minutes', async () => {
    const orphanagesRepository = getRepository(Orphanage);
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
      .put('/orphanages/1')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste Novo')
      .field('latitude', '-5.096411')
      .field('longitude', '-38.368701')
      .field('about', 'Teste')
      .field('whatsapp', '88888888888')
      .field('instructions', 'Teste Novo')
      .field('open_from', '13:00')
      .field('open_until', '13:20')
      .field('open_on_weekends', 'true')
      .attach(
        'images',
        path.resolve(__dirname, '../../../../../../../mocks/image.jpeg')
      )
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.body).toEqual({
      messagesError: [
        'Necessário, no mínimo, disponibilidade de 30 minutos para visitas!',
      ],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the fields are not informed', async () => {
    const orphanagesRepository = getRepository(Orphanage);
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
      .put('/orphanages/1')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.body).toEqual({
      messagesError: [
        'Nome não informado!',
        'Localização não informada!',
        'Localização não informada!',
        'Informações sobre o orfanato não fornecidas!',
        'Número do Whatsapp não informado!',
        'Horário de abertura não informado!',
        'Horário de fechamento não informado!',
        'Instruções de visitas não informadas!',
      ],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when open until and open from are invalid', async () => {
    const orphanagesRepository = getRepository(Orphanage);
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
      .put('/orphanages/1')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste')
      .field('latitude', '-22.9406434')
      .field('longitude', '46.5300517')
      .field('about', 'Teste')
      .field('whatsapp', '99999999999')
      .field('instructions', 'Teste')
      .field('open_from', '1324')
      .field('open_until', '3423')
      .field('open_on_weekends', 'false')
      .set({ Authorization: `Basic ${accessTokenAdmin}` });

    expect(response.body).toEqual({
      messagesError: [
        'Horário de abertura inválido!',
        'Horário de fechamento inválido!',
      ],
    });
    expect(response.status).toBe(400);
  });
});
