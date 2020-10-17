import { ErrorRequestHandler } from 'express';
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

  return response.status(500).json({
    messagesError: ['Erro no servidor!']
  });
}

export default errorHandler;
