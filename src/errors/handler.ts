import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  console.log(error);

  return response.status(500).json({
    messageError: 'Erro no servidor!'
  });
}

export default errorHandler;
