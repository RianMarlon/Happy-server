import 'reflect-metadata';

import FakeOrphanagesRepository from '../../domain/repositories/fakes/fake-orphanages-repository';
import ShowOrphanageService from '../show-orphanage-service';

const spyFindOrphanageById = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'findById'
);

describe('ShowOrphanageService Tests', () => {
  let showOrphanageService: ShowOrphanageService;

  beforeAll(async () => {
    const fakeOrphanagesRepository = new FakeOrphanagesRepository();

    showOrphanageService = new ShowOrphanageService(fakeOrphanagesRepository);
  });

  it('should return an orphanage', async () => {
    const orphanage = await showOrphanageService.execute(1);

    expect(orphanage).toEqual({
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
    });
    expect(spyFindOrphanageById).toHaveBeenCalled();
  });

  it('should return an error when not exists an orphanage with the id', async () => {
    spyFindOrphanageById.mockImplementationOnce(async () => {
      return null;
    });

    await expect(showOrphanageService.execute(1)).rejects.toEqual({
      message: 'Nenhum orfanato encontrado!',
      statusCode: 404,
    });
    expect(spyFindOrphanageById).toHaveBeenCalled();
  });
});
