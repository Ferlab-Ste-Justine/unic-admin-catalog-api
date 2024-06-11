import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const DictTableSchema = z.object({
  id: z.number().optional(),
  last_update: z.date().optional(),
  dictionary_id: z.number(),
  name: z.string(),
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
    .nullable(),
  label_en: z.string(),
  label_fr: z.string(),
  row_filter: z.string().optional(),
  to_be_published: z.boolean(),
});

export const GetDictTablesSchema = z.object({
  query: z.object({
    name: z.string().optional(),
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
