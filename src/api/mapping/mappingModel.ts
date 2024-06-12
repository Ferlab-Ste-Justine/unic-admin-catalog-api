import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const MappingSchema = z.object({
  id: z.number().optional(),
  last_update: z.date().optional(),
  value_set_code_id: z.number(),
  original_value: z.string(),
});

export const GetMappingSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateMappingSchema = z.object({
  body: MappingSchema.omit({ id: true, last_update: true }),
});

export const UpdateMappingSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: MappingSchema.omit({ id: true, last_update: true }),
});

export interface MappingTable {
  id: Generated<number>;
  last_update: Date;
  value_set_code_id: number;
  original_value: string;
}

export type Mapping = Selectable<MappingTable>;
export type NewMapping = Insertable<MappingTable>;
export type MappingUpdate = Updateable<MappingTable>;
