import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default async function (
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({
      messagesError: ['Acesso não autorizado!'],
    });
  }

  const [scheme, token] = authHeader.split(' ');

  if (!token) {
    return response.status(401).json({
      messagesError: ['Acesso não autorizado!'],
    });
  }

  const payload = jwt.verify(
    token,
    process.env.AUTH_SECRET as string
  ) as JwtPayload;

  request.user = {
    id: payload.id as string,
  };

  return next();
}
