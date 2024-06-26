import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import verifyToken from '@/common/middleware/verifyToken';

vi.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cookieParser());

const protectedRoute = (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).send('Protected route accessed');
};

app.get('/protected', verifyToken, protectedRoute);

describe('verifyToken middleware', () => {
  const JWT_SECRET = 'test_secret';
  let originalJwtSecret: string | undefined;

  beforeEach(() => {
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = JWT_SECRET;
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    vi.clearAllMocks();
  });

  it('should return 401 if no accessToken cookie is present', async () => {
    const response = await request(app).get('/protected');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('Access denied. No token provided.');
  });

  it('should return 401 if accessToken cookie is present but no token provided', async () => {
    const response = await request(app).get('/protected').set('Cookie', ['accessToken=']);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('Access denied. No token provided.');
  });

  it('should return 401 if the token is invalid', async () => {
    (jwt.verify as Mock).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app).get('/protected').set('Cookie', ['accessToken=invalid_token']);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('Error verifying token: Invalid token');
  });

  it('should call next if the token is valid', async () => {
    const mockToken = jwt.sign({ user_id: 1 }, JWT_SECRET);
    (jwt.verify as Mock).mockReturnValueOnce({ user_id: 1 });

    const response = await request(app).get('/protected').set('Cookie', `accessToken=${mockToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.text).toBe('Protected route accessed');
  });
});
