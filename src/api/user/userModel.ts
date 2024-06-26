import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  id: commonValidations.id,
  name: z.string(),
  email: commonValidations.email,
  password: commonValidations.password,
  created_at: z.date(),
  updated_at: z.date(),
});

export const PublicUserSchema = UserSchema.omit({ password: true });

export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const RegisterUserSchema = z.object({
  body: z.object({
    name: z.string(),
    email: commonValidations.email,
    password: commonValidations.password,
  }),
});

export const LoginUserSchema = z.object({
  body: z.object({
    email: commonValidations.email,
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

export interface RefreshTokenTable {
  id: Generated<number>;
  user_id: number;
  token: string;
  created_at: ColumnType<Date, Date | undefined, never>;
  expires_at: ColumnType<Date, Date | undefined, never>;
}

export type RefreshToken = Selectable<RefreshTokenTable>;
export type NewRefreshToken = Insertable<RefreshTokenTable>;
export type RefreshTokenUpdate = Updateable<RefreshTokenTable>;
