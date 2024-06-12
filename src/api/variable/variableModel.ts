import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const VariableSchema = z.object({
  id: z.number().optional(),
  last_update: z.date().optional(),
  table_id: z.number(),
  name: z.string(),
  path: z.string(),
  value_type: z.enum(['integer', 'boolean', 'string', 'decimal', 'date', 'datetime']),
  label_fr: z.string(),
  label_en: z.string(),
  value_set_id: z.number().optional(),
  from_variable_id: z.array(z.number()).optional(),
  derivation_algorithm: z.string().optional(),
  notes: z.string().optional(),
  variable_status: z.enum(['to_do', 'on_hold', 'in_progress', 'completed', 'delivered', 'removed']),
  rolling_version: z.enum(['obsolete', 'current', 'future']),
  to_be_published: z.boolean(),
});

export const GetVariablesSchema = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});

export const GetVariableSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateVariableSchema = z.object({
  body: VariableSchema.omit({ id: true, last_update: true }),
});

export const UpdateVariableSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: VariableSchema.omit({ id: true, last_update: true, table_id: true }),
});

export interface VariableTable {
  id: Generated<number>;
  last_update: Date;
  table_id: number;
  name: string;
  path: string;
  value_type: 'integer' | 'boolean' | 'string' | 'decimal' | 'date' | 'datetime';
  label_fr: string;
  label_en: string;
  value_set_id?: number;
  from_variable_id?: number[];
  derivation_algorithm?: string;
  notes?: string;
  variable_status: 'to_do' | 'on_hold' | 'in_progress' | 'completed' | 'delivered' | 'removed';
  rolling_version: 'obsolete' | 'current' | 'future';
  to_be_published: boolean;
}

export type Variable = Selectable<VariableTable>;
export type NewVariable = Insertable<VariableTable>;
export type VariableUpdate = Updateable<VariableTable>;
