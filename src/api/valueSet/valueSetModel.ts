import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { AnalystSearchFieldsSchema, AnalystSortColumnsSchema } from '@/api/analyst/analystModel';
import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const ValueSetSearchFieldsSchema = z.enum(['name']);
export type ValueSetSearchFields = z.infer<typeof ValueSetSearchFieldsSchema>;

export const ValueSetSortColumnsSchema = z.enum(['name']);
export type ValueSetSortColumn = z.infer<typeof ValueSetSortColumnsSchema>;

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
    searchField: AnalystSearchFieldsSchema.optional(),
    searchValue: z.string().optional(),
    sortBy: AnalystSortColumnsSchema.optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
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
