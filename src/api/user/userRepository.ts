import bcrypt from 'bcrypt';

import { db } from '@/db';
import { REFRESH_TOKEN_TABLE, USER_TABLE } from '@/types';

import { NewUser, PublicUser, RefreshToken, User } from './userModel';

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

  saveRefreshToken: async (user_id: number, token: string): Promise<void> => {
    await db
      .insertInto(REFRESH_TOKEN_TABLE)
      .values({
        user_id,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .execute();
  },

  findRefreshToken: async (token: string): Promise<RefreshToken | null> => {
    const result = await db.selectFrom(REFRESH_TOKEN_TABLE).where('token', '=', token).selectAll().executeTakeFirst();

    return result ?? null;
  },

  deleteRefreshToken: async (user_id: number): Promise<void> => {
    await db.deleteFrom(REFRESH_TOKEN_TABLE).where('user_id', '=', user_id).execute();
  },
};
