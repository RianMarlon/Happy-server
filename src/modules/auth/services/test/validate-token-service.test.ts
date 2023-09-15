import 'reflect-metadata';

import FakeJwtProvider from '../../../../shared/providers/jwt/fakes/fake-jwt-provider';
import FakeUsersRepository from '../../../users/domain/repositories/fakes/fake-users-repository';

import ValidateTokenService from '../validate-token-service';

const spyFindUserById = jest.spyOn(FakeUsersRepository.prototype, 'findById');
const spyVerifyTokenJwt = jest.spyOn(FakeJwtProvider.prototype, 'verify');

describe('ValidateTokenService Tests', () => {
  let validateTokenService: ValidateTokenService;
  const fakeUsersRepository = new FakeUsersRepository();
  const fakeJwtProvider = new FakeJwtProvider();

  beforeAll(async () => {
    validateTokenService = new ValidateTokenService(
      fakeUsersRepository,
      fakeJwtProvider
    );
  });

  it('should return success', async () => {
    spyFindUserById.mockImplementationOnce(async () => {
      return {
        id: 1,
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        verified_email: true,
        admin: true,
      };
    });

    const result = await validateTokenService.execute({
      token: 'teste1234',
    });
    expect(result).toEqual({
      is_admin: true,
    });
    expect(spyVerifyTokenJwt).toHaveBeenCalled();
    expect(spyFindUserById).toHaveBeenCalled();
  });

  it('should return an error when the token is an empty string', async () => {
    await expect(
      validateTokenService.execute({
        token: '',
      })
    ).rejects.toEqual({
      message: 'Token não informado!',
      statusCode: 400,
    });
    expect(spyFindUserById).not.toHaveBeenCalled();
    expect(spyVerifyTokenJwt).not.toHaveBeenCalled();
  });

  it('should return an error when user not exists', async () => {
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
    await expect(
      validateTokenService.execute({
        token: 'teste1234',
      })
    ).rejects.toEqual({
      message: 'Usuário não encontrado!',
      statusCode: 400,
    });
    expect(spyFindUserById).toHaveBeenCalled();
    expect(spyVerifyTokenJwt).toHaveBeenCalled();
  });

  it('should return an error when user already confirm the email', async () => {
    spyFindUserById.mockImplementationOnce(async () => {
      return null;
    });
    await expect(
      validateTokenService.execute({
        token: 'teste1234',
      })
    ).rejects.toEqual({
      message: 'Usuário não encontrado!',
      statusCode: 400,
    });
    expect(spyFindUserById).toHaveBeenCalled();
    expect(spyVerifyTokenJwt).toHaveBeenCalled();
  });
});
