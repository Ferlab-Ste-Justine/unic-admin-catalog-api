import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const ValueSetCodeSchema = z.object({
  id: z.number().optional(),
  value_set_id: z.number().optional(),
  last_update: z.date().optional(),
  code: z.string(),
  label_fr: z.string(),
  label_en: z.string(),
});

export const GetValueSetCodeSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateValueSetCodeSchema = z.object({
  body: ValueSetCodeSchema.omit({ id: true, last_update: true }),
});

export const UpdateValueSetCodeSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: ValueSetCodeSchema.omit({ id: true, last_update: true, value_set_id: true }),
});

export const DeleteValueSetCodeSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export interface ValueSetCodeTable {
  id: Generated<number>;
  value_set_id: number;
  last_update: Date;
  code: string;
  label_fr: string;
  label_en: string;
}

export type ValueSetCode = Selectable<ValueSetCodeTable>;
export type NewValueSetCode = Insertable<ValueSetCodeTable>;
export type ValueSetCodeUpdate = Updateable<ValueSetCodeTable>;
