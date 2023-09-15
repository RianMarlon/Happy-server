import 'reflect-metadata';

import FakeHashProvider from '../../../../shared/providers/hash/fakes/fake-hash-provider';
import FakeJwtProvider from '../../../../shared/providers/jwt/fakes/fake-jwt-provider';
import FakeUsersRepository from '../../../users/domain/repositories/fakes/fake-users-repository';

import SigninService from '../signin-service';

const spyFindUserByEmail = jest.spyOn(
  FakeUsersRepository.prototype,
  'findByEmail'
);
const spyCompareHash = jest.spyOn(FakeHashProvider.prototype, 'compare');
const spySignJwt = jest.spyOn(FakeJwtProvider.prototype, 'sign');

describe('SigninService Tests', () => {
  let signinService: SigninService;
  const fakeUsersRepository = new FakeUsersRepository();
  const fakeHashProvider = new FakeHashProvider();
  const fakeJwtProvider = new FakeJwtProvider();

  beforeAll(async () => {
    signinService = new SigninService(
      fakeUsersRepository,
      fakeHashProvider,
      fakeJwtProvider
    );
  });

  it('should return a token access', async () => {
    spyFindUserByEmail.mockImplementationOnce(async () => {
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
    spyCompareHash.mockImplementationOnce(async () => true);
    spySignJwt.mockImplementationOnce(() => 'teste');

    const token = await signinService.execute({
      email: 'teste@teste.com',
      password: 'T3stE232',
      remember_me: false,
    });

    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spyCompareHash).toHaveBeenCalled();
    expect(spySignJwt).toHaveBeenCalled();
    expect(token).toEqual('teste');
  });

  it('should return an error when not exists an user with the email informed', async () => {
    spyFindUserByEmail.mockImplementationOnce(async () => {
      return null;
    });

    await expect(
      signinService.execute({
        email: 'teste@teste.com',
        password: 'T3stE232',
        remember_me: false,
      })
    ).rejects.toEqual({
      message: 'E-mail ou senha inválido!',
      statusCode: 400,
    });

    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spyCompareHash).not.toHaveBeenCalled();
    expect(spySignJwt).not.toHaveBeenCalled();
  });

  it('should return an error when the password informed not match with the hash', async () => {
    spyFindUserByEmail.mockImplementationOnce(async () => {
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
    spyCompareHash.mockImplementationOnce(async () => false);

    await expect(
      signinService.execute({
        email: 'teste@teste.com',
        password: 'T3stE232',
        remember_me: false,
      })
    ).rejects.toEqual({
      message: 'E-mail ou senha inválido!',
      statusCode: 400,
    });

    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spyCompareHash).toHaveBeenCalled();
    expect(spySignJwt).not.toHaveBeenCalled();
  });

  it('should return an error when user already confirm the email', async () => {
    spyFindUserByEmail.mockImplementationOnce(async () => {
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
    spyCompareHash.mockImplementationOnce(async () => true);

    await expect(
      signinService.execute({
        email: 'teste@teste.com',
        password: 'T3stE232',
        remember_me: false,
      })
    ).rejects.toEqual({
      message: 'Usuário não confirmou o e-mail!',
      statusCode: 400,
    });

    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spyCompareHash).toHaveBeenCalled();
    expect(spySignJwt).not.toHaveBeenCalled();
  });
});
