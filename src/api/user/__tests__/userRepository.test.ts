import bcrypt from 'bcrypt';
import { Mock } from 'vitest';

import { db } from '@/db';

import { NewUser, PublicUser, User } from '../userModel';
import { userRepository } from '../userRepository';

vi.mock('@/db');
vi.mock('bcrypt');

describe('userRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const newUser: NewUser = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword123';
      const createdUser: PublicUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (bcrypt.hash as Mock).mockResolvedValueOnce(hashedPassword);
      (db.insertInto as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockReturnValueOnce({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValueOnce(createdUser),
          }),
        }),
      });

      const result = await userRepository.create(newUser);

      expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const user: PublicUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(user),
          }),
        }),
      });

      const result = await userRepository.findById(1);

      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await userRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(user),
          }),
        }),
      });

      const result = await userRepository.findByEmail('john@example.com');

      expect(result).toEqual(user);
    });

    it('should return null if user not found by email', async () => {
      (db.selectFrom as Mock).mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          selectAll: vi.fn().mockReturnValueOnce({
            executeTakeFirst: vi.fn().mockResolvedValueOnce(null),
          }),
        }),
      });

      const result = await userRepository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: PublicUser[] = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (db.selectFrom as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          execute: vi.fn().mockResolvedValueOnce(users),
        }),
      });

      const result = await userRepository.findAll();

      expect(result).toEqual(users);
    });
  });
});
