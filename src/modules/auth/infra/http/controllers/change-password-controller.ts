import { Request, Response } from 'express';
import * as Yup from 'yup';
import { container } from 'tsyringe';

import ChangePasswordService from '../../../services/change-password-service';

class ChangePasswordController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { token, password, confirm_password } = request.body;

    const data = {
      password,
      confirm_password,
    };

    const schema = Yup.object().shape({
      password: Yup.string()
        .required('Senha não informada!')
        .min(6, 'Senha deve conter, no mínimo, 6 caracteres'),
      confirm_password: Yup.string()
        .required('Senha de confirmação não informada!')
        .equals([password], 'Senhas não conferem'),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const changePasswordService = container.resolve(ChangePasswordService);
    await changePasswordService.execute({
      token,
      password,
    });

    return response.status(204).json({
      token,
    });
  }
}

export default ChangePasswordController;
