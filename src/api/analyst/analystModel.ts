import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const AnalystSearchFieldsSchema = z.enum(['name']);
export type AnalystSearchFields = z.infer<typeof AnalystSearchFieldsSchema>;

export const AnalystSortColumnsSchema = z.enum(['name']);
export type AnalystSortColumn = z.infer<typeof AnalystSortColumnsSchema>;

export const AnalystSchema = z.object({
  id: commonValidations.id,
  last_update: z.date(),
  name: z.string().max(255, 'name can have a maximum of 255 characters'),
});

export const GetAnalystsSchema = z.object({
  query: z.object({
    searchField: AnalystSearchFieldsSchema.optional(),
    searchValue: z.string().optional(),
    sortBy: AnalystSortColumnsSchema.optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const GetAnalystSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateAnalystSchema = z.object({
  body: z.object({
    name: z.string(),
  }),
});

export const UpdateAnalystSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: z.object({
    name: z.string(),
  }),
});

export const DeleteAnalystSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export interface AnalystTable {
  id: Generated<number>;
  last_update: Date;
  name: string;
}

export type Analyst = Selectable<AnalystTable>;
export type NewAnalyst = Insertable<AnalystTable>;
export type AnalystUpdate = Updateable<AnalystTable>;
