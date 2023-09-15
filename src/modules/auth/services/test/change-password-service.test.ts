import 'reflect-metadata';

import FakeHashProvider from '../../../../shared/providers/hash/fakes/fake-hash-provider';
import FakeJwtProvider from '../../../../shared/providers/jwt/fakes/fake-jwt-provider';
import FakeUsersRepository from '../../../users/domain/repositories/fakes/fake-users-repository';

import ChangePasswordService from '../change-password-service';

const spyFindUserById = jest.spyOn(FakeUsersRepository.prototype, 'findById');
const spyUpdateUser = jest.spyOn(FakeUsersRepository.prototype, 'update');
const spyGenerateHash = jest.spyOn(FakeHashProvider.prototype, 'generate');
const spyVerifyTokenJwt = jest.spyOn(FakeJwtProvider.prototype, 'verify');

describe('ChangePasswordService Tests', () => {
  let changePasswordService: ChangePasswordService;
  const fakeUsersRepository = new FakeUsersRepository();
  const fakeHashProvider = new FakeHashProvider();
  const fakeJwtProvider = new FakeJwtProvider();

  beforeAll(async () => {
    changePasswordService = new ChangePasswordService(
      fakeUsersRepository,
      fakeHashProvider,
      fakeJwtProvider
    );
  });

  it('should update password', async () => {
    const result = await changePasswordService.execute({
      token: 'teste1234',
      password: 'T3stE232',
    });
    expect(result).toBeUndefined();
    expect(spyFindUserById).toHaveBeenCalled();
    expect(spyVerifyTokenJwt).toHaveBeenCalled();
    expect(spyGenerateHash).toHaveBeenCalled();
    expect(spyUpdateUser).toHaveBeenCalled();
  });

  it('should return an error when user not exists', async () => {
    spyFindUserById.mockImplementationOnce(async () => {
      return null;
    });
    await expect(
      changePasswordService.execute({
        token: 'teste1234',
        password: 'T3stE232',
      })
    ).rejects.toEqual({
      message: 'Usuário não encontrado!',
      statusCode: 400,
    });
    expect(spyFindUserById).toHaveBeenCalled();
    expect(spyVerifyTokenJwt).toHaveBeenCalled();
    expect(spyGenerateHash).not.toHaveBeenCalled();
    expect(spyUpdateUser).not.toHaveBeenCalled();
  });
});
