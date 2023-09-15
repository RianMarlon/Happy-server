import 'reflect-metadata';

import FakeFileStorageProvider from '../../../../shared/providers/file-storage/fakes/fake-file-storage-provider';
import FakeImagesRepository from '../../../images/domain/repositories/fakes/fake-images-repository';
import FakeOrphanagesRepository from '../../domain/repositories/fakes/fake-orphanages-repository';
import CreateImagesService from '../../../images/services/create-images-service';
import DeleteImagesByOrphanageService from '../../../images/services/delete-images-by-orphanage-service';
import UpdateOrphanageService from '../update-orphanage-service';

const spySaveFileOrphanage = jest.spyOn(
  FakeFileStorageProvider.prototype,
  'save'
);
const spySaveDeleteOrphanage = jest.spyOn(
  FakeFileStorageProvider.prototype,
  'delete'
);
const spyFindOrphanageById = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'findById'
);
const spyFindOrphanageByLocation = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'findByLocation'
);
const spyUpdateOrphanage = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'update'
);

describe('UpdateOrphanageService Tests', () => {
  let updateOrphanageService: UpdateOrphanageService;

  beforeAll(async () => {
    const fakeOrphanagesRepository = new FakeOrphanagesRepository();
    const fakeImagesRepository = new FakeImagesRepository();

    const fakeFileStorageProvider = new FakeFileStorageProvider();

    const createImageService = new CreateImagesService(fakeImagesRepository);
    const deleteImageService = new DeleteImagesByOrphanageService(
      fakeImagesRepository
    );

    updateOrphanageService = new UpdateOrphanageService(
      fakeOrphanagesRepository,
      createImageService,
      deleteImageService,
      fakeFileStorageProvider
    );
  });

  it('should update a new orphanage', async () => {
    const result = await updateOrphanageService.execute(1, {
      name: 'Teste',
      latitude: -22.9406434,
      longitude: 46.5300517,
      about: 'Teste',
      whatsapp: '99999999999',
      instructions: 'Teste',
      open_from: '14:00',
      open_until: '18:20',
      open_on_weekends: false,
      images: [{ path: 'teste.png' }, { path: 'teste2.png' }],
    });
    expect(result).toBeUndefined();
    expect(spyFindOrphanageById).toHaveBeenCalled();
    expect(spyFindOrphanageByLocation).toHaveBeenCalled();
    expect(spyUpdateOrphanage).toHaveBeenCalled();
    expect(spySaveDeleteOrphanage).toHaveBeenCalledTimes(1);
    expect(spySaveFileOrphanage).toHaveBeenCalledTimes(2);
  });

  it('should return an error when the open from is greater than open util', async () => {
    await expect(
      updateOrphanageService.execute(1, {
        name: 'Teste',
        latitude: -22.9406434,
        longitude: 46.5300517,
        about: 'Teste',
        whatsapp: '99999999999',
        instructions: 'Teste',
        open_from: '17:00',
        open_until: '14:00',
        open_on_weekends: false,
        images: [{ path: 'teste.png' }],
      })
    ).rejects.toEqual({
      message: 'Horário de abertura após o horário de fechamento!',
      statusCode: 400,
    });

    expect(spyFindOrphanageById).not.toHaveBeenCalled();
    expect(spyFindOrphanageByLocation).not.toHaveBeenCalled();
    expect(spyUpdateOrphanage).not.toHaveBeenCalled();
    expect(spySaveFileOrphanage).not.toHaveBeenCalled();
  });

  it('should return an error when the difference between open from and open until is less than 30 minutes', async () => {
    await expect(
      updateOrphanageService.execute(1, {
        name: 'Teste',
        latitude: -22.9406434,
        longitude: 46.5300517,
        about: 'Teste',
        whatsapp: '99999999999',
        instructions: 'Teste',
        open_from: '17:00',
        open_until: '17:20',
        open_on_weekends: false,
        images: [{ path: 'teste.png' }],
      })
    ).rejects.toEqual({
      message:
        'Necessário, no mínimo, disponibilidade de 30 minutos para visitas!',
      statusCode: 400,
    });

    expect(spyFindOrphanageById).not.toHaveBeenCalled();
    expect(spyFindOrphanageByLocation).not.toHaveBeenCalled();
    expect(spyUpdateOrphanage).not.toHaveBeenCalled();
    expect(spySaveFileOrphanage).not.toHaveBeenCalled();
  });

  it('should return an error when not exists an orphanage with the id', async () => {
    spyFindOrphanageById.mockImplementationOnce(async () => {
      return null;
    });

    await expect(
      updateOrphanageService.execute(1, {
        name: 'Teste',
        latitude: -22.9406434,
        longitude: 46.5300517,
        about: 'Teste',
        whatsapp: '99999999999',
        instructions: 'Teste',
        open_from: '14:00',
        open_until: '17:20',
        open_on_weekends: false,
        images: [{ path: 'teste.png' }],
      })
    ).rejects.toEqual({
      message: 'Nenhum orfanato encontrado!',
      statusCode: 404,
    });

    expect(spyFindOrphanageById).toHaveBeenCalled();
    expect(spyFindOrphanageByLocation).not.toHaveBeenCalled();
    expect(spyUpdateOrphanage).not.toHaveBeenCalled();
    expect(spySaveFileOrphanage).not.toHaveBeenCalled();
  });

  it('should return an error when exists an orphanage on the location informed', async () => {
    spyFindOrphanageByLocation.mockImplementationOnce(async () => {
      return {
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
        images: [],
      };
    });

    await expect(
      updateOrphanageService.execute(1, {
        name: 'Teste',
        latitude: -22.9406434,
        longitude: 46.5300517,
        about: 'Teste',
        whatsapp: '99999999999',
        instructions: 'Teste',
        open_from: '14:00',
        open_until: '17:20',
        open_on_weekends: false,
        images: [{ path: 'teste.png' }],
      })
    ).rejects.toEqual({
      message: 'Existe um orfanato nessa localização!',
      statusCode: 400,
    });

    expect(spyFindOrphanageById).toHaveBeenCalled();
    expect(spyFindOrphanageByLocation).toHaveBeenCalled();
    expect(spyUpdateOrphanage).not.toHaveBeenCalled();
    expect(spySaveFileOrphanage).not.toHaveBeenCalled();
  });
});
