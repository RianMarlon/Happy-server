import Orphanage from '../../../modules/orphanages/infra/typeorm/entities/orphanage';
import orphanagesView from '../orphanagesView';

describe('orphanagesView Tests', () => {
  describe('renderMany', () => {
    it('should return correct structure', async () => {
      expect(
        orphanagesView.renderMany([
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
            images: [
              {
                id: 1,
                path: 'teste.png',
              },
            ],
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
            images: [
              {
                id: 1,
                path: 'teste.png',
              },
            ],
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
            images: [
              {
                id: 1,
                path: 'teste.png',
              },
            ],
          },
        ] as Orphanage[])
      ).toEqual([
        {
          about: 'Teste',
          id: 1,
          images: [
            {
              id: 1,
              url: 'http://localhost:3000/images/orphanages/teste.png',
            },
          ],
          instructions: 'Teste',
          latitude: -5.101444,
          longitude: -38.369682,
          name: 'Teste',
          open_from: '17:00',
          open_on_weekends: true,
          open_until: '19:00',
          whatsapp: '9999999999',
        },
        {
          about: 'Teste 2',
          id: 2,
          images: [
            {
              id: 1,
              url: 'http://localhost:3000/images/orphanages/teste.png',
            },
          ],
          instructions: 'Teste',
          latitude: -5.096411,
          longitude: -38.368701,
          name: 'Teste 2',
          open_from: '09:00',
          open_on_weekends: true,
          open_until: '13:00',
          whatsapp: '9999999999',
        },
        {
          about: 'Teste 3',
          id: 3,
          images: [
            {
              id: 1,
              url: 'http://localhost:3000/images/orphanages/teste.png',
            },
          ],
          instructions: 'Teste',
          latitude: -5.095159,
          longitude: -38.371198,
          name: 'Teste 3',
          open_from: '15:00',
          open_on_weekends: true,
          open_until: '19:00',
          whatsapp: '9999999999',
        },
      ]);
    });
  });

  describe('render', () => {
    it('should return correct structure', async () => {
      expect(
        orphanagesView.render({
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
          images: [
            {
              id: 1,
              path: 'teste.png',
            },
          ],
        } as Orphanage)
      ).toEqual({
        about: 'Teste',
        id: 1,
        images: [
          {
            id: 1,
            url: 'http://localhost:3000/images/orphanages/teste.png',
          },
        ],
        instructions: 'Teste',
        latitude: -5.101444,
        longitude: -38.369682,
        name: 'Teste',
        open_from: '17:00',
        open_on_weekends: true,
        open_until: '19:00',
        whatsapp: '9999999999',
      });
    });
  });
});
