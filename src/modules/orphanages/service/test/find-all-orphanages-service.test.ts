import 'reflect-metadata';

import FakeOrphanagesRepository from '../../domain/repositories/fakes/fake-orphanages-repository';
import FindAllOrphanagesService from '../find-all-orphanages-service';

const spyFindAllOrphanages = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'findAll'
);

describe('FindAllOrphanagesService Tests', () => {
  let findAllOrphanagesService: FindAllOrphanagesService;

  beforeAll(async () => {
    const fakeOrphanagesRepository = new FakeOrphanagesRepository();

    findAllOrphanagesService = new FindAllOrphanagesService(
      fakeOrphanagesRepository
    );
  });

  it('should return orphanages with quantity', async () => {
    const orphanages = await findAllOrphanagesService.execute(true, 0, 10);
    expect(orphanages).toEqual([
      {
        about: 'Teste',
        confirmed: true,
        id: 1,
        images: [
          {
            id: 1,
            path: 'teste.png',
          },
        ],
        instructions: 'Teste',
        latitude: -5.101444,
        longitude: -38.369682,
        name: 'Teste',
        open_from: 1020,
        open_on_weekends: true,
        open_until: 1140,
        whatsapp: '9999999999',
      },
    ]);
    expect(spyFindAllOrphanages).toHaveBeenCalled();
  });
});
