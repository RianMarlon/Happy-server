import { ErrorRequestHandler } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { ValidationError } from 'yup';
import removeImages from '../../utils/removeImages';
import AppError from './app-error';

const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  const requestImages = request.files as Express.Multer.File[];

  if (requestImages) {
    const images = requestImages.map((image) => {
      return {
        path: image.filename,
      };
    });

    const filenames = images.map((image) => image.path);

    if (requestImages[0]) {
      const destination = (requestImages[0] as any).destination;
      removeImages(destination, filenames);
    }
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      messagesError: [error.message],
    });
  } else if (error instanceof ValidationError) {
    const messagesError: string[] = [];

    error.errors.forEach((err) => {
      messagesError.push(err);
    });

    return response.status(400).json({
      messagesError,
    });
  } else if (error instanceof TokenExpiredError) {
    return response.status(401).json({
      messagesError: ['Token expirado'],
      is_valid_token: false,
    });
  }

  return response.status(500).json({
    messagesError: ['Erro no servidor!'],
  });
};

export default errorHandler;
