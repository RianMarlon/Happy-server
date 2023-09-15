import 'reflect-metadata';

import FakeJwtProvider from '../../../../shared/providers/jwt/fakes/fake-jwt-provider';
import FakeUsersRepository from '../../../users/domain/repositories/fakes/fake-users-repository';

import ConfirmEmailService from '../confirm-email-service';

const spyFindUserById = jest.spyOn(FakeUsersRepository.prototype, 'findById');
const spyUpdateUser = jest.spyOn(FakeUsersRepository.prototype, 'update');
const spyVerifyTokenJwt = jest.spyOn(FakeJwtProvider.prototype, 'verify');

describe('ConfirmEmailService Tests', () => {
  let confirmEmailService: ConfirmEmailService;
  const fakeUsersRepository = new FakeUsersRepository();
  const fakeJwtProvider = new FakeJwtProvider();

  beforeAll(async () => {
    confirmEmailService = new ConfirmEmailService(
      fakeUsersRepository,
      fakeJwtProvider
    );
  });

  it('should confirm an email', async () => {
    spyFindUserById.mockImplementationOnce(async () => {
      return {
        id: 1,
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        verified_email: false,
        admin: true,
      };
    });

    const result = await confirmEmailService.execute({
      token: 'teste1234',
    });
    expect(result).toBeUndefined();
    expect(spyVerifyTokenJwt).toHaveBeenCalled();
    expect(spyFindUserById).toHaveBeenCalled();
    expect(spyUpdateUser).toHaveBeenCalled();
  });

  it('should return an error when user not exists', async () => {
    spyFindUserById.mockImplementationOnce(async () => {
      return null;
    });
    await expect(
      confirmEmailService.execute({
        token: 'teste1234',
      })
    ).rejects.toEqual({
      message: 'Usuário não encontrado!',
      statusCode: 400,
    });
    expect(spyFindUserById).toHaveBeenCalled();
    expect(spyVerifyTokenJwt).toHaveBeenCalled();
    expect(spyUpdateUser).not.toHaveBeenCalled();
  });

  it('should return an error when user already confirm the email', async () => {
    await expect(
      confirmEmailService.execute({
        token: 'teste1234',
      })
    ).rejects.toEqual({
      message: 'Usuário já confirmou o e-mail!',
      statusCode: 400,
    });
    expect(spyFindUserById).toHaveBeenCalled();
    expect(spyVerifyTokenJwt).toHaveBeenCalled();
    expect(spyUpdateUser).not.toHaveBeenCalled();
  });
});
