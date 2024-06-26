import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock, vi } from 'vitest';

import { invalidMockUser, mockUser } from '@/api/mocks';
import { User } from '@/api/user/userModel';
import { userService } from '@/api/user/userService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('@/api/user/userService');

vi.mock('@/common/middleware/verifyToken', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('User API endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return a list of users', async () => {
      const users: User[] = [mockUser];

      (userService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Users found', users, StatusCodes.OK)
      );

      const response = await request(app).get('/users');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(users);
    });

    it('should return empty array when no users found', async () => {
      (userService.findAll as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'No users found', [], StatusCodes.OK)
      );

      const response = await request(app).get('/users');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual([]);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user by id', async () => {
      (userService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'User found', mockUser, StatusCodes.OK)
      );

      const response = await request(app).get('/users/1');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockUser);
    });

    it('should return 404 for a non-existent user by id', async () => {
      (userService.findById as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND)
      );

      const response = await request(app).get('/users/999');

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      (userService.register as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'User registered', mockUser, StatusCodes.OK)
      );

      const response = await request(app).post('/users/register').send(mockUser);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(mockUser);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/users/register').send({});

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });

    it('should return error for invalid data types', async () => {
      const response = await request(app).post('/users/register').send(invalidMockUser);

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /users/login', () => {
    const loginCredentials = { email: 'user@example.com', password: 'password' };
    const loginResponse = { token: 'token' };

    it('should log in a user', async () => {
      (userService.login as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Login successful', loginResponse, StatusCodes.OK)
      );

      const response = await request(app).post('/users/login').send(loginCredentials);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(null);
    });

    it('should return error for invalid credentials', async () => {
      (userService.login as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid credentials', null, StatusCodes.UNAUTHORIZED)
      );

      const response = await request(app).post('/users/login').send(loginCredentials);

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /users/refresh', () => {
    it('should refresh access token', async () => {
      const refreshResponse = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      (userService.refresh as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Success, 'Token refreshed', refreshResponse, StatusCodes.OK)
      );

      const response = await request(app)
        .post('/users/refresh')
        .set('Cookie', ['refreshToken=validRefreshToken'])
        .send();

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
      expect(response.body.responseObject).toEqual(null);
    });

    it('should return error for invalid refresh token', async () => {
      (userService.refresh as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid refresh token', null, StatusCodes.UNAUTHORIZED)
      );

      const response = await request(app).post('/users/refresh').send();

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBeFalsy();
    });
    it('should return error if refresh failed', async () => {
      (userService.refresh as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Error refreshing token', null, StatusCodes.INTERNAL_SERVER_ERROR)
      );

      const response = await request(app)
        .post('/users/refresh')
        .set('Cookie', ['refreshToken=validRefreshToken'])
        .send();

      expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toBe('Error refreshing token');
    });
  });

  describe('POST /users/logout', () => {
    it('should log out a user', async () => {
      const logoutResponse = new ServiceResponse(
        ResponseStatus.Success,
        'User logged out successfully',
        null,
        StatusCodes.OK
      );

      (userService.logout as Mock).mockResolvedValue(logoutResponse);

      const response = await request(app)
        .post('/users/logout')
        .set('Cookie', ['refreshToken=validRefreshToken'])
        .send();

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.success).toBeTruthy();
    });

    it('should return error for invalid refresh token on logout', async () => {
      (userService.logout as Mock).mockResolvedValue(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid refresh token', null, StatusCodes.UNAUTHORIZED)
      );

      const response = await request(app).post('/users/logout').send();

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBeFalsy();
    });
  });
});
