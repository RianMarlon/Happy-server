import 'reflect-metadata';

import FakeOrphanagesRepository from '../../domain/repositories/fakes/fake-orphanages-repository';
import FakeFileStorageProvider from '../../../../shared/providers/file-storage/fakes/fake-file-storage-provider';
import DeleteOrphanageService from '../delete-orphanage-service';

const spyFindOrphanageById = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'findById'
);
const spyDeleteOrphanage = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'delete'
);
const spyDeleteFile = jest.spyOn(FakeFileStorageProvider.prototype, 'delete');

describe('DeleteOrphanageService Tests', () => {
  let deleteOrphanageService: DeleteOrphanageService;

  beforeAll(async () => {
    const fakeOrphanagesRepository = new FakeOrphanagesRepository();
    const fakeFileStorageProvider = new FakeFileStorageProvider();

    deleteOrphanageService = new DeleteOrphanageService(
      fakeOrphanagesRepository,
      fakeFileStorageProvider
    );
  });

  it('should delete an orphanage', async () => {
    const result = await deleteOrphanageService.execute(1);
    expect(result).toBeUndefined();

    expect(spyFindOrphanageById).toHaveBeenCalled();
    expect(spyDeleteOrphanage).toHaveBeenCalled();
    expect(spyDeleteFile).toHaveBeenCalled();
  });

  it('should return an error when not exists an orphanage with the id', async () => {
    spyFindOrphanageById.mockImplementationOnce(async () => {
      return undefined;
    });

    await expect(deleteOrphanageService.execute(1)).rejects.toEqual({
      message: 'Nenhum orfanato encontrado!',
      statusCode: 404,
    });

    expect(spyFindOrphanageById).toHaveBeenCalled();
    expect(spyDeleteOrphanage).not.toHaveBeenCalled();
    expect(spyDeleteFile).not.toHaveBeenCalled();
  });
});
