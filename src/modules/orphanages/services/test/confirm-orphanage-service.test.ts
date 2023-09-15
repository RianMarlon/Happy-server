import 'reflect-metadata';

import FakeOrphanagesRepository from '../../domain/repositories/fakes/fake-orphanages-repository';
import ConfirmOrphanageService from '../confirm-orphanage-service';

const spyFindOrphanageById = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'findById'
);
const spyConfirmOrphanage = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'confirm'
);

describe('ConfirmOrphanageService Tests', () => {
  let confirmOrphanageService: ConfirmOrphanageService;

  beforeAll(async () => {
    const fakeOrphanagesRepository = new FakeOrphanagesRepository();
    confirmOrphanageService = new ConfirmOrphanageService(
      fakeOrphanagesRepository
    );
  });

  it('should confirm an orphanage', async () => {
    const result = await confirmOrphanageService.execute(1);
    expect(result).toBeUndefined();

    expect(spyFindOrphanageById).toHaveBeenCalled();
    expect(spyConfirmOrphanage).toHaveBeenCalled();
  });

  it('should return an error when not exists an orphanage with the id', async () => {
    spyFindOrphanageById.mockImplementationOnce(async () => {
      return null;
    });

    await expect(confirmOrphanageService.execute(1)).rejects.toEqual({
      message: 'Nenhum orfanato encontrado!',
      statusCode: 404,
    });

    expect(spyFindOrphanageById).toHaveBeenCalled();
    expect(spyConfirmOrphanage).not.toHaveBeenCalled();
  });
});
