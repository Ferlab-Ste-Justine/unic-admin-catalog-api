import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { AnalystSearchFieldsSchema, AnalystSortColumnsSchema } from '@/api/analyst/analystModel';
import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const DictTableSearchFieldsSchema = z.enum(['name']);
export type DictTableSearchFields = z.infer<typeof DictTableSearchFieldsSchema>;

export const DictTableSortColumnsSchema = z.enum(['name']);
export type DictTableSortColumn = z.infer<typeof DictTableSortColumnsSchema>;

export const DictTableSchema = z.object({
  id: commonValidations.id,
  last_update: z.date().optional(),
  dictionary_id: z.number(),
  name: z.string().max(255, 'name can have a maximum of 255 characters'),
  entity_type: z.enum([
    'patient',
    'observation',
    'diagnosis',
    'medication',
    'procedure',
    'episode',
    'encounter',
    'delivery',
    'pregnancy',
  ]),
  domain: z
    .enum([
      'transfusion',
      'imaging',
      'medication',
      'pathology',
      'microbiology',
      'laboratory',
      'sociodemographics',
      'diagnosis',
      'pregnancy',
      'medical_history',
    ])
    .nullish(),
  label_en: z.string().max(500, 'label_en can have a maximum of 500 characters'),
  label_fr: z.string().max(500, 'label_fr can have a maximum of 500 characters'),
  row_filter: z.string().max(500, 'row_filter can have a maximum of 500 characters').nullish(),
  to_be_published: z.boolean(),
});

export const GetDictTablesSchema = z.object({
  query: z.object({
    searchField: AnalystSearchFieldsSchema.optional(),
    searchValue: z.string().optional(),
    sortBy: AnalystSortColumnsSchema.optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const GetDictTableSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateDictTableSchema = z.object({
  body: DictTableSchema.omit({ id: true, last_update: true }),
});

export const UpdateDictTableSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: DictTableSchema.omit({ id: true, last_update: true, dictionary_id: true }),
});

export interface DictTableTable {
  id: Generated<number>;
  last_update: Date;
  dictionary_id: number;
  name: string;
  entity_type:
    | 'patient'
    | 'observation'
    | 'diagnosis'
    | 'medication'
    | 'procedure'
    | 'episode'
    | 'encounter'
    | 'delivery'
    | 'pregnancy';
  domain:
    | 'transfusion'
    | 'imaging'
    | 'medication'
    | 'pathology'
    | 'microbiology'
    | 'laboratory'
    | 'sociodemographics'
    | 'diagnosis'
    | 'pregnancy'
    | 'medical_history'
    | null;
  label_en: string;
  label_fr: string;
  row_filter: string | null;
  to_be_published: boolean;
}

export type DictTable = Selectable<DictTableTable>;
export type NewDictTable = Insertable<DictTableTable>;
export type DictTableUpdate = Updateable<DictTableTable>;
