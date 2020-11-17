import { ErrorRequestHandler } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { ValidationError } from 'yup';

const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if (error instanceof ValidationError) {
    const messagesError: string[] = [];

    error.errors.forEach((err) => {
      messagesError.push(err);
    });

    return response.status(400).json({
      messagesError,
    });
  }

  else if (error instanceof TokenExpiredError) {
    return response.status(401).json({
      messagesError: ['Token expirado'],
      is_valid_token: false,
    });
  }

  return response.status(500).json({
    messagesError: ['Erro no servidor!']
  });
}

export default errorHandler;
