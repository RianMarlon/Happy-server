import { ErrorRequestHandler } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { ValidationError } from 'yup';

import removeImages from '../utils/removeImages';

const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  const requestImages = request.files as Express.Multer.File[];

  if (requestImages[0]) {   
    const images = requestImages.map((image) => {
      return {
        path: image.filename
      }
    });
  
    const filenames = images.map((image) => image.path);

    
    const destination = requestImages[0].destination;

    removeImages(destination, filenames);
  }

  else {
    return response.status(400).json({
      messagesError: ['Formato da imagem não é aceito!']
    });
  }

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
