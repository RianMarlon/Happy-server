import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ForgotPasswordService from '../../../services/forgot-password-service';

class ForgotPasswordController {
  async handleRequest(request: Request, response: Response): Promise<Response> {
    const { email } = request.body;

    const forgotPasswordService = container.resolve(ForgotPasswordService);
    await forgotPasswordService.execute({ email });

    return response.status(200).json();
  }
}

export default ForgotPasswordController;
