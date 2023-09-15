import 'reflect-metadata';

import FakeOrphanagesRepository from '../../domain/repositories/fakes/fake-orphanages-repository';
import FindAllOrphanagesPaginatedService from '../find-all-orphanages-paginated-service';

const spyFindAllOrphanages = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'findAll'
);

describe('FindAllOrphanagesPaginatedService Tests', () => {
  let findAllOrphanagesPaginatedService: FindAllOrphanagesPaginatedService;

  beforeAll(async () => {
    const fakeOrphanagesRepository = new FakeOrphanagesRepository();

    findAllOrphanagesPaginatedService = new FindAllOrphanagesPaginatedService(
      fakeOrphanagesRepository
    );
  });

  it('should return orphanages with quantity', async () => {
    const result = await findAllOrphanagesPaginatedService.execute(true, 0, 10);

    expect(result.quantity).toEqual(1);
    expect(result.orphanages).toEqual([
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
