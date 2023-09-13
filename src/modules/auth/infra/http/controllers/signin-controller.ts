import { Request, Response } from 'express';
import * as Yup from 'yup';
import { container } from 'tsyringe';

import SigninService from '../../../services/signin-service';

class SigninController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { email, password, remember_me } = request.body;

    const schema = Yup.object().shape({
      email: Yup.string()
        .required('E-mail não informado!')
        .email('E-mail inválido!'),
      password: Yup.string().required('Senha não informada!'),
    });

    const data = {
      email,
      password,
    };

    await schema.validate(data, {
      abortEarly: false,
    });

    const signinService = container.resolve(SigninService);
    const token = await signinService.execute({
      email,
      password,
      remember_me,
    });

    return response.status(201).json({
      token,
    });
  }
}

export default SigninController;
