import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  id: commonValidations.id,
  name: z.string(),
  email: z.string().email('Invalid email address'),
  password: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const RegisterUserSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email('Invalid email address'),
    password: commonValidations.password,
  }),
});

export const LoginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string(),
  }),
});

export interface UserTable {
  id: Generated<number>;
  name: string;
  email: string;
  password: string;
  created_at: ColumnType<Date, Date | undefined, never>;
  updated_at: ColumnType<Date, Date | undefined, never>;
}

export type User = Selectable<UserTable>;
export type PublicUser = Omit<User, 'password'>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
