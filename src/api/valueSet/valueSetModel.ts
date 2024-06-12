import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const ValueSetSchema = z.object({
  id: commonValidations.id,
  last_update: z.date(),
  name: z.string().max(255, 'name can have a maximum of 255 characters'),
  description_en: z.string().max(1000, 'description_en can have a maximum of 1000 characters').nullish(),
  description_fr: z.string().max(1000, 'description_fr can have a maximum of 1000 characters').nullish(),
  url: z.string().max(255, 'url can have a maximum of 255 characters').nullish(),
});

export const GetValueSetsSchema = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});

export const GetValueSetSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateValueSetSchema = z.object({
  body: ValueSetSchema.omit({ id: true, last_update: true }),
});

export const UpdateValueSetSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: ValueSetSchema.omit({ id: true, last_update: true }),
});

export const DeleteValueSetSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export interface ValueSetTable {
  id: Generated<number>;
  last_update: Date;
  name: string;
  description_en: string | null;
  description_fr: string | null;
  url: string | null;
}

export type ValueSet = Selectable<ValueSetTable>;
export type NewValueSet = Insertable<ValueSetTable>;
export type ValueSetUpdate = Updateable<ValueSetTable>;
