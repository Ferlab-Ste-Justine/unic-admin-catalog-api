import bcrypt from 'bcrypt';

import { db } from '@/db';

import { NewUser, PublicUser, User } from './userModel';

export const userRepository = {
  createUser: async (user: NewUser): Promise<PublicUser> => {
    const { name, email, password } = user;

    const existingUser = await db.selectFrom('catalog.user').where('email', '=', email).select('id').execute();
    if (existingUser.length > 0) {
      throw new Error('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await db
      .insertInto('catalog.user')
      .values({
        name,
        email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning(['id', 'name', 'email', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();
  },

  findUserByEmail: async (email: string): Promise<User | null> => {
    const result = await db.selectFrom('catalog.user').where('email', '=', email).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findAllUsers: async (): Promise<PublicUser[]> => {
    return await db.selectFrom('catalog.user').select(['id', 'name', 'email', 'created_at', 'updated_at']).execute();
  },

  findUserById: async (id: number): Promise<PublicUser | null> => {
    const result = await db
      .selectFrom('catalog.user')
      .where('id', '=', id)
      .select(['id', 'name', 'email', 'created_at', 'updated_at'])
      .executeTakeFirst();

    return result ?? null;
  },
};
