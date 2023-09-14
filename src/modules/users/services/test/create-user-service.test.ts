import 'reflect-metadata';

import FakeHashProvider from '../../../../shared/providers/hash/fakes/fake-hash-provider';
import FakeJwtProvider from '../../../../shared/providers/jwt/fakes/fake-jwt-provider';
import FakeMailProvider from '../../../../shared/providers/mail/fakes/fake-mail-provider';
import FakeUsersRepository from '../../domain/repositories/fakes/fake-users-repository';
import CreateUserService from '../create-user-service';

const spyFindUserByEmail = jest.spyOn(
  FakeUsersRepository.prototype,
  'findByEmail'
);
const spyCreateUser = jest.spyOn(FakeUsersRepository.prototype, 'create');
const spyGenerateHash = jest.spyOn(FakeHashProvider.prototype, 'generate');
const spySendMail = jest.spyOn(FakeMailProvider.prototype, 'send');
const spyGenereTokenJwt = jest.spyOn(FakeJwtProvider.prototype, 'sign');

describe('CreateUserService Tests', () => {
  let createUserService: CreateUserService;
  const fakeUsersRepository = new FakeUsersRepository();
  const fakeHashProvider = new FakeHashProvider();
  const fakeMailProvider = new FakeMailProvider();
  const fakeJwtProvider = new FakeJwtProvider();

  beforeAll(async () => {
    createUserService = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider,
      fakeMailProvider,
      fakeJwtProvider
    );
  });

  it('should register a new user', async () => {
    const result = await createUserService.execute({
      first_name: 'Teste',
      last_name: 'Teste',
      email: 'teste@teste.com',
      password: 'teste1234',
    });
    expect(result).toBeUndefined();
    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spyCreateUser).toHaveBeenCalled();
    expect(spyGenerateHash).toHaveBeenCalled();
    expect(spySendMail).toHaveBeenCalled();
    expect(spyGenereTokenJwt).toHaveBeenCalled();
  });

  it('should return an error when already exists an user with the email', async () => {
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
    await expect(
      createUserService.execute({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
      })
    ).rejects.toEqual({
      message: 'E-mail informado já foi cadastrado!',
      statusCode: 400,
    });
    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spyCreateUser).not.toHaveBeenCalled();
    expect(spyGenerateHash).not.toHaveBeenCalled();
    expect(spySendMail).not.toHaveBeenCalled();
    expect(spyGenereTokenJwt).not.toHaveBeenCalled();
  });

  it('should return an error when not possible send the email', async () => {
    spySendMail.mockImplementationOnce(() => {
      throw new Error();
    });
    await expect(
      createUserService.execute({
        first_name: 'Teste',
        last_name: 'Teste',
        email: 'teste@teste.com',
        password: 'teste1234',
      })
    ).rejects.toEqual({
      message: 'Não foi possível enviar o e-mail!',
      statusCode: 500,
    });
    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spyCreateUser).toHaveBeenCalled();
    expect(spyGenerateHash).toHaveBeenCalled();
    expect(spySendMail).toHaveBeenCalled();
    expect(spyGenereTokenJwt).toHaveBeenCalled();
  });
});
