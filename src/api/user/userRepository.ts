import bcrypt from 'bcrypt';

import { db } from '@/db';
import { USER_TABLE } from '@/types';

import { NewUser, PublicUser, User } from './userModel';

export const userRepository = {
  create: async (user: NewUser): Promise<PublicUser> => {
    const { name, email, password } = user;

    const hashedPassword = await bcrypt.hash(password, 10);
    return await db
      .insertInto(USER_TABLE)
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

  findById: async (id: number): Promise<PublicUser | null> => {
    const result = await db
      .selectFrom(USER_TABLE)
      .where('id', '=', id)
      .select(['id', 'name', 'email', 'created_at', 'updated_at'])
      .executeTakeFirst();

    return result ?? null;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const result = await db.selectFrom(USER_TABLE).where('email', '=', email).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findAll: async (): Promise<PublicUser[]> => {
    return await db.selectFrom(USER_TABLE).select(['id', 'name', 'email', 'created_at', 'updated_at']).execute();
  },
};
