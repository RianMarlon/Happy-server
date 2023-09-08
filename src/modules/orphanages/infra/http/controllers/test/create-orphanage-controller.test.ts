import request from 'supertest';
import {
  getConnectionOptions,
  createConnection,
  Connection,
  getRepository,
} from 'typeorm';
import path from 'path';

import { app } from '../../../../../../app';

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

describe('CreateOrphanageController Tests', () => {
  let connection: Connection;
  let accessTokenUser: string;

  beforeAll(async () => {
    const connectionOptions = await getConnectionOptions('test');
    connection = await createConnection({
      ...connectionOptions,
      name: 'default',
    });
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

  it('should register a new orphanage', async () => {
    const response = await request(app)
      .post('/orphanages')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste')
      .field('latitude', '-22.9406434')
      .field('longitude', '46.5300517')
      .field('about', 'Teste')
      .field('whatsapp', '99999999999')
      .field('instructions', 'Teste')
      .field('open_from', '14:00')
      .field('open_until', '17:00')
      .field('open_on_weekends', 'false')
      .attach(
        'images',
        path.resolve(__dirname, '../../../../../../../mocks/image.jpeg')
      )
      .set({ Authorization: `Basic ${accessTokenUser}` });

    expect(response.status).toBe(201);
  });

  it('should return an error when the image is a invalid file', async () => {
    const response = await request(app)
      .post('/orphanages')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste')
      .field('latitude', '-22.9406434')
      .field('longitude', '46.5300517')
      .field('about', 'Teste')
      .field('whatsapp', '99999999999')
      .field('instructions', 'Teste')
      .field('open_from', '14:00')
      .field('open_until', '17:00')
      .field('open_on_weekends', 'false')
      .attach(
        'images',
        path.resolve(__dirname, '../../../../../../../mocks/file-1.txt')
      )
      .set({ Authorization: `Basic ${accessTokenUser}` });

    expect(response.body).toEqual({
      messagesError: ['Formato da imagem fornecida não é aceito!'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the open from is greater than open util', async () => {
    const response = await request(app)
      .post('/orphanages')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste')
      .field('latitude', '-22.9406434')
      .field('longitude', '46.5300517')
      .field('about', 'Teste')
      .field('whatsapp', '99999999999')
      .field('instructions', 'Teste')
      .field('open_from', '17:00')
      .field('open_until', '14:00')
      .field('open_on_weekends', 'false')
      .set({ Authorization: `Basic ${accessTokenUser}` });

    expect(response.body).toEqual({
      messagesError: ['Horário de abertura após o horário de fechamento!'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the difference between open from and open until is less than 30 minutes', async () => {
    const response = await request(app)
      .post('/orphanages')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste')
      .field('latitude', '-22.9406434')
      .field('longitude', '46.5300517')
      .field('about', 'Teste')
      .field('whatsapp', '99999999999')
      .field('instructions', 'Teste')
      .field('open_from', '14:00')
      .field('open_until', '14:20')
      .field('open_on_weekends', 'false')
      .set({ Authorization: `Basic ${accessTokenUser}` });

    expect(response.body).toEqual({
      messagesError: [
        'Necessário, no mínimo, disponibilidade de 30 minutos para visitas!',
      ],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when exists an orphanage on the location informed', async () => {
    await request(app)
      .post('/orphanages')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste')
      .field('latitude', '-22.9406434')
      .field('longitude', '46.5300517')
      .field('about', 'Teste')
      .field('whatsapp', '99999999999')
      .field('instructions', 'Teste')
      .field('open_from', '14:00')
      .field('open_until', '18:20')
      .field('open_on_weekends', 'false')
      .set({ Authorization: `Basic ${accessTokenUser}` });

    const response = await request(app)
      .post('/orphanages')
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'Teste 2')
      .field('latitude', '-22.9406434')
      .field('longitude', '46.5300517')
      .field('about', 'Teste 2')
      .field('whatsapp', '888888888888')
      .field('instructions', 'Teste 2')
      .field('open_from', '09:40')
      .field('open_until', '12:00')
      .field('open_on_weekends', 'false')
      .set({ Authorization: `Basic ${accessTokenUser}` });

    expect(response.body).toEqual({
      messagesError: ['Existe um orfanato nessa localização!'],
    });
    expect(response.status).toBe(400);
  });

  it('should return an error when the fields are not informed', async () => {
    const response = await request(app)
      .post('/orphanages')
      .send()
      .set({ Authorization: `Basic ${accessTokenUser}` });

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
    const response = await request(app)
      .post('/orphanages')
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
      .set({ Authorization: `Basic ${accessTokenUser}` });

    expect(response.body).toEqual({
      messagesError: [
        'Horário de abertura inválido!',
        'Horário de fechamento inválido!',
      ],
    });
    expect(response.status).toBe(400);
  });
});
