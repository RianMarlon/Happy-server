import 'reflect-metadata';

import FakeFileStorageProvider from '../../../../shared/providers/file-storage/fakes/fake-file-storage-provider';
import FakeOrphanagesRepository from '../../domain/repositories/fakes/fake-orphanages-repository';
import CreateOrphanageService from '../create-orphanage-service';

const spySaveFileOrphanage = jest.spyOn(
  FakeFileStorageProvider.prototype,
  'save'
);
const spyFindOrphanageByLocation = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'findByLocation'
);
const spyCreateOrphanage = jest.spyOn(
  FakeOrphanagesRepository.prototype,
  'create'
);

describe('CreateOrphanageService Tests', () => {
  let createOrphanageService: CreateOrphanageService;

  beforeAll(async () => {
    const fakeOrphanagesRepository = new FakeOrphanagesRepository();
    const fakeFileStorageProvider = new FakeFileStorageProvider();

    createOrphanageService = new CreateOrphanageService(
      fakeOrphanagesRepository,
      fakeFileStorageProvider
    );
  });

  it('should create a new orphanage', async () => {
    const result = await createOrphanageService.execute({
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
    expect(spyFindOrphanageByLocation).toHaveBeenCalled();
    expect(spyCreateOrphanage).toHaveBeenCalled();
    expect(spySaveFileOrphanage).toHaveBeenCalledTimes(2);
  });

  it('should return an error when the open from is greater than open util', async () => {
    await expect(
      createOrphanageService.execute({
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

    expect(spyFindOrphanageByLocation).not.toHaveBeenCalled();
    expect(spyCreateOrphanage).not.toHaveBeenCalled();
    expect(spySaveFileOrphanage).not.toHaveBeenCalled();
  });

  it('should return an error when the difference between open from and open until is less than 30 minutes', async () => {
    await expect(
      createOrphanageService.execute({
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

    expect(spyFindOrphanageByLocation).not.toHaveBeenCalled();
    expect(spyCreateOrphanage).not.toHaveBeenCalled();
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
      createOrphanageService.execute({
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

    expect(spyFindOrphanageByLocation).toHaveBeenCalled();
    expect(spyCreateOrphanage).not.toHaveBeenCalled();
    expect(spySaveFileOrphanage).not.toHaveBeenCalled();
  });
});
