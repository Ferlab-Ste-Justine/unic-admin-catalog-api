import bcrypt from 'bcrypt';

import { db } from '@/db';

import { NewUser, PublicUser, User } from './userModel';

export const userRepository = {
  create: async (user: NewUser): Promise<PublicUser> => {
    const { name, email, password } = user;

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

  findById: async (id: number): Promise<PublicUser | null> => {
    const result = await db
      .selectFrom('catalog.user')
      .where('id', '=', id)
      .select(['id', 'name', 'email', 'created_at', 'updated_at'])
      .executeTakeFirst();

    return result ?? null;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const result = await db.selectFrom('catalog.user').where('email', '=', email).selectAll().executeTakeFirst();

    return result ?? null;
  },

  findAll: async (): Promise<PublicUser[]> => {
    return await db.selectFrom('catalog.user').select(['id', 'name', 'email', 'created_at', 'updated_at']).execute();
  },
};
