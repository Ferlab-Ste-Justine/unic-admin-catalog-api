import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { JWT_SECRET } from '@/constants';
import { JwtRequest, TokenPayload } from '@/types';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies['accessToken'];

  if (!accessToken) {
    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Failed, 'Access denied. No token provided.', null, StatusCodes.UNAUTHORIZED),
      res
    );
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as TokenPayload;
    (req as JwtRequest).user_id = decoded.user_id;
    next();
  } catch (error) {
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Failed,
        `Error verifying token: ${(error as Error).message}`,
        null,
        StatusCodes.UNAUTHORIZED
      ),
      res
    );
  }
};

export default verifyToken;
