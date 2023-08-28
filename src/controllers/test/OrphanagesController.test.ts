import request from 'supertest';
import {
  getConnectionOptions,
  createConnection,
  Connection,
  getRepository,
} from 'typeorm';
import path from 'path';

import User from '../../models/User';
import Image from '../../models/Image';
import Orphanage from '../../models/Orphanage';
import { app } from '../../app';

import SendMailService from '../../services/SendMailService';

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

describe('OrphanagesController Tests', () => {
  let connection: Connection;
  let accessTokenUser: string;
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
    SendMailService.execute = jest.fn();
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

  describe('/orphanages', () => {
    describe('GET /', () => {
      it('should return all orphanages', async () => {
        const orphanagesRepository = getRepository(Orphanage);
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
            confirmed: true,
          },
        ]);
        const response = await request(app)
          .get('/orphanages')
          .set({ Authorization: `Basic ${accessTokenUser}` });

        expect(response.body.length).toBe(3);
        expect(response.body[0]).toEqual({
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
    });

    describe('GET /:id', () => {
      it('should return orphanage by id', async () => {
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
          .get('/orphanages/3')
          .set({ Authorization: `Basic ${accessTokenUser}` });

        expect(response.body).toEqual({
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

      it('should return an error when the orphanage not exists', async () => {
        const response = await request(app)
          .get('/orphanages/1')
          .set({ Authorization: `Basic ${accessTokenUser}` });

        expect(response.body).toEqual({
          messagesError: ['Nenhum orfanato encontrado!'],
        });
        expect(response.status).toBe(400);
      });
    });

    describe('POST /', () => {
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
            path.resolve(__dirname, '../../../mocks/image.jpeg')
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
            path.resolve(__dirname, '../../../mocks/file-1.txt')
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

    describe('PUT /:id', () => {
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
            path.resolve(__dirname, '../../../mocks/image.jpeg')
          )
          .set({ Authorization: `Basic ${accessTokenAdmin}` });

        expect(response.status).toBe(204);
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
            path.resolve(__dirname, '../../../mocks/image.jpeg')
          )
          .set({ Authorization: `Basic ${accessTokenAdmin}` });

        expect(response.body).toEqual({
          messagesError: ['Nenhum orfanato encontrado!'],
        });
        expect(response.status).toBe(400);
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
            path.resolve(__dirname, '../../../mocks/image.jpeg')
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
            path.resolve(__dirname, '../../../mocks/image.jpeg')
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
            path.resolve(__dirname, '../../../mocks/image.jpeg')
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

    describe('DELETE /:id', () => {
      it('should delete orphanage by id', async () => {
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
          .delete('/orphanages/1')
          .set({ Authorization: `Basic ${accessTokenAdmin}` });

        expect(response.status).toBe(200);
      });

      it('should return an error when the orphanage not exists', async () => {
        const response = await request(app)
          .delete('/orphanages/1')
          .set({ Authorization: `Basic ${accessTokenAdmin}` });

        expect(response.body).toEqual({
          messagesError: ['Nenhum orfanato encontrado!'],
        });
        expect(response.status).toBe(400);
      });
    });
  });
});
