import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const ResourceSchema = z.object({
  id: z.number().optional(),
  last_update: z.date().optional(),
  code: z.string().max(20),
  name: z.string().max(255),
  title: z.string().max(255).optional(),
  resource_type: z.enum(['warehouse', 'research_project', 'resource_project', 'eqp', 'source_system']),
  description_en: z.string().max(1000),
  description_fr: z.string().max(1000),
  principal_investigator: z.string().max(500).optional(),
  erb_project_id: z.string().max(255).optional(),
  project_creation_date: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional()),
  project_active: z.enum(['completed', 'active']).optional(),
  project_status: z.enum(['on hold', 'in review', 'in progress', 'delivered']).optional(),
  project_approved: z.boolean().optional(),
  project_folder: z.string().max(255).optional(),
  project_approval_date: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional()),
  project_completion_date: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional()),
  to_be_published: z.boolean(),
  system_database_type: z.string().max(255).optional(),
  analyst_id: z.number().optional(),
  system_collection_starting_year: z.number().optional(),
});

export const GetResourcesSchema = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});

export const GetResourceSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateResourceSchema = z.object({
  body: ResourceSchema.omit({ id: true, last_update: true }),
});

export const UpdateResourceSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: ResourceSchema.omit({ id: true, last_update: true }),
});

export const DeleteResourceSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export interface ResourceTable {
  id: Generated<number>;
  last_update: Date;
  code: string;
  name: string;
  title: string | null;
  resource_type: 'warehouse' | 'research_project' | 'resource_project' | 'eqp' | 'source_system';
  description_en: string;
  description_fr: string;
  principal_investigator: string | null;
  erb_project_id: string | null;
  project_creation_date: Date | null;
  project_active: 'completed' | 'active' | null;
  project_status: 'on hold' | 'in review' | 'in progress' | 'delivered' | null;
  project_approved: boolean | null;
  project_folder: string | null;
  project_approval_date: Date | null;
  project_completion_date: Date | null;
  to_be_published: boolean;
  system_database_type: string | null;
  analyst_id: number | null;
  system_collection_starting_year: number | null;
}

export type Resource = Selectable<ResourceTable>;
export type NewResource = Insertable<ResourceTable>;
export type ResourceUpdate = Updateable<ResourceTable>;
