import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { describe, expect, it, Mock, vi } from 'vitest';

import { mockUser } from '@/api/mocks';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

import { userRepository } from '../userRepository';
import { userService } from '../userService';

vi.mock('bcrypt');
vi.mock('jsonwebtoken');
vi.mock('../userRepository');

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
    const token = 'token';

    it('should log in a user', async () => {
      (userRepository.findByEmail as Mock).mockResolvedValueOnce(user);
      (bcrypt.compare as Mock).mockResolvedValueOnce(true);
      (jwt.sign as Mock).mockReturnValueOnce(token);

      const result = await userService.login(email, password);

      expect(result).toEqual(new ServiceResponse(ResponseStatus.Success, 'Login successful', token, StatusCodes.OK));
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
});
