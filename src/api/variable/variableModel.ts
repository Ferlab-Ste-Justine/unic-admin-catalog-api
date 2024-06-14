import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const VariableSearchFieldsSchema = z.enum(['name', 'path', 'value_type']);
export type VariableSearchFields = z.infer<typeof VariableSearchFieldsSchema>;

export const VariableSortColumnsSchema = z.enum(['name', 'path', 'value_type']);
export type VariableSortColumn = z.infer<typeof VariableSortColumnsSchema>;

export const VariableSchema = z.object({
  id: commonValidations.id,
  last_update: z.date().optional(),
  table_id: z.number(),
  name: z.string().max(255, 'name can have a maximum of 255 characters'),
  path: z.string().max(255, 'path can have a maximum of 255 characters'),
  value_type: z.enum(['integer', 'boolean', 'string', 'decimal', 'date', 'datetime']),
  label_fr: z.string().max(255, 'label_fr can have a maximum of 255 characters'),
  label_en: z.string().max(255, 'label_en can have a maximum of 255 characters'),
  value_set_id: z.number().nullish(),
  from_variable_id: z.array(z.number()).nullish(),
  derivation_algorithm: z.string().max(500, 'derivation_algorithm can have a maximum of 500 characters').nullish(),
  notes: z.string().max(255, 'notes can have a maximum of 255 characters').nullish(),
  variable_status: z.enum(['to_do', 'on_hold', 'in_progress', 'completed', 'delivered', 'removed']),
  rolling_version: z.enum(['obsolete', 'current', 'future']),
  to_be_published: z.boolean(),
  table_name: z.string().max(255, 'table_name can have a maximum of 255 characters').nullish(),
  value_set_name: z.string().max(255, 'value_set_name can have a maximum of 255 characters').nullish(),
});

export const GetVariablesSchema = z.object({
  query: z.object({
    searchField: VariableSearchFieldsSchema.optional(),
    searchValue: z.string().optional(),
    sortBy: VariableSortColumnsSchema.optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const GetVariableSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateVariableSchema = z.object({
  body: VariableSchema.omit({ id: true, last_update: true, table_name: true }),
});

export const UpdateVariableSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: VariableSchema.omit({ id: true, last_update: true, table_name: true }),
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
