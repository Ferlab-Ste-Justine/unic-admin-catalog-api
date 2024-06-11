import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { PublicUser, User } from '@/api/user/userModel';
import { userRepository } from '@/api/user/userRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

const JWT_SECRET = process.env.JWT_SECRET as string; // Consider moving this to a config file

export const userService = {
  findAll: async (): Promise<ServiceResponse<PublicUser[] | null>> => {
    try {
      const users = await userRepository.findAllUsers();
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
      const user = await userRepository.findUserById(id);
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

  register: async (body: User): Promise<ServiceResponse<PublicUser | null>> => {
    try {
      const user = await userRepository.createUser(body);
      return new ServiceResponse<PublicUser>(
        ResponseStatus.Success,
        'User created successfully',
        user,
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
      const user = await userRepository.findUserByEmail(email);

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
