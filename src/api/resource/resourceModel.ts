import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export const ResourceSearchFieldsSchema = z.enum(['name', 'code']);
export type ResourceSearchFields = z.infer<typeof ResourceSearchFieldsSchema>;

export const ResourceSortColumnsSchema = z.enum(['name', 'code']);
export type ResourceSortColumn = z.infer<typeof ResourceSortColumnsSchema>;

export const ResourceSchema = z.object({
  id: commonValidations.id,
  last_update: z.date().nullish(),
  code: z.string().max(20, 'code can have a maximum of 20 characters'),
  name: z.string().max(255, 'name can have a maximum of 255 characters'),
  title: z.string().max(255, 'title can have a maximum of 255 characters').nullish(),
  resource_type: z.enum(['warehouse', 'research_project', 'resource_project', 'eqp', 'source_system']),
  description_en: z.string().max(1000, 'description_en can have a maximum of 1000 characters'),
  description_fr: z.string().max(1000, 'description_fr can have a maximum of 1000 characters'),
  principal_investigator: z.string().max(500, 'principal_investigator can have a maximum of 500 characters').nullish(),
  erb_project_id: z.string().max(255, 'erb_project_id can have a maximum of 255 characters').nullish(),
  project_creation_date: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullish()),
  project_active: z.enum(['completed', 'active']).nullish(),
  project_status: z.enum(['on hold', 'in review', 'in progress', 'delivered']).nullish(),
  project_approved: z.boolean().nullish(),
  project_folder: z.string().max(255, 'project_folder can have a maximum of 255 characters').nullish(),
  project_approval_date: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullish()),
  project_completion_date: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullish()),
  to_be_published: z.boolean(),
  system_database_type: z.string().max(255, 'system_database_type can have a maximum of 255 characters').nullish(),
  analyst_id: z.number().nullish(),
  system_collection_starting_year: z.number().nullish(),
  analyst_name: z.string().max(255, 'analyst_name can have a maximum of 255 characters').nullish(),
});

export const GetResourcesSchema = z.object({
  query: z.object({
    searchField: ResourceSearchFieldsSchema.optional(),
    searchValue: z.string().optional(),
    sortBy: ResourceSortColumnsSchema.optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const GetResourceSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const CreateResourceSchema = z.object({
  body: ResourceSchema.omit({ id: true, last_update: true, analyst_name: true }),
});

export const UpdateResourceSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: ResourceSchema.omit({ id: true, last_update: true, analyst_name: true }),
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
  analyst_id?: number;
  system_collection_starting_year: number | null;
  analyst_name: string | null;
}

export type Resource = Selectable<ResourceTable>;
export type NewResource = Insertable<ResourceTable>;
export type ResourceUpdate = Updateable<ResourceTable>;
