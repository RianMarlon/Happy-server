import 'reflect-metadata';

import FakeJwtProvider from '../../../../shared/providers/jwt/fakes/fake-jwt-provider';
import FakeMailProvider from '../../../../shared/providers/mail/fakes/fake-mail-provider';
import FakeUsersRepository from '../../../users/domain/repositories/fakes/fake-users-repository';

import ForgotPasswordService from '../forgot-password-service';

const spyFindUserByEmail = jest.spyOn(
  FakeUsersRepository.prototype,
  'findByEmail'
);
const spySingJwt = jest.spyOn(FakeJwtProvider.prototype, 'sign');
const spySendMail = jest.spyOn(FakeMailProvider.prototype, 'send');

describe('ForgotPasswordService Tests', () => {
  let forgotPasswordService: ForgotPasswordService;
  const fakeUsersRepository = new FakeUsersRepository();
  const fakeJwtProvider = new FakeJwtProvider();
  const fakeMailProvider = new FakeMailProvider();

  beforeAll(async () => {
    forgotPasswordService = new ForgotPasswordService(
      fakeUsersRepository,
      fakeMailProvider,
      fakeJwtProvider
    );
  });

  it('should send an email to forgot password', async () => {
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

    const result = await forgotPasswordService.execute({
      email: 'teste@teste.com',
    });
    expect(result).toBeUndefined();
    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spySingJwt).toHaveBeenCalled();
    expect(spySendMail).toHaveBeenCalled();
  });

  it('should return an error when user not exists with the email informed', async () => {
    spyFindUserByEmail.mockImplementationOnce(async () => {
      return undefined;
    });
    await expect(
      forgotPasswordService.execute({
        email: 'teste@teste.com',
      })
    ).rejects.toEqual({
      message: 'E-mail informado não está sendo usado por nenhum usuário!',
      statusCode: 400,
    });
    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spySingJwt).not.toHaveBeenCalled();
    expect(spySendMail).not.toHaveBeenCalled();
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
    await expect(
      forgotPasswordService.execute({
        email: 'teste@teste.com',
      })
    ).rejects.toEqual({
      message: 'Usuário não confirmou o e-mail!',
      statusCode: 400,
    });
    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spySingJwt).not.toHaveBeenCalled();
    expect(spySendMail).not.toHaveBeenCalled();
  });

  it('should return an error when not possible send the email', async () => {
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
    spySendMail.mockImplementationOnce(async () => {
      throw new Error();
    });

    await expect(
      forgotPasswordService.execute({
        email: 'teste@teste.com',
      })
    ).rejects.toEqual({
      message: 'Não foi possível enviar o e-mail!',
      statusCode: 500,
    });
    expect(spyFindUserByEmail).toHaveBeenCalled();
    expect(spySingJwt).toHaveBeenCalled();
    expect(spySendMail).toHaveBeenCalled();
  });
});
