import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { describe, expect, it, Mock, vi } from 'vitest';

import { mockUser } from '@/api/mocks';
import { userRepository } from '@/api/user/userRepository';
import { userService } from '@/api/user/userService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

vi.mock('bcrypt');
vi.mock('jsonwebtoken');
vi.mock('@/api/user/userRepository');

describe('userService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ];
      (userRepository.findAll as Mock).mockResolvedValueOnce(users);

      const result = await userService.findAll();

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'Users found', users, StatusCodes.OK));
    });

    it('should return not found if no users found', async () => {
      (userRepository.findAll as Mock).mockResolvedValueOnce(null);

      const result = await userService.findAll();

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Failed, 'No Users found', null, StatusCodes.NOT_FOUND));
    });

    it('should handle errors during findAll', async () => {
      const errorMessage = 'Database connection error';
      (userRepository.findAll as Mock).mockRejectedValueOnce(new Error(errorMessage));

      const result = await userService.findAll();

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `Error finding all users: ${errorMessage}`,
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, name: 'User 1' };
      (userRepository.findById as Mock).mockResolvedValueOnce(user);

      const result = await userService.findById(1);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'User found', user, StatusCodes.OK));
    });

    it('should return not found if user is not found', async () => {
      (userRepository.findById as Mock).mockResolvedValueOnce(null);

      const result = await userService.findById(999);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND));
    });

    it('should handle errors during findById', async () => {
      const errorMessage = 'Database connection error';
      (userRepository.findById as Mock).mockRejectedValueOnce(new Error(errorMessage));

      const result = await userService.findById(1);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `Error finding user with id 1: ${errorMessage}`,
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      (userRepository.create as Mock).mockResolvedValueOnce(mockUser);

      const result = await userService.register(mockUser);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Success, 'User created successfully', mockUser, StatusCodes.CREATED)
      );
    });

    it('should handle uniqueness check errors during register', async () => {
      (userRepository.findByEmail as Mock).mockResolvedValueOnce({ ...mockUser, id: 2 });

      const result = await userService.register(mockUser);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `A User with email ${mockUser.email} already exists.`,
          null,
          StatusCodes.CONFLICT
        )
      );
    });

    it('should handle errors during register', async () => {
      const errorMessage = 'Database connection error';
      (userRepository.create as Mock).mockRejectedValueOnce(new Error(errorMessage));

      const result = await userService.register(mockUser);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `Error creating user: ${errorMessage}`,
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('login', () => {
    const email = 'user@example.com';
    const password = 'password';
    const user = {
      id: 1,
      name: 'User',
      email,
      password: '$2b$10$9yP/l/ZC.PVGDFR3cFv1jOpbp5C0IMz3FY/JYZ6VhTQLkvhlv3Z6W',
    };
    const newAccessToken = 'newAccessToken';
    const newRefreshToken = 'newRefreshToken';

    it('should log in a user', async () => {
      (userRepository.findByEmail as Mock).mockResolvedValueOnce(user);
      (bcrypt.compare as Mock).mockResolvedValueOnce(true);
      (jwt.sign as Mock).mockReturnValueOnce(newAccessToken);
      (jwt.sign as Mock).mockReturnValueOnce(newRefreshToken);

      const result = await userService.login(email, password);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Success,
          'Login successful',
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
          StatusCodes.OK
        )
      );
    });

    it('should return not found if user is not found during login', async () => {
      (userRepository.findByEmail as Mock).mockResolvedValueOnce(null);

      const result = await userService.login(email, password);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND));
    });

    it('should return invalid credentials if password does not match during login', async () => {
      (userRepository.findByEmail as Mock).mockResolvedValueOnce(user);
      (bcrypt.compare as Mock).mockResolvedValueOnce(false);

      const result = await userService.login(email, password);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid credentials', null, StatusCodes.BAD_REQUEST)
      );
    });

    it('should handle errors during login', async () => {
      const errorMessage = 'Database connection error';
      (userRepository.findByEmail as Mock).mockRejectedValueOnce(new Error(errorMessage));

      const result = await userService.login(email, password);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `Error logging in: ${errorMessage}`,
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('refresh', () => {
    it('should refresh a token', async () => {
      const refreshToken = 'refreshToken';
      const newAccessToken = 'newAccessToken';
      const newRefreshToken = 'newRefreshToken';

      const decodedToken = { user_id: 1 };
      (jwt.verify as Mock).mockReturnValueOnce(decodedToken);
      (userRepository.findRefreshToken as Mock).mockResolvedValueOnce({ token: refreshToken });
      (jwt.sign as Mock).mockReturnValueOnce(newAccessToken);
      (jwt.sign as Mock).mockReturnValueOnce(newRefreshToken);

      const result = await userService.refresh(refreshToken);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Success,
          'Token refreshed successfully',
          { accessToken: newAccessToken, refreshToken: newRefreshToken },
          StatusCodes.OK
        )
      );
    });

    it('should handle invalid refresh token', async () => {
      const refreshToken = 'invalidToken';

      (jwt.verify as Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = await userService.refresh(refreshToken);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Error refreshing token: Invalid token',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });

    it('should handle missing refresh token', async () => {
      const refreshToken = 'invalidToken';

      (jwt.verify as Mock).mockReturnValueOnce({ user_id: 1 });
      (userRepository.findRefreshToken as Mock).mockResolvedValueOnce(undefined);

      const result = await userService.refresh(refreshToken);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid refresh token', null, StatusCodes.UNAUTHORIZED)
      );
    });

    it('should handle not matching refresh token', async () => {
      const refreshToken = 'invalidToken';

      (jwt.verify as Mock).mockReturnValueOnce({ user_id: 1 });
      (userRepository.findRefreshToken as Mock).mockResolvedValueOnce({ token: 'notMatchingToken' });

      const result = await userService.refresh(refreshToken);

      expect(result).toEqual(
        new ServiceResponse(ResponseStatus.Failed, 'Invalid refresh token', null, StatusCodes.UNAUTHORIZED)
      );
    });

    it('should handle errors during token refresh', async () => {
      const refreshToken = 'refreshToken';
      const errorMessage = 'Database connection error';

      (jwt.verify as Mock).mockReturnValueOnce({ user_id: 1 });
      (userRepository.findRefreshToken as Mock).mockResolvedValueOnce({ token: refreshToken });
      (jwt.sign as Mock).mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      const result = await userService.refresh(refreshToken);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `Error refreshing token: ${errorMessage}`,
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      const refreshToken = 'refreshToken';
      const decodedToken = { user_id: 1 };

      (jwt.verify as Mock).mockReturnValueOnce(decodedToken);

      const result = await userService.logout(refreshToken);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'Logout successful', null, StatusCodes.OK));
    });

    it('should handle errors during logout', async () => {
      const refreshToken = 'refreshToken';
      const errorMessage = 'Database connection error';

      (jwt.verify as Mock).mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      const result = await userService.logout(refreshToken);

      expect(result).toEqual(
        new ServiceResponse(
          ResponseStatus.Failed,
          `Error logging out: ${errorMessage}`,
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
