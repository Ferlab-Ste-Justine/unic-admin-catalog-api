import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const ValueSetSchema = z.object({
  id: z.number().optional(),
  last_update: z.date(),
  name: z.string(),
  description_en: z.string().max(1000).nullable(),
  description_fr: z.string().max(1000).nullable(),
  url: z.string().max(255).nullable(),
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
  body: z.object({
    name: z.string(),
    description_en: z.string().max(1000).nullable(),
    description_fr: z.string().max(1000).nullable(),
    url: z.string().max(255).nullable(),
  }),
});

export const UpdateValueSetSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: z.object({
    name: z.string().optional(),
    description_en: z.string().max(1000).nullable().optional(),
    description_fr: z.string().max(1000).nullable().optional(),
    url: z.string().max(255).nullable().optional(),
  }),
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
