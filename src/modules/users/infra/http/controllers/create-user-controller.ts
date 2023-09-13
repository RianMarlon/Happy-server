import { Request, Response } from 'express';
import * as Yup from 'yup';
import { container } from 'tsyringe';

import CreateUserService from '../../../services/create-user-service';

class CreateUserController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { first_name, last_name, email, password, confirm_password } =
      request.body;

    const data = {
      first_name,
      last_name,
      email,
      password,
      confirm_password,
    };

    const schema = Yup.object().shape({
      first_name: Yup.string().required('Nome não informado!'),
      last_name: Yup.string().required('Sobrenome não informado!'),
      email: Yup.string()
        .required('E-mail não informado!')
        .email('E-mail inválido!'),
      password: Yup.string()
        .required('Senha não informada!')
        .min(6, 'Senha deve conter, no mínimo, 6 caracteres'),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const schemaConfirmPassword = Yup.object().shape({
      confirm_password: Yup.string()
        .required('Senha de confirmação não informada!')
        .equals([password], 'Senhas não conferem!'),
    });

    await schemaConfirmPassword.validate(data, {
      abortEarly: false,
    });

    const createUserService = container.resolve(CreateUserService);
    await createUserService.execute(data);

    return response.status(201).json();
  }
}

export default CreateUserController;
