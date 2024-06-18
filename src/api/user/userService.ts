import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { NewUser, PublicUser, User } from '@/api/user/userModel';
import { userRepository } from '@/api/user/userRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const userService = {
  findAll: async (): Promise<ServiceResponse<PublicUser[] | null>> => {
    try {
      const users = await userRepository.findAll();
      if (!users) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Users found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<PublicUser[]>(ResponseStatus.Success, 'Users found', users, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding all users: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: number): Promise<ServiceResponse<PublicUser | null>> => {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<PublicUser>(ResponseStatus.Success, 'User found', user, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error finding user with id ${id}: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  register: async (user: User): Promise<ServiceResponse<PublicUser | null>> => {
    try {
      const uniquenessCheck = await handleUniquenessChecks(user);
      if (!uniquenessCheck.success) {
        return uniquenessCheck;
      }

      const createdUser = await userRepository.create(user);
      return new ServiceResponse<PublicUser>(
        ResponseStatus.Success,
        'User created successfully',
        createdUser,
        StatusCodes.CREATED
      );
    } catch (error) {
      const errorMessage = `Error creating user: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  login: async (email: string, password: string): Promise<ServiceResponse<string | null>> => {
    try {
      const user = await userRepository.findByEmail(email);

      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return new ServiceResponse(ResponseStatus.Failed, 'Invalid credentials', null, StatusCodes.BAD_REQUEST);
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      return new ServiceResponse<string>(ResponseStatus.Success, 'Login successful', token, StatusCodes.OK);
    } catch (error) {
      const errorMessage = `Error logging in: ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const handleUniquenessChecks = async (user: NewUser, id?: number): Promise<ServiceResponse<null>> => {
  if (user.email) {
    const existingByEmail = await userRepository.findByEmail(user.email);
    if (existingByEmail && existingByEmail.id !== id) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        `A User with email ${user.email} already exists.`,
        null,
        StatusCodes.CONFLICT
      );
    }
  }

  return new ServiceResponse(ResponseStatus.Success, 'Uniqueness checks passed', null, StatusCodes.OK);
};
