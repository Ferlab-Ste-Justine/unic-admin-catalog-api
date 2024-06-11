import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const DictionarySchema = z.object({
  id: z.number().optional(),
  resource_id: z.number(),
  last_update: z.date(),
  current_version: z.number(),
  to_be_published: z.boolean(),
});

export const GetDictionarySchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateDictionarySchema = z.object({
  body: z.object({
    resource_id: z.number(),
    current_version: z.number(),
    to_be_published: z.boolean(),
  }),
});

export const UpdateDictionarySchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: z.object({
    resource_id: z.number().optional(),
    current_version: z.number().optional(),
    to_be_published: z.boolean().optional(),
  }),
});

export const DeleteDictionarySchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export interface DictionaryTable {
  id: Generated<number>;
  resource_id: number;
  last_update: Date;
  current_version: number;
  to_be_published: boolean;
}

export type Dictionary = Selectable<DictionaryTable>;
export type NewDictionary = Insertable<DictionaryTable>;
export type DictionaryUpdate = Updateable<DictionaryTable>;
