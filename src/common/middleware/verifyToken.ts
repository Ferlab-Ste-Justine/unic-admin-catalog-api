import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface JwtRequest extends Request {
  token: string | JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(StatusCodes.UNAUTHORIZED).send('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).send('Access denied. No token provided.');
  }

  try {
    (req as JwtRequest).token = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send('Invalid token.');
  }
};

export default verifyToken;
