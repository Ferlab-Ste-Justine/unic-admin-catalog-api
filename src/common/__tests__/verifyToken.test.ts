import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import verifyToken from '@/common/middleware/verifyToken';

vi.mock('jsonwebtoken');

const app = express();
app.use(express.json());

const protectedRoute = (req: Request, res: Response) => {
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

  it('should return 401 if no authorization header is present', async () => {
    const response = await request(app).get('/protected');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.text).toBe('Access denied. No token provided.');
  });

  it('should return 401 if authorization header is present but no token provided', async () => {
    const response = await request(app).get('/protected').set('Authorization', 'Bearer ');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.text).toBe('Access denied. No token provided.');
  });

  it('should return 400 if the token is invalid', async () => {
    (jwt.verify as Mock).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app).get('/protected').set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.text).toBe('Invalid token.');
  });

  it('should call next if the token is valid', async () => {
    (jwt.verify as Mock).mockReturnValueOnce({ id: 1 });

    const response = await request(app).get('/protected').set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.text).toBe('Protected route accessed');
  });
});
