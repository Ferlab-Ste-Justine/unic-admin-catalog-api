import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface JwtRequest extends Request {
  token: string | JwtPayload;
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    (req as JwtRequest).token = jwt.verify(token, 'your_jwt_secret');
    next();
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};

export default verifyToken;
