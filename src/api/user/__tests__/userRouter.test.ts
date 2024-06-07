import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Mock } from 'vitest';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { User } from '../userModel';
import { userRepository } from '../userRepository';

// Mocking userRepository methods
vi.mock('../userRepository');
vi.mock('pg', () => {
  const mClient = {
    connect: vi.fn(),
    query: vi.fn(),
    end: vi.fn(),
  };
  const mPool = {
    connect: vi.fn(() => Promise.resolve(mClient)),
    query: vi.fn(() => Promise.resolve()),
    end: vi.fn(),
  };
  return { Pool: vi.fn(() => mPool) }; // Exporting Pool
});

const users = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'mypassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    password: 'mypassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe.skip('User API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const compareUsers = (expectedUser: User, actualUser: User) => {
    expect(actualUser.id).toEqual(expectedUser.id);
    expect(actualUser.name).toEqual(expectedUser.name);
    expect(actualUser.email).toEqual(expectedUser.email);
    expect(new Date(actualUser.createdAt!)).toEqual(new Date(expectedUser.createdAt!));
    expect(new Date(actualUser.updatedAt!)).toEqual(new Date(expectedUser.updatedAt!));
  };

  describe('GET /users', () => {
    it('should return a list of users', async () => {
      // Mocking findAllUsers
      (userRepository.findAllUsers as Mock).mockResolvedValue(users);

      // Act
      const response = await request(app).get('/users');

      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Success');
      expect(responseBody.responseObject.length).toEqual(users.length);
      responseBody.responseObject.forEach((user, index) => compareUsers(users[index], user));
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user for a valid ID', async () => {
      // Arrange
      const testId = 1;
      const expectedUser = users.find((user) => user.id === testId);

      // Mocking findUserById
      (userRepository.findUserById as Mock).mockResolvedValue(expectedUser);

      // Act
      const response = await request(app).get(`/users/${testId}`);
      const responseBody: ServiceResponse<User> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Success');
      expect(responseBody.responseObject).toEqual(expectedUser);
    });

    it('should return a not found error for non-existent ID', async () => {
      // Arrange
      const testId = Number.MAX_SAFE_INTEGER;

      // Mocking findUserById for non-existent ID
      (userRepository.findUserById as Mock).mockResolvedValue(null);

      // Act
      const response = await request(app).get(`/users/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('User not found');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for invalid ID format', async () => {
      // Act
      const invalidInput = 'abc';
      const response = await request(app).get(`/users/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      // Arrange
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword',
      };

      // Mocking createUser
      (userRepository.createUser as Mock).mockResolvedValue({ ...newUser, id: 1 });

      // Act
      const response = await request(app).post('/users/register').send(newUser);
      const responseBody: ServiceResponse<User> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Success');
      expect(responseBody.responseObject).toHaveProperty('id');
      expect(responseBody.responseObject.name).toEqual(newUser.name);
      expect(responseBody.responseObject.email).toEqual(newUser.email);
    });

    it('should return a bad request for invalid registration data', async () => {
      // Arrange
      const invalidUser = {
        name: 'Test User',
        email: 'invalidemail', // Invalid email format
        password: 'testpassword',
      };

      // Act
      const response = await request(app).post('/users/register').send(invalidUser);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Error registering user');
    });
  });

  describe('POST /users/login', () => {
    it('should login a user with valid credentials', async () => {
      // Arrange
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('testpassword', 10),
      };

      // Mocking findUserByEmail
      (userRepository.findUserByEmail as Mock).mockResolvedValue(user);

      // Act
      const response = await request(app).post('/users/login').send({
        email: user.email,
        password: 'testpassword',
      });
      const responseBody: ServiceResponse<{ token: string }> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Success');
      expect(responseBody.responseObject).toHaveProperty('token');
    });

    it('should return bad request for invalid login credentials', async () => {
      // Arrange
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('testpassword', 10),
      };

      // Mocking findUserByEmail for non-existent user
      (userRepository.findUserByEmail as Mock).mockResolvedValue(null);

      // Act
      const response = await request(app).post('/users/login').send({
        email: user.email,
        password: 'wrongpassword',
      });
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid credentials');
    });
  });
});
